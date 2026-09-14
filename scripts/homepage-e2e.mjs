/**
 * Local browser acceptance. Run against a fresh production preview:
 *   E2E_BASE_URL=http://127.0.0.1:4183 npm run test:e2e
 * Uses an installed Playwright or PLAYWRIGHT_MODULE / NODE_PATH from the test runtime.
 * Formspree responses are intercepted. No real applications or non-GET requests leave the browser.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:4182'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Acceptance must run against a local site')
const output = resolve('artifacts/homepage-e2e')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
let interceptedSubmissions = 0

async function check(name, run) {
  const started = Date.now()
  try {
    await run()
    results.push({ name, passed: true, ms: Date.now() - started })
    console.log(`PASS ${name}`)
  } catch (error) {
    results.push({ name, passed: false, error: error.stack, ms: Date.now() - started })
    console.error(`FAIL ${name}: ${error.message}`)
  }
}

async function session(options = {}, submitHandler) {
  const context = await browser.newContext({ viewport: { width: 1448, height: 1086 }, colorScheme: 'light', ...options })
  // Safety guard applies even to unexpected analytics or an incorrectly configured form URL.
  await context.route('**/*', async route => {
    const request = route.request()
    if (new URL(request.url()).hostname === 'formspree.io' && submitHandler) {
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST', 'access-control-allow-headers': '*' } })
      if (request.method() === 'POST') {
        interceptedSubmissions++
        return submitHandler(route)
      }
    }
    if (!['GET', 'HEAD'].includes(request.method())) return route.abort('blockedbyclient')
    return route.continue()
  })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.url().startsWith(base) && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`)
  })
  return { context, page, errors }
}

async function home(page, locale = 'en') {
  await page.goto(`${base}${locale === 'zh' ? '/zh/' : '/'}`)
  await page.locator('.home-headline').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.home-headline')).fontFamily.includes('TikTok Sans'))
  // Allow entrance and the first glitch burst to finish before comparing resting visuals.
  await page.waitForTimeout(1550)
}

async function screenshot(page, name, fullPage = false) {
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage })
}

async function assertEditorialTheme(page, dark) {
  const colors = await page.evaluate(() => {
    const style = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo)
    return {
      ribbon: style('.home-runtime', '::before').backgroundColor,
      ribbonEdge: style('.home-runtime', '::after').backgroundColor,
      ribbonText: style('.home-runtime p').color,
      title: style('.home-headline__accent', '::before').backgroundColor,
      titleText: style('.home-headline__ink').color,
      number: style('.home-steps li > span').backgroundColor,
      numberText: style('.home-steps li > span').color,
      chat: style('.home-mechanics article:nth-child(3) .home-mechanics__label').backgroundColor,
      builder: style('.home-builder').backgroundColor,
      builderTitle: style('.home-builder h2').color,
      builderLink: style('.home-builder a').color,
      caption: style('.home-live-demo__caption h2').color,
    }
  })
  const paper = dark ? 'rgb(255, 255, 255)' : 'rgb(16, 16, 20)'
  const ink = dark ? 'rgb(16, 16, 20)' : 'rgb(255, 255, 255)'
  for (const key of ['ribbon', 'ribbonEdge', 'title', 'number']) assert.equal(colors[key], paper, `${key} did not follow the selected theme`)
  for (const key of ['ribbonText', 'titleText', 'numberText']) assert.equal(colors[key], ink, `${key} lost contrast on its background`)
  assert.equal(colors.caption, 'rgb(255, 255, 255)', 'Video caption must not invert with editorial paper')
  if (dark) {
    assert.equal(colors.chat, paper)
    assert.equal(colors.builder, paper)
    assert.equal(colors.builderTitle, ink)
    assert.equal(colors.builderLink, ink)
  }
}

async function layout(page) {
  return page.evaluate(() => {
    const rect = element => {
      const { left, right, top, bottom, width, height } = element.getBoundingClientRect()
      return { left, right, top, bottom, width, height }
    }
    const video = document.querySelector('.home-live-demo video')
    const headline = document.querySelector('.home-headline')
    return {
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      family: getComputedStyle(headline).fontFamily,
      headline: rect(headline), accent: rect(document.querySelector('.home-headline__accent')),
      video: { ...rect(video), fit: getComputedStyle(video).objectFit, muted: video.muted, loop: video.loop },
      cards: [...document.querySelectorAll('.home-mechanics article')].map(card => ({
        card: rect(card), label: rect(card.querySelector('.home-mechanics__label')), icon: rect(card.querySelector('svg')), heading: rect(card.querySelector('h3')),
      })),
    }
  })
}

try {
  for (const [locale, colorScheme, width, height] of [
    ['en', 'light', 1448, 1086], ['en', 'dark', 1448, 1086],
    ['zh', 'light', 1448, 1086], ['zh', 'dark', 1448, 1086],
    ['en', 'light', 390, 844], ['en', 'dark', 390, 844],
    ['zh', 'light', 390, 844], ['zh', 'dark', 390, 844],
    ['en', 'light', 320, 760], ['zh', 'light', 320, 760],
    ['en', 'light', 768, 1024], ['en', 'dark', 1920, 1080],
  ]) {
    await check(`${locale}-${colorScheme}-${width}: layout and visual capture`, async () => {
      const { context, page, errors } = await session({ colorScheme, viewport: { width, height } })
      try {
        await home(page, locale)
        assert.equal(await page.locator('html').evaluate(element => element.classList.contains('dark')), colorScheme === 'dark')
        await assertEditorialTheme(page, colorScheme === 'dark')
        const state = await layout(page)
        assert.ok(state.scrollWidth <= width, `Horizontal overflow: ${state.scrollWidth} > ${width}`)
        assert.ok(state.accent.left >= 0 && state.accent.right <= width, 'Keyword is clipped')
        assert.equal(state.video.fit, 'contain')
        assert.ok(state.video.muted && state.video.loop)
        assert.ok(Math.abs(state.video.width / state.video.height - 16 / 9) < 0.01, 'Video is not complete 16:9')
        assert.equal(state.cards.length, 3)
        for (const { card, label, icon, heading } of state.cards) {
          assert.ok(card.left >= 0 && card.right <= width, 'Card is clipped')
          assert.ok(label.right + 4 <= icon.left, 'Card label overlaps the icon')
          assert.ok(heading.top >= icon.bottom - 4, 'Card heading overlaps the icon row')
        }
        assert.ok(state.family.includes('Microsoft YaHei'), 'Chinese sans-serif fallback is missing')
        await page.locator('.home-live-demo video').evaluate(video => video.pause())
        await screenshot(page, `${locale}-${colorScheme}-${width}`)
        if (width === 1448 || width === 390) await screenshot(page, `${locale}-${colorScheme}-${width}-full`, true)
        assert.deepEqual(errors, [])
      } finally { await context.close() }
    })
  }

  await check('Theme switch, language menu, mobile menu and local search', async () => {
    const { context, page, errors } = await session()
    try {
      await home(page)
      await page.locator('.VPNavBarAppearance [role="switch"]').click()
      await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
      await page.waitForTimeout(650)
      await assertEditorialTheme(page, true)
      await page.reload()
      await page.locator('.home-headline').waitFor()
      assert.equal(await page.locator('html').evaluate(e => e.classList.contains('dark')), true, 'Theme preference did not persist')
      await page.getByRole('button', { name: 'Change language' }).click()
      await page.locator('.VPNavBarTranslations a[href="/zh/"]').click()
      await page.waitForURL('**/zh/')
      await page.waitForFunction(() => document.querySelector('h1')?.textContent.includes('改变游戏'))
      await page.locator('.VPNavBarSearchButton').click()
      const search = page.locator('#localsearch-input')
      await search.fill('WebSocket')
      await page.locator('.VPLocalSearchBox .result').first().waitFor()
      await page.keyboard.press('Escape')
      await page.setViewportSize({ width: 390, height: 844 })
      await page.locator('.VPNavBarHamburger').click()
      await page.locator('.VPNavScreen a[href="/zh/apply"], .VPNavScreen a[href="/zh/apply.html"]').click()
      await page.waitForURL(url => url.pathname.replace(/\.html$/, '') === '/zh/apply')
      await page.locator('.apply-shell form').waitFor()
      assert.equal(await page.locator('html').evaluate(e => e.classList.contains('dark')), true)
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  })

  await check('Home CTAs, event cards, demo gallery and external-link semantics', async () => {
    const { context, page, errors } = await session()
    try {
      for (const locale of ['en', 'zh']) {
        const prefix = locale === 'zh' ? '/zh' : ''
        for (const [selector, target] of [
          ['.VPHomeHero .VPButton.brand', '/apply'], ['.VPHomeHero .VPButton.alt', '/guide/quick-start'],
          ['.home-mechanics article:nth-child(1) a', '/events/live-like'],
          ['.home-mechanics article:nth-child(2) a', '/reference/gift-catalog'],
          ['.home-mechanics article:nth-child(3) a', '/events/live-chat'],
          ['.tt-demo-showcase__header > a', '/demos/'],
        ]) {
          await home(page, locale)
          await page.locator(selector).click()
          await page.waitForURL(url => url.pathname.replace(/\.html$/, '') === `${prefix}${target}`)
          await page.locator('.home-headline').waitFor({ state: 'detached' })
          await page.locator('h1').first().waitFor({ state: 'visible' })
          assert.ok(await page.locator('h1').first().isVisible(), `Destination has no visible title: ${target}`)
        }
        const demos = page.locator('.tt-demo-card .tt-demo-button[target="_blank"]')
        assert.equal(await demos.count(), 2)
        for (const link of await demos.all()) {
          assert.ok((await link.getAttribute('href')).startsWith('https://'))
          assert.match(await link.getAttribute('rel'), /noreferrer|noopener/)
        }
      }
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  })

  await check('Video keyboard controls and one coordinated five-second glitch', async () => {
    const { context, page, errors } = await session({ colorScheme: 'dark' })
    try {
      await home(page)
      const video = page.locator('.home-live-demo video')
      await page.waitForFunction(() => document.querySelector('.home-live-demo video').readyState >= 2)
      await video.focus()
      if (await video.evaluate(v => v.paused)) await video.press('Enter')
      await page.waitForFunction(() => !document.querySelector('.home-live-demo video').paused)
      await video.press('Space')
      assert.equal(await video.evaluate(v => v.paused), true)
      await video.press('Enter')
      await page.waitForFunction(() => !document.querySelector('.home-live-demo video').paused)
      await video.evaluate(v => v.pause())
      const seekGlitch = async time => page.locator('.home-headline').evaluate((headline, time) => {
        for (const animation of headline.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 420 + time }
        const ink = headline.querySelector('.home-headline__ink')
        const animation = ink.getAnimations()[0]
        return { timing: animation.effect.getTiming(), transform: getComputedStyle(ink).transform, height: headline.offsetHeight }
      }, time)
      const active = await seekGlitch(250)
      assert.equal(active.timing.duration, 5000)
      assert.equal(active.timing.iterations, Infinity)
      assert.notEqual(active.transform, 'none')
      await screenshot(page, 'glitch-active')
      const resting = await seekGlitch(1100)
      assert.equal(resting.transform, 'none')
      assert.equal(resting.height, active.height, 'Glitch shifts the document layout')
      assert.equal((await seekGlitch(4500)).transform, 'none', 'There is a second flash late in the cycle')
      await screenshot(page, 'glitch-resting')
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  })

  await check('Reduced-motion mode keeps text still and video paused until requested', async () => {
    const { context, page } = await session({ reducedMotion: 'reduce' })
    try {
      await home(page)
      assert.equal(await page.locator('.home-headline__ink').evaluate(e => getComputedStyle(e).animationName), 'none')
      assert.equal(await page.locator('.home-live-demo video').evaluate(v => v.paused), true)
      await page.locator('.home-live-demo video').focus()
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => !document.querySelector('.home-live-demo video').paused)
    } finally { await context.close() }
  })

  for (const locale of ['en', 'zh']) {
    await check(`${locale}: Home → Apply → validation → mocked rejection → mocked success`, async () => {
      let submissions = 0
      const { context, page, errors } = await session({ viewport: { width: locale === 'zh' ? 390 : 1448, height: 1000 } }, async route => {
        submissions++
        assert.ok(route.request().postData().includes('developer@example.test'))
        assert.ok(route.request().postData().includes('LikeMessage'))
        return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(submissions === 1 ? { errors: [{ message: 'Mock rejection' }] } : { ok: true, next: '/thanks' }) })
      })
      try {
        await home(page, locale)
        await page.locator('.VPHomeHero .VPButton.brand').click()
        const next = page.locator('.form-actions .form-button--primary')
        await next.click()
        assert.equal(await page.locator('[data-form-step="0"]').isVisible(), true, 'Empty fields advance the form')
        for (const [name, value] of Object.entries({ full_name: 'E2E Test — not sent', email: 'developer@example.test', country_or_region: 'Singapore', role: 'Game developer' })) await page.locator(`[name="${name}"]`).fill(value)
        await next.click()
        await page.locator('[name="game_name"]').fill('Local acceptance demo')
        await page.locator('[name="game_description"]').fill('A local UI acceptance test with intercepted networking.')
        await page.locator('[name="technology_stack"]').selectOption({ index: 1 })
        await page.locator('[name="testing_timeline"]').selectOption({ index: 1 })
        await page.locator('.form-button--secondary').click()
        assert.equal(await page.locator('[name="full_name"]').inputValue(), 'E2E Test — not sent')
        await next.click()
        await next.click()
        await next.click()
        await page.locator('.field-error').waitFor()
        assert.equal(submissions, 0)
        await page.locator('.event-option').filter({ has: page.locator('input[value="LikeMessage"]') }).click()
        await page.locator('[name="interaction_design"]').fill('Likes charge a shared energy bar.')
        await page.locator('.consent-field').click()
        await next.click()
        await page.locator('.form-error').waitFor()
        assert.equal(submissions, 1)
        assert.equal(await page.locator('[name="interaction_design"]').inputValue(), 'Likes charge a shared energy bar.')
        assert.equal(await page.locator('.form-error').evaluate(e => document.activeElement === e), true)
        await next.click()
        await page.locator('.submission-success').waitFor()
        assert.equal(submissions, 2)
        assert.equal(await page.locator('.submission-success').evaluate(e => document.activeElement === e), true)
        assert.equal(await page.locator('form').count(), 0)
        await screenshot(page, `${locale}-apply-mocked-success`, true)
        assert.deepEqual(errors, [])
      } finally { await context.close() }
    })
  }
} finally {
  await browser.close()
  const report = { base, browser: 'Chromium headless, isolated contexts', realSubmissions: 0, interceptedSubmissions, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results }
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`\n${report.passed} passed, ${report.failed} failed; ${interceptedSubmissions} mocked submissions, 0 real submissions. Report: ${output}`)
  if (report.failed) process.exitCode = 1
}
