import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { connectLocal } from '../docs/public/samples/local-client.mjs'
import { canonicalUrl, normalizeDocument } from './llms-markdown.mjs'

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
