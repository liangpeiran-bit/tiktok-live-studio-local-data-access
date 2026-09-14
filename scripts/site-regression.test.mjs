import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { connectLocal } from '../docs/public/samples/local-client.mjs'
import { canonicalUrl, normalizeDocument } from './llms-markdown.mjs'
import { ApplicationSubmissionError, submitApplication } from '../docs/.vitepress/theme/application-submission.mjs'

const hello = { type: 'SERVER_HELLO', product: 'tiktok_live_studio', channel: 'third-party-im', version: '1.0.0' }
const event = (id, name = 'live.like') => ({ type: 'EVENT', event: name, payload: { message_id: id, count: '1' } })
const credentials = { app_id: 'mock-app', key_id: 'mock-key', secret: 'mock-only-secret' }
function mock(profiles) {
  const sockets = []
  class Socket extends EventTarget {
    constructor(url) {
      super(); this.url = url; this.readyState = 0; this.sent = []; sockets.push(this)
      this.profile = profiles[Number(new URL(url).port)]
      queueMicrotask(() => {
        if (this.readyState === 3) return
        this.readyState = 1
        if (this.profile?.hello !== undefined) this.message(this.profile.hello)
        else if (!this.profile?.timeout) this.close()
      })
    }
    message(data) { this.dispatchEvent(new MessageEvent('message', { data: typeof data === 'string' ? data : JSON.stringify(data) })) }
    send(data) {
      this.sent.push(JSON.parse(data))
      queueMicrotask(() => { for (const message of this.profile?.messages ?? []) if (this.readyState === 1) this.message(message) })
    }
    close() { if (this.readyState === 3) return; this.readyState = 3; this.dispatchEvent(new Event('close')) }
  }
  return { sockets, WebSocketImpl: Socket }
}
function options(fake, rest = {}) {
  return { credentials: { ...credentials }, ...fake, portStart: 49152, portEnd: 49155, batchSize: 2, helloTimeout: 15, authTimeout: 30, ...rest }
}
test('discovery skips invalid services, sends AUTH only to a verified winner, and closes losers', async () => {
  const fake = mock({ 49152: { hello: { ...hello, product: 'other' } }, 49153: { hello: 'not-json' },
    49154: { hello, messages: [{ type: 'AUTH_RESULT', success: true }] }, 49155: { hello } })
  const session = await connectLocal(options(fake))
  assert.deepEqual(fake.sockets.map(s => s.sent.length), [0, 0, 1, 0])
  assert.equal(fake.sockets[2].sent[0].type, 'AUTH')
  assert.equal(fake.sockets[2].sent[0].secret, credentials.secret)
  assert.deepEqual(fake.sockets.map(s => s.readyState), [3, 3, 1, 3])
  session.close(); assert.ok(fake.sockets.every(s => s.readyState === 3))
})
test('auth gates events; malformed and duplicate messages are isolated', async () => {
  const events = []; const statuses = []
  const fake = mock({ 49152: { hello, messages: [event('early'), { type: 'AUTH_RESULT', success: true },
    'malformed', event('1'), event('1'), event('1', 'live.chat'), event('2', 'unknown'), { type: 'EVENT' }] } })
  const session = await connectLocal(options(fake, { onEvent: e => events.push(e), onStatus: s => statuses.push(s) }))
  assert.deepEqual(events.map(e => e.event), ['live.like', 'live.chat'])
  assert.deepEqual(statuses, ['SCANNING', 'AUTHENTICATING', 'AUTHENTICATED'])
  session.close()
})
test('auth rejection exposes only known codes and never reports authenticated', async () => {
  const states = []
  const fake = mock({ 49152: { hello, messages: [{ type: 'AUTH_RESULT', success: false, error_code: 'INVALID_CREDENTIALS', message: credentials.secret }] } })
  await assert.rejects(connectLocal(options(fake, { onStatus: s => states.push(s) })), /INVALID_CREDENTIALS/)
  assert.ok(!states.includes('AUTHENTICATED')); assert.ok(!states.join().includes(credentials.secret))
  assert.ok(fake.sockets.every(s => s.readyState === 3))
})
test('timeouts close candidates and the authentication socket', async () => {
  const noHello = mock({ 49152: { timeout: true } })
  await assert.rejects(connectLocal(options(noHello)), /ENDPOINT_NOT_FOUND/)
  assert.ok(noHello.sockets.every(s => s.readyState === 3))
  const noAuth = mock({ 49152: { hello } })
  await assert.rejects(connectLocal(options(noAuth)), /AUTH_TIMEOUT/)
  assert.ok(noAuth.sockets.every(s => s.readyState === 3))
})
test('cancel stops a pending scan without leaking sockets', async () => {
  const fake = mock({ 49152: { timeout: true }, 49153: { timeout: true } })
  const controller = new AbortController()
  const pending = connectLocal(options(fake, { signal: controller.signal }))
  controller.abort()
  await assert.rejects(pending, /CANCELLED/)
  assert.ok(fake.sockets.every(s => s.readyState === 3))
  assert.equal(fake.sockets.length, 2)
})
test('policy disconnect is read from the JSON reason_code, with no retry', async () => {
  const states = []
  const fake = mock({ 49152: { hello, messages: [{ type: 'AUTH_RESULT', success: true }, { type: 'DISCONNECT', reason_code: 510, reason: 'arbitrary text' }] } })
  await connectLocal(options(fake, { onStatus: s => states.push(s) }))
  assert.equal(states.at(-1), 'POLICY_DISCONNECT_510')
  assert.ok(fake.sockets.every(s => s.readyState === 3))
})
test('LLM links resolve against each source, without rewriting code blocks', () => {
  const text = '[Protocol](references/protocol.md)\n```text\n[Keep](references/protocol.md)\n```'
  const result = normalizeDocument(text, '.agents/skills/example/SKILL.md')
  assert.match(result, /main\/\.agents\/skills\/example\/references\/protocol\.md/)
  assert.match(result, /```text\n\[Keep\]\(references\/protocol\.md\)\n```/)
  assert.equal(canonicalUrl('docs/events/index.md'), 'https://tiktok-live-studio-local-data-access.pages.dev/events/')
  assert.match(normalizeDocument('[Gift](../events/live-gift.md)', 'docs/guide/overview.md'), /pages\.dev\/events\/live-gift\)/)
  assert.ok(!normalizeDocument('<GiftCatalog />\n<LlmDocsEntry locale="en" />', 'docs/guide/overview.md').includes('<GiftCatalog'))
})
test('homepage keeps one five-second keyword glitch cycle and a reduced-motion fallback', async () => {
  const themeDir = new URL('../docs/.vitepress/theme/', import.meta.url)
  const source = await readFile(new URL('HomeHeroInfo.vue', themeDir), 'utf8')
  const motion = await readFile(new URL('headline-motion.css', themeDir), 'utf8')
  assert.match(source, /--headline-cycle:\s*5s/)
  assert.match(source, /class="home-headline__accessible">\{\{ hero\.text \}\}/)
  assert.match(source, /class="home-headline__visual" aria-hidden="true"/)
  assert.match(source, /class="home-headline__line" :data-text="accentLine"/)
  for (const animation of ['short-circuit', 'glitch-cyan', 'glitch-pink', 'tiktok-smear-cyan', 'tiktok-smear-pink', 'electric-line']) {
    assert.ok(source.includes(`animation: headline-${animation} var(--headline-cycle)`))
  }
  // Only the initial 18% may contain active keyframes; the remaining cycle stays still.
  for (const selector of motion.matchAll(/([\d%. ,]+)\s*\{/g)) {
    const frames = [...selector[1].matchAll(/([\d.]+)%/g)].map(match => Number(match[1]))
    assert.ok(frames.every(frame => frame <= 18 || frame === 100))
  }
  const reduced = source.slice(source.indexOf('@media (prefers-reduced-motion: reduce)'))
  assert.match(reduced, /\.home-headline__ink\s*\{\s*animation: none/)
  assert.match(reduced, /display: none; animation: none/)
})

test('localized homepages retain navigation and keep decorative icons out of LLM text', async () => {
  for (const prefix of ['', 'zh/']) {
    const path = `docs/${prefix}index.md`
    const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8')
    assert.equal((source.match(/<HomeInteractionIcon name="(?:like|gift|chat)" \/>/g) || []).length, 3)
    assert.ok(source.includes(`link: /${prefix}apply`))
    assert.ok(source.includes(`link: /${prefix}guide/quick-start`))
    assert.ok(source.includes(`href="/${prefix}reference/gift-catalog"`))
    assert.doesNotMatch(source, /ROSE ×1|LIVE\.CHAT|CONNECTED|Applications open/)
    const context = normalizeDocument(source, path)
    assert.doesNotMatch(context, /HomeInteractionIcon/)
    assert.ok(context.includes(`${prefix}reference/gift-catalog`))
  }
})

test('homepage video remains complete, keyboard-operable, and respects reduced motion', async () => {
  const source = await readFile(new URL('../docs/.vitepress/theme/HomeLiveDemo.vue', import.meta.url), 'utf8')
  assert.match(source, /interactive-tower-defense-demo\.mp4/)
  assert.match(source, /aspect-ratio:\s*16\s*\/\s*9;\s*object-fit:\s*contain/)
  assert.match(source, /role="button" tabindex="0"/)
  assert.match(source, /@keydown\.space\.prevent="togglePlayback"/)
  assert.match(source, /@keydown\.enter\.prevent="togglePlayback"/)
  assert.match(source, /if \(reducedMotion\.matches\) video\.value\?\.pause\(\)/)
  assert.match(source, /removeEventListener\('change', updatePlayback\)/)
  assert.match(source, /home-live-demo__caption::before[\s\S]*linear-gradient\(transparent/)
  assert.doesNotMatch(source, /<button|backdrop-filter/)
})

test('gift search aliases reference real distinct snapshot IDs', async () => {
  const catalog = JSON.parse(await readFile(new URL('../docs/public/data/gifts.json', import.meta.url)))
  const { aliases } = JSON.parse(await readFile(new URL('../docs/public/data/gift-aliases.json', import.meta.url)))
  for (const id of Object.keys(aliases)) assert.equal(catalog.gifts.filter(g => g.id === id).length, 1)
  assert.ok(aliases['5655'].includes('Rose')); assert.ok(aliases['7569'].includes('Game Controller'))
})

test('application form sizes to its content without a viewport-height spacer or nested scroller', async () => {
  const css = await readFile(new URL('../docs/.vitepress/theme/developer-application.css', import.meta.url), 'utf8')
  const shell = css.match(/\.apply-shell\s*\{([^}]+)\}/)?.[1]
  const panels = css.match(/\.form-panels\s*\{([^}]+)\}/)?.[1]
  assert.ok(shell && panels)
  assert.match(shell, /height:\s*auto/)
  assert.match(panels, /overflow:\s*visible/)
  assert.doesNotMatch(css, /\b(?:height|min-height|max-height):[^;}]*\b(?:\d+(?:\.\d+)?)(?:s|d|l)?vh\b/)
  assert.doesNotMatch(panels, /flex:\s*1|overflow-y:\s*(?:auto|scroll)/)
})

