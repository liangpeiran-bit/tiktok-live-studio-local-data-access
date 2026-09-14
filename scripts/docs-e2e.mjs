/** Documentation acceptance against a freshly built local preview. Never uses a personal browser profile. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:4182'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const output = resolve('artifacts/docs-e2e')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []

async function check(name, run, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1448, height: 1086 }, colorScheme: 'light', ...options })
  await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort())
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.url().startsWith(base) && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`)
  })
  try {
    await run(page, context)
    assert.deepEqual(errors, [])
    results.push({ name, passed: true })
    console.log(`PASS ${name}`)
  } catch (error) {
    results.push({ name, passed: false, error: error.stack })
    console.error(`FAIL ${name}: ${error.message}`)
  } finally { await context.close() }
}

async function settle(page) {
  await page.locator('.docs-page-context').waitFor()
  await page.evaluate(() => document.fonts.ready)
  // VitePress applies initial color transitions after hydration.
  await page.waitForTimeout(650)
}
async function open(page, path = '/guide/quick-start') {
  await page.goto(`${base}${path}`)
  await settle(page)
}
async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage })
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflows horizontally')
}
async function selected(page, title) {
  const item = page.locator('.VPSidebarItem.level-1.is-active .link')
  assert.equal(await item.count(), 1)
  assert.equal((await item.innerText()).trim(), title)
  const state = await item.evaluate(e => ({
    background: getComputedStyle(e).backgroundColor,
    text: getComputedStyle(e.querySelector('.text')).color,
    shadow: getComputedStyle(e).boxShadow,
  }))
  assert.equal(state.background, 'rgb(1, 1, 1)')
  assert.equal(state.text, 'rgb(244, 245, 247)')
  assert.ok(state.shadow.includes('rgb(37, 244, 238)') && state.shadow.includes('rgb(254, 44, 85)'))
}

try {
  for (const [locale, colorScheme, width] of [
    ['en', 'light', 1448], ['en', 'dark', 1448], ['zh', 'light', 1448], ['zh', 'dark', 1448],
    ['en', 'light', 390], ['en', 'dark', 390], ['zh', 'light', 390], ['zh', 'dark', 390],
    ['en', 'light', 320], ['zh', 'dark', 768],
  ]) {
    await check(`${locale}-${colorScheme}-${width}: reading layout and brand colors`, async page => {
      const prefix = locale === 'zh' ? '/zh' : ''
      await open(page, `${prefix}/guide/quick-start`)
      assert.equal(await page.locator('html').evaluate(e => e.classList.contains('dark')), colorScheme === 'dark')
      assert.equal(await page.locator('.docs-page-context__category').innerText(), locale === 'zh' ? '开始接入' : 'Start building')
      assert.ok(await page.locator('.vp-doc h1').evaluate(e => getComputedStyle(e).fontFamily.includes('TikTok Sans')))
      await noOverflow(page)
      await capture(page, `${locale}-${colorScheme}-${width}`)
      if (width === 1448 || width === 390) await capture(page, `${locale}-${colorScheme}-${width}-full`, true)
      if (width < 960) {
        await page.locator('.VPLocalNav .menu').click()
        await page.locator('.VPSidebar.open').waitFor()
        await page.waitForTimeout(300)
      }
      await selected(page, locale === 'zh' ? '快速开始' : 'Quick Start')
      if (width < 960) await capture(page, `${locale}-${colorScheme}-${width}-menu`)
    }, { colorScheme, viewport: { width, height: width < 960 ? 844 : 1086 } })
  }

  await check('Sidebar routing, category updates, theme persistence and translated navigation', async page => {
    await open(page)
    await page.locator('.VPSidebar a').filter({ hasText: /^Authentication$/ }).click()
    await page.waitForURL(/\/protocol\/auth(?:\.html)?$/)
    await settle(page)
    await selected(page, 'Authentication')
    assert.equal(await page.locator('.docs-page-context__category').innerText(), 'API reference')
    await page.locator('.VPNavBarAppearance [role="switch"]').click()
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
    await page.reload()
    await settle(page)
    await selected(page, 'Authentication')
    assert.equal(await page.locator('html').evaluate(e => e.classList.contains('dark')), true)
    await page.getByRole('button', { name: 'Change language' }).click()
    await page.locator('.VPNavBarTranslations a[href*="/zh/protocol/auth"]').click()
    await page.waitForURL(/\/zh\/protocol\/auth(?:\.html)?$/)
    await settle(page)
    await selected(page, '鉴权')
    assert.equal(await page.locator('.docs-page-context__category').innerText(), 'API 参考')
    await capture(page, 'zh-auth-dark')
  })

  await check('Outline anchors track the reading position; code copy and keyboard focus work', async (page, context) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base })
    await open(page)
    const anchor = page.locator('.VPDocAsideOutline .outline-link').nth(1)
    await anchor.click()
    await page.waitForFunction(() => document.querySelector('.VPDocAsideOutline .outline-link.active')?.textContent.includes('2. Run'))
    const marker = await page.locator('.VPDocAsideOutline .outline-marker').evaluate(e => ({ color: getComputedStyle(e).backgroundColor, shadow: getComputedStyle(e).boxShadow }))
    assert.equal(marker.color, 'rgb(37, 244, 238)')
    assert.ok(marker.shadow.includes('rgb(254, 44, 85)'))
    const block = page.locator('.language-text').first()
    const copy = block.locator('button.copy')
    await page.keyboard.press('Tab')
    await copy.focus()
    assert.equal(await copy.evaluate(e => getComputedStyle(e).outlineStyle), 'solid')
    await copy.press('Enter')
    await page.waitForFunction(() => document.querySelector('.language-text button.copy')?.classList.contains('copied'))
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).trim(), 'SCANNING → AUTHENTICATING → AUTHENTICATED')
    await page.waitForTimeout(450)
    assert.equal(await block.locator('.lang').evaluate(e => getComputedStyle(e).opacity), '1')
    const dimensions = await block.evaluate(e => ({ header: e.querySelector('.lang').getBoundingClientRect().bottom, code: e.querySelector('code').getBoundingClientRect().top }))
    assert.ok(dimensions.header < dimensions.code, 'Toolbar overlaps code')
    await page.waitForTimeout(650)
    await capture(page, 'code-copy-and-outline')
    await page.locator('.pager-link.next').scrollIntoViewIfNeeded()
    await page.locator('.pager-link.next').focus()
    await page.waitForTimeout(650)
    await capture(page, 'pager-keyboard-focus')
    await page.keyboard.press('Enter')
    await page.waitForURL(/\/guide\/agent-skill(?:\.html)?$/)
    await settle(page)
    await selected(page, 'Build with AI')
  })

  await check('Mobile sidebar, outline jump, table scrolling and large code block', async page => {
    await open(page, '/zh/guide/quick-start')
    await page.locator('.VPLocalNavOutlineDropdown > button').click()
    await page.locator('.VPLocalNavOutlineDropdown .outline-link').nth(2).click()
    await page.waitForURL(url => !!url.hash)
    await page.locator('.VPLocalNavOutlineDropdown .items').waitFor({ state: 'detached' })
    await noOverflow(page)
    const table = page.locator('.docs-table-scroll').first()
    await table.scrollIntoViewIfNeeded()
    await table.focus()
    const scroll = await table.evaluate(e => ({ overflow: getComputedStyle(e).overflowX, label: e.getAttribute('aria-label') }))
    assert.equal(scroll.overflow, 'auto')
    assert.equal(scroll.label, '表格，可横向滚动')
    // Two-column tables size naturally while keeping code identifiers intact.
    await capture(page, 'mobile-table')
    await page.evaluate(() => scrollTo(0, 0))
    await page.locator('.VPLocalNav .menu').click()
    await page.locator('.VPSidebar a').filter({ hasText: /^鉴权$/ }).click()
    await page.waitForURL(/\/zh\/protocol\/auth(?:\.html)?$/)
    await page.locator('.VPSidebar.open').waitFor({ state: 'detached' })
    await settle(page)
    await noOverflow(page)
    await capture(page, 'mobile-auth', true)
    await open(page, '/protocol/auth')
    const wideTable = page.locator('.docs-table-scroll').nth(2)
    assert.ok(await wideTable.locator('table').evaluate(e => e.getBoundingClientRect().width >= 640), 'Reference columns are squeezed')
    assert.equal(await wideTable.locator('code').first().evaluate(e => getComputedStyle(e).whiteSpace), 'nowrap')
    await wideTable.scrollIntoViewIfNeeded()
    await wideTable.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelectorAll('.docs-table-scroll')[2].scrollLeft > 0)
    await noOverflow(page)
    await capture(page, 'mobile-table-scroll')
  }, { viewport: { width: 390, height: 844 }, hasTouch: true })

  await check('Reference table, highlighted syntax, diagram and gift catalog retain their presentation', async page => {
    for (const path of ['/protocol/auth', '/protocol/events', '/guide/architecture', '/reference/gift-catalog']) {
      await open(page, path)
      await noOverflow(page)
      if (path === '/protocol/auth') {
        const colors = await page.locator('.shiki code span[style]').evaluateAll(nodes => [...new Set(nodes.map(e => getComputedStyle(e).color))])
        assert.ok(colors.length > 1, 'Syntax highlighting was flattened')
      }
      if (path === '/guide/architecture') {
        await page.locator('.vp-mermaid svg').first().waitFor()
        await noOverflow(page)
      }
      await capture(page, path.replaceAll('/', '-').slice(1))
    }
  })

  await check('Dark surface hierarchy, readable contrast, link feedback and syntax highlighting', async page => {
    await open(page)
    const palette = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const paint = canvas.getContext('2d')
      const rgba = color => {
        paint.clearRect(0, 0, 1, 1)
        paint.fillStyle = color
        paint.fillRect(0, 0, 1, 1)
        return [...paint.getImageData(0, 0, 1, 1).data]
      }
      const style = selector => getComputedStyle(document.querySelector(selector))
      return {
        reading: rgba(style('.VPDoc').backgroundColor),
        navigation: rgba(style('.VPSidebar').backgroundColor),
        text: rgba(style('.vp-doc > div > p').color),
        secondary: rgba(style('.docs-page-context__category').color),
        code: rgba(style('.language-text').backgroundColor),
        toolbar: rgba(getComputedStyle(document.querySelector('.language-text'), '::before').backgroundColor),
      }
    })
    const luminance = rgb => rgb.slice(0, 3).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
    const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05)
    assert.ok(luminance(palette.reading) > luminance(palette.navigation), 'Reading canvas should separate from navigation')
    assert.ok(luminance(palette.toolbar) > luminance(palette.code), 'Code toolbar should separate from the code canvas')
    assert.ok(contrast(palette.text, palette.reading) >= 7, 'Lead text has insufficient contrast')
    assert.ok(contrast(palette.secondary, palette.reading) >= 4.5, 'Secondary text has insufficient contrast')
    const link = page.locator('.vp-doc a[href*="/apply"]').first()
    await link.hover()
    await page.waitForTimeout(250)
    assert.equal(await link.evaluate(e => getComputedStyle(e).color), 'rgb(37, 244, 238)')
    for (const prefix of ['', '/zh']) {
      await open(page, `${prefix}/protocol/auth`)
      const codeColors = await page.locator('.shiki code span[style]').evaluateAll(nodes => [...new Set(nodes.map(e => getComputedStyle(e).color))])
      assert.ok(codeColors.length > 1, 'Dark syntax highlighting was flattened')
      await page.locator('.shiki').first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(650)
      await capture(page, prefix ? 'zh-dark-code-detail' : 'en-dark-code-detail')
    }
  }, { colorScheme: 'dark' })

  await check('Reduced motion and marketing-page style isolation', async page => {
    await open(page)
    const transition = await page.locator('.VPDocAsideOutline .outline-marker').evaluate(e => getComputedStyle(e).transitionDuration)
    assert.equal(transition, '0s')
    for (const path of ['/', '/apply']) {
      await page.goto(`${base}${path}`)
      await page.locator(path === '/' ? '.home-headline' : '.apply-shell form').waitFor()
      assert.equal(await page.locator('.docs-layout').count(), 0)
      assert.equal(await page.locator('.docs-page-context').count(), 0)
      await noOverflow(page)
    }
  }, { reducedMotion: 'reduce' })
} finally {
  await browser.close()
  const report = { base, browser: 'Independent headless Chromium; no personal profile or real submissions', passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results }
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`${report.passed} passed, ${report.failed} failed. Artifacts: ${output}`)
  if (report.failed) process.exitCode = 1
}
