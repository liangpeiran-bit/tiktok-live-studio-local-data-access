/** Isolated Apply acceptance. All submissions are intercepted; no real application is sent. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:4182'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const output = resolve('artifacts/apply-e2e')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
let mockedSubmissions = 0

async function check(name, options, run, submitHandler) {
  const context = await browser.newContext({ viewport: { width: 1448, height: 1086 }, colorScheme: 'light', ...options })
  await context.route('**/*', async route => {
    const request = route.request()
    if (new URL(request.url()).hostname === 'formspree.io' && submitHandler) {
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST', 'access-control-allow-headers': '*' } })
      if (request.method() === 'POST') { mockedSubmissions++; return submitHandler(route) }
    }
    return ['GET', 'HEAD'].includes(request.method()) ? route.continue() : route.abort()
  })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.url().startsWith(base) && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`)
  })
  try {
    await run(page)
    assert.deepEqual(errors, [])
    results.push({ name, passed: true })
    console.log(`PASS ${name}`)
  } catch (error) {
    results.push({ name, passed: false, error: error.stack })
    console.error(`FAIL ${name}: ${error.message}`)
  } finally { await context.close() }
}

async function open(page, locale = 'en') {
  await page.goto(`${base}${locale === 'zh' ? '/zh' : ''}/apply`)
  await page.locator('.apply-shell form').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(650)
}
async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage })
}
async function identity(page) {
  for (const [name, value] of Object.entries({ full_name: 'UI acceptance — not submitted', email: 'developer@example.test', country_or_region: 'Singapore', role: 'Game developer' })) await page.locator(`[name="${name}"]`).fill(value)
  await page.locator('.form-actions .form-button--primary').click()
}
async function game(page) {
  await page.locator('[name="game_name"]').fill('Local UI test')
  await page.locator('[name="game_description"]').fill('An isolated UI check. No real application will be submitted.')
  await page.locator('[name="technology_stack"]').selectOption({ index: 1 })
  await page.locator('[name="testing_timeline"]').selectOption({ index: 1 })
  await page.locator('.form-actions .form-button--primary').click()
}
async function layout(page, step) {
  await page.waitForTimeout(220)
  assert.equal(await page.locator('.form-step:visible').getAttribute('data-form-step'), String(step))
  assert.equal(await page.locator('.form-progress [aria-current="step"]').count(), 1)
  const state = await page.evaluate(() => {
    const rect = e => { const { left, right, top, bottom, width, height } = e.getBoundingClientRect(); return { left, right, top, bottom, width, height } }
    const active = document.querySelector('.form-progress .is-active')
    const label = active.querySelector('strong')
    const shell = document.querySelector('.apply-shell')
    return {
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      active: { background: getComputedStyle(active).backgroundColor, color: getComputedStyle(label).color, shadow: getComputedStyle(active).boxShadow },
      progress: [...document.querySelectorAll('.form-progress li')].map(e => ({ cell: rect(e), text: rect(e.querySelector('strong')) })),
      intro: rect(document.querySelector('.application-intro')), guide: rect(document.querySelector('.application-guide')), shell: rect(shell),
      controls: [...document.querySelectorAll('.form-step input:not([type="checkbox"]), .form-step select, .form-actions button')].filter(e => e.offsetWidth > 0).map(rect),
      formScroll: getComputedStyle(shell).overflowY,
      events: [...document.querySelectorAll('.form-step:has(.event-options) .event-option')].filter(e => e.offsetWidth > 0).map(e => ({ card: rect(e), icon: rect(e.querySelector('svg')), copy: rect(e.querySelector('.event-option__copy')), position: getComputedStyle(e.querySelector('svg')).position })),
    }
  })
  assert.ok(state.scrollWidth <= state.width, 'Horizontal page overflow')
  assert.equal(state.active.background, 'rgb(1, 1, 1)')
  assert.equal(state.active.color, 'rgb(244, 245, 247)')
  assert.ok(state.active.shadow.includes('rgb(37, 244, 238)') && state.active.shadow.includes('rgb(254, 44, 85)'))
  for (const { cell, text } of state.progress) assert.ok(text.left >= cell.left && text.right <= cell.right && text.bottom <= cell.bottom, 'Progress label clipped')
  for (const control of state.controls) assert.ok(control.height >= 48 && control.left >= 0 && control.right <= state.width, 'Control size or bounds are incorrect')
  assert.ok(!['auto', 'scroll'].includes(state.formScroll), 'Nested form scroller')
  assert.equal(await page.locator('.VPLocalNav:visible').count(), 0, 'Docs navigation overlays the form')
  for (const { card, icon, copy, position } of state.events) {
    assert.equal(position, 'static', 'Homepage absolute icon positioning leaked into the form')
    assert.ok(icon.left >= card.left + 12 && icon.right <= card.right - 12, 'Event icon outside card padding')
    if (state.width <= 620) assert.ok(icon.right + 4 <= copy.left, 'Event icon overlaps mobile copy')
    else assert.ok(icon.bottom + 4 <= copy.top, 'Event icon overlaps desktop copy')
  }
  if (state.width < 960) assert.ok(state.shell.top >= state.intro.bottom && state.guide.top >= state.shell.bottom, 'Mobile form must precede the access guide')
  else assert.ok(state.shell.left > state.intro.right && state.guide.right < state.shell.left, 'Desktop guide must stay beside the form')
}

try {
  for (const [locale, colorScheme, width] of [
    ['en', 'light', 1448], ['en', 'dark', 1448], ['zh', 'light', 1448], ['zh', 'dark', 1448],
    ['en', 'light', 390], ['en', 'dark', 390], ['zh', 'light', 390], ['zh', 'dark', 390],
    ['en', 'light', 320], ['zh', 'dark', 768], ['en', 'light', 1024],
  ]) {
    await check(`${locale}-${colorScheme}-${width}: all three steps and selected event design`, { colorScheme, viewport: { width, height: width < 960 ? 844 : 1086 } }, async page => {
      await open(page, locale)
      assert.equal(await page.locator('html').evaluate(e => e.classList.contains('dark')), colorScheme === 'dark')
      await layout(page, 0)
      await capture(page, `${locale}-${colorScheme}-${width}-about`, true)
      await identity(page)
      await layout(page, 1)
      await capture(page, `${locale}-${colorScheme}-${width}-game`, true)
      await game(page)
      await layout(page, 2)
      const event = page.locator('.event-option').filter({ has: page.locator('input[value="LikeMessage"]') })
      await event.click()
      await page.waitForTimeout(220)
      const selected = await event.evaluate(e => ({ background: getComputedStyle(e).backgroundColor, text: getComputedStyle(e.querySelector('strong')).color, check: getComputedStyle(e.querySelector('.event-option__check')).backgroundColor, tick: getComputedStyle(e.querySelector('.event-option__check'), '::after').borderBottomColor, icon: e.querySelector('svg')?.getAttribute('aria-hidden') }))
      assert.equal(selected.background, 'rgb(1, 1, 1)')
      assert.equal(selected.text, 'rgb(244, 245, 247)')
      assert.equal(selected.check, 'rgb(37, 244, 238)')
      assert.equal(selected.tick, 'rgb(1, 1, 1)')
      assert.equal(selected.icon, 'true')
      await capture(page, `${locale}-${colorScheme}-${width}-events`, true)
    })
  }

  for (const locale of ['en', 'zh']) {
    let releaseFirst
    let attempts = 0
    await check(`${locale}: validation, theme change, back, keyboard selection, loading, rejection and success`, { viewport: { width: locale === 'zh' ? 390 : 1448, height: 1086 } }, async page => {
      await open(page, locale)
      const next = page.locator('.form-actions .form-button--primary')
      await next.click()
      await layout(page, 0)
      await identity(page)
      await page.locator('.form-button--secondary').click()
      assert.equal(await page.locator('[name="email"]').inputValue(), 'developer@example.test')
      if (locale === 'en') {
        await page.locator('.VPNavBarAppearance [role="switch"]').click()
        await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
        assert.equal(await page.locator('[name="email"]').inputValue(), 'developer@example.test')
      }
      await next.click()
      await game(page)
      await next.click()
      await page.locator('.field-error').waitFor()
      assert.equal(attempts, 0)
      await page.keyboard.press('Tab')
      const event = page.locator('.event-option input[value="LikeMessage"]')
      await event.focus()
      await page.keyboard.press('Space')
      assert.equal(await event.isChecked(), true)
      assert.equal(await event.evaluate(e => getComputedStyle(e.nextElementSibling).outlineStyle), 'solid')
      await page.locator('[name="interaction_design"]').fill('Likes charge team energy.')
      await page.locator('.consent-field').click()
      await next.click()
      await page.waitForFunction(() => document.querySelector('.form-actions button[type="submit"]')?.disabled)
      assert.ok(releaseFirst, 'Mock request was not intercepted')
      assert.equal(await page.locator('.form-button--secondary').isDisabled(), true)
      await page.locator('form').evaluate(e => e.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
      assert.equal(attempts, 1, 'Duplicate submission was not prevented')
      await capture(page, `${locale}-submitting`)
      releaseFirst()
      await page.locator('.form-error').waitFor()
      assert.equal(await page.locator('.form-error').evaluate(e => document.activeElement === e), true)
      assert.equal(await page.locator('[name="interaction_design"]').inputValue(), 'Likes charge team energy.')
      await capture(page, `${locale}-rejected`)
      await next.click()
      await page.locator('.submission-success').waitFor()
      assert.equal(attempts, 2)
      assert.equal(await page.locator('.submission-success').evaluate(e => document.activeElement === e), true)
      assert.equal(await page.locator('form').count(), 0)
      await page.waitForTimeout(300)
      await capture(page, `${locale}-success`, true)
    }, async route => {
      attempts++
      assert.ok(route.request().postData().includes('developer@example.test'))
      if (attempts === 1) await new Promise(resolve => { releaseFirst = resolve })
      return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify(attempts === 1 ? { errors: [{ message: 'Local test rejection' }] } : { ok: true, next: '/thanks' }) })
    })
  }

  await check('Reduced motion keeps the active step still', { reducedMotion: 'reduce' }, async page => {
    await open(page)
    assert.equal(await page.locator('.form-step:visible').evaluate(e => getComputedStyle(e).animationName), 'none')
    assert.equal(await page.locator('.form-progress .is-active').evaluate(e => getComputedStyle(e).transitionDuration), '0s')
  })
} finally {
  await browser.close()
  const report = { base, realSubmissions: 0, mockedSubmissions, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results }
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`${report.passed} passed, ${report.failed} failed; ${mockedSubmissions} mocked submissions, 0 real. Artifacts: ${output}`)
  if (report.failed) process.exitCode = 1
}