test('application keeps the guidance beside one three-step form without the Home showcase', async () => {
  const source = await readFile(new URL('../docs/.vitepress/theme/DeveloperApplication.vue', import.meta.url), 'utf8')
  const template = source.slice(source.indexOf('<template>'))
  assert.match(template, /class="application-intro"/)
  assert.match(template, /class="apply-shell"/)
  assert.ok(template.indexOf('class="application-intro"') < template.indexOf('class="apply-shell"'))
  assert.match(template, /v-for="\(step, index\) in copy\.steps"/)
  assert.match(template, /copy\.accessNote/)
  assert.match(template, /copy\.secretNote/)
  assert.equal((template.match(/<form\b/g) || []).length, 1)
  assert.equal((template.match(/<fieldset\b/g) || []).length, 3)
  assert.doesNotMatch(template, /<video\b|apply-masthead/)
})

test('documentation styles stay scoped and no longer force dark syntax colors on light pages', async () => {
  const themeDir = new URL('../docs/.vitepress/theme/', import.meta.url)
  const css = await readFile(new URL('docs.css', themeDir), 'utf8')
  const common = await readFile(new URL('custom.css', themeDir), 'utf8')
  const theme = await readFile(new URL('index.ts', themeDir), 'utf8')
  assert.match(theme, /'docs-layout': !page\.value\.isNotFound && \(!frontmatter\.value\.layout \|\| frontmatter\.value\.layout === 'doc'\)/)
  for (const selector of css.matchAll(/^\s*([^@/{}\s][^{}]*?)\s*\{/gm)) {
    assert.ok(selector[1].includes('.docs-layout'), `Unscoped documentation selector: ${selector[1]}`)
  }
  assert.match(common, /html:not\(\.dark\) \.Layout:not\(\.docs-layout\) \.vp-doc/)
  assert.match(css, /\.dark \.docs-layout/)
  assert.match(css, /\.docs-layout \.VPDoc\.has-sidebar \.content-container/)
  assert.match(css, /\.docs-layout \.vp-doc > div > h1::after\s*\{\s*display: none/)
  assert.doesNotMatch(css, /\.vp-doc > (?:h[1-4]|p|ul|ol)\b/)
  assert.match(css, /\.docs-layout \.docs-table-scroll[^}]+overflow-x:\s*auto/)
  assert.match(css, /table:has\(th:nth-child\(3\)\)[^}]+min-width: 640px/)
  assert.match(css, /\.docs-table-scroll :not\(pre\) > code[^}]+white-space: nowrap/)
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/)
  assert.doesNotMatch(css, /#007d77/)
  assert.match(css, /--docs-selected: var\(--tt-brand-black\)/)
  assert.match(css, /--docs-brand-edge:.*var\(--tt-brand-cyan\).*var\(--tt-brand-pink\)/)
  assert.match(css, /\.is-active[^}]+color: var\(--docs-on-solid\) !important/)
  assert.match(css, /button\.copy\s*\{[^}]+opacity: 1/)
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(theme, /'doc-before': \(\) => h\(DocsPageContext\)/)
  const context = await readFile(new URL('DocsPageContext.vue', themeDir), 'utf8')
  assert.match(context, /theme\.value\.sidebar/)
  assert.match(context, /page\.value\.relativePath/)
})

test('Apply shares brand selection states and puts mobile guidance after the form', async () => {
  const themeDir = new URL('../docs/.vitepress/theme/', import.meta.url)
  const css = await readFile(new URL('developer-application.css', themeDir), 'utf8')
  const component = await readFile(new URL('DeveloperApplication.vue', themeDir), 'utf8')
  assert.match(css, /grid-template-areas: 'intro form' 'guide form'/)
  assert.match(css, /grid-template-areas: 'intro' 'form' 'guide'/)
  assert.match(css, /\.form-progress \.is-active[^}]+background: var\(--tt-ink\)[^}]+box-shadow: var\(--apply-button-edge\)/)
  assert.match(css, /\.event-option input:checked \+ \.event-option__check \{ background: var\(--tt-cyan\)/)
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/)
  assert.ok(component.indexOf('class="apply-shell"') < component.indexOf('class="application-guide"'))
  assert.match(component, /import InteractionIcon from '\.\/HomeInteractionIcon.vue'/)
})

const submissionEndpoint = 'https://forms.example.test/f/mock'
const submissionFailure = code => error => error instanceof ApplicationSubmissionError && error.code === code

test('application blocks any populated honeypot before networking, without mutating answers', async () => {
  for (const value of ['autofilled', ' ', '\n', new Blob(['test'])]) {
    const payload = new FormData()
    payload.append('_gotcha', '')
    payload.append('_gotcha', value)
    payload.set('full_name', 'Example Developer')
    payload.set('email', 'developer@example.test')
    const before = [...payload.entries()]
    let calls = 0
    await assert.rejects(submitApplication(submissionEndpoint, payload, {
      fetchImpl: async () => { calls++; throw new Error('must not send') },
    }), submissionFailure('HONEYPOT_FILLED'))
    assert.equal(calls, 0)
    assert.deepEqual([...payload.entries()], before)
  }
})

test('application sends empty honeypots and accepts the documented acknowledgement exactly once', async () => {
  for (const includeTrap of [true, false]) {
    const payload = new FormData()
    if (includeTrap) payload.set('_gotcha', '')
    payload.set('email', 'developer@example.test')
    payload.set('event_types', 'GiftMessage, LikeMessage')
    const before = [...payload.entries()]
    let calls = 0
    await submitApplication(submissionEndpoint, payload, { fetchImpl: async (endpoint, options) => {
      calls++
      assert.equal(endpoint, submissionEndpoint)
      assert.equal(options.method, 'POST')
      assert.equal(options.body, payload)
      assert.deepEqual(options.headers, { Accept: 'application/json' })
      assert.ok(options.signal instanceof AbortSignal)
      return Response.json({ next: '/thanks', ok: true })
    } })
    assert.equal(calls, 1)
    assert.deepEqual([...payload.entries()], before)
  }
})

test('application rejects JSON errors even with HTTP 200 and a next URL', async () => {
  for (const body of [
    { errors: [{ field: '_gotcha', message: 'Honeypot field _gotcha is not empty' }] },
    { error: 'Form inactive' },
    { ok: false },
    { errors: [] },
  ]) {
    await assert.rejects(submitApplication(submissionEndpoint, new FormData(), {
      fetchImpl: async () => Response.json({ next: '/thanks', ...body }),
    }), submissionFailure('REJECTED'))
  }
})

test('application does not claim success for unknown responses or HTTP failures', async () => {
  for (const body of [null, [], {}, { ok: true }, { next: 1 }, { stripe: {}, resubmitKey: 'pending' }]) {
    await assert.rejects(submitApplication(submissionEndpoint, new FormData(), {
      fetchImpl: async () => Response.json(body),
    }), submissionFailure('UNCONFIRMED'))
  }
  await assert.rejects(submitApplication(submissionEndpoint, new FormData(), {
    fetchImpl: async () => new Response('<html>captcha</html>', { headers: { 'Content-Type': 'text/html' } }),
  }), submissionFailure('UNCONFIRMED'))
  for (const status of [400, 403, 422, 429, 500, 503]) {
    await assert.rejects(submitApplication(submissionEndpoint, new FormData(), {
      fetchImpl: async () => Response.json({ next: '/thanks' }, { status }),
    }), submissionFailure(status >= 500 ? 'UNCONFIRMED' : 'REJECTED'))
  }
})

test('application times out or reports network uncertainty without retrying or exposing raw errors', async () => {
  for (const timeout of [false, true]) {
    let calls = 0
    await assert.rejects(submitApplication(submissionEndpoint, new FormData(), {
      timeoutMs: 5,
      fetchImpl: async (_url, { signal }) => {
        calls++
        if (!timeout) throw new Error('untrusted server text with private data')
        return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))
      },
    }), error => {
      assert.equal(error.code, 'UNCONFIRMED')
      assert.equal(error.message, 'UNCONFIRMED')
      return true
    })
    assert.equal(calls, 1)
  }
})

test('application hides the honeypot and only resets user answers after a confirmed acknowledgement', async () => {
  const source = await readFile(new URL('../docs/.vitepress/theme/DeveloperApplication.vue', import.meta.url), 'utf8')
  const css = await readFile(new URL('../docs/.vitepress/theme/developer-application.css', import.meta.url), 'utf8')
  const trap = source.match(/<input\b[^>]*name="_gotcha"[^>]*>/)?.[0]
  assert.ok(trap)
  assert.match(trap, /\shidden\s/)
  assert.match(trap, /aria-hidden="true"/)
  assert.match(trap, /autocomplete="off"/)
  assert.doesNotMatch(trap, /\bdisabled\b|\bvalue=/)
  assert.match(css, /\.form-honeypot\s*\{\s*display:\s*none\s*!important/)
  const handler = source.slice(source.indexOf('const handleSubmit ='), source.indexOf('</script>'))
  assert.match(handler, /await submitApplication\(formAction\.value, payload\)[\s\S]*submitted\.value = true[\s\S]*applicationForm\.value\.reset\(\)/)
  const recovery = handler.slice(handler.indexOf('} catch (error)'))
  assert.doesNotMatch(recovery, /applicationForm\.value\.reset|selectedEvents\.value =|submitted\.value = true|submitApplication\(/)
  assert.match(recovery, /honeypot\.value\.value = ''/)
  assert.match(recovery, /copy\.value\.honeypotFilled/)
  assert.match(recovery, /copy\.value\.submitUnconfirmed/)
  assert.match(source, /ref="errorPanel"[^>]*role="alert"[^>]*tabindex="-1"/)
})
