// Local development starter, protocol 1.0.0. No automatic retry or secret storage.
export async function connectLocal({ credentials, onStatus = () => {}, onEvent = () => {}, signal,
  WebSocketImpl = globalThis.WebSocket, portStart = 49152, portEnd = 65535,
  batchSize = 32, helloTimeout = 500, authTimeout = 10000 }) {
  if (!credentials?.app_id || !credentials?.key_id || !credentials?.secret) throw new Error('MISSING_CREDENTIALS')
  if (!Number.isInteger(portStart) || !Number.isInteger(portEnd) || portStart < 49152 || portEnd > 65535 || portStart > portEnd || !Number.isInteger(batchSize) || batchSize < 1 || batchSize > 128) throw new Error('INVALID_SCAN_RANGE')
  const cancelled = () => signal?.aborted
  const close = socket => { if (socket.readyState < 2) socket.close() }
  const parse = data => { try { return JSON.parse(data) } catch { return null } }
  function candidate(port) {
    if (cancelled()) return Promise.resolve(null)
    return new Promise(resolve => {
      let socket
      try { socket = new WebSocketImpl(`ws://127.0.0.1:${port}/v1/third-party`) }
      catch { resolve(null); return }
      let settled = false
      const finish = valid => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        signal?.removeEventListener('abort', abort)
        socket.removeEventListener('message', hello)
        socket.removeEventListener('close', abort)
        if (!valid) close(socket)
        resolve(valid ? socket : null)
      }
      const abort = () => finish(false)
      const hello = event => {
        const message = parse(event.data)
        finish(message?.type === 'SERVER_HELLO' && message.product === 'tiktok_live_studio' &&
          message.channel === 'third-party-im' && message.version === '1.0.0')
      }
      const timer = setTimeout(abort, helloTimeout)
      socket.addEventListener('message', hello)
      socket.addEventListener('error', abort, { once: true })
      socket.addEventListener('close', abort, { once: true })
      signal?.addEventListener('abort', abort, { once: true })
      if (cancelled()) abort()
    })
  }
  onStatus('SCANNING')
  let socket = null
  for (let start = portStart; start <= portEnd && !socket && !cancelled(); start += batchSize) {
    const candidates = await Promise.all(Array.from({ length: Math.min(batchSize, portEnd - start + 1) }, (_, i) => candidate(start + i)))
    socket = candidates.find(item => item?.readyState === 1) ?? null
    for (const item of candidates) if (item && (item !== socket || cancelled())) close(item)
  }
  if (cancelled()) throw new Error('CANCELLED')
  if (!socket) throw new Error('ENDPOINT_NOT_FOUND')
  onStatus('AUTHENTICATING')
  return new Promise((resolve, reject) => {
    let authenticated = false
    let stopped = false
    const seen = new Map()
    const finish = status => {
      if (stopped) return
      stopped = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      socket.removeEventListener('message', receive)
      socket.removeEventListener('close', disconnected)
      socket.removeEventListener('error', failed)
      seen.clear()
      close(socket)
      onStatus(status)
      if (!authenticated) reject(new Error(status))
    }
    const abort = () => finish('CANCELLED')
    const disconnected = () => finish('DISCONNECTED')
    const failed = () => finish('TRANSPORT_ERROR')
    const receive = event => {
      const message = parse(event.data)
      if (!message || typeof message !== 'object') return
      if (message.type === 'DISCONNECT') { finish(message.reason_code === 510 ? 'POLICY_DISCONNECT_510' : 'DISCONNECTED'); return }
      if (!authenticated) {
        if (message.type !== 'AUTH_RESULT') return
        if (message.success !== true) {
          const known = ['INVALID_FORMAT', 'ACCESS_DISABLED', 'INVALID_CREDENTIALS', 'CONNECTION_LIMIT', 'AUTH_TIMEOUT', 'SERVER_ERROR']
          finish(known.includes(message.error_code) ? message.error_code : 'AUTH_FAILED')
          return
        }
        authenticated = true
        clearTimeout(timer)
        onStatus('AUTHENTICATED')
        resolve({ close: () => finish('DISCONNECTED') })
        return
      }
      if (message.type !== 'EVENT' || !['live.like', 'live.gift', 'live.chat'].includes(message.event)) return
      const payload = message.payload
      if (!payload || typeof payload !== 'object' || typeof payload.message_id !== 'string' || !payload.message_id) return
      const key = `${message.event}:${payload.message_id}`
      const now = Date.now()
      if (seen.has(key) && now - seen.get(key) < 60000) return
      seen.delete(key)
      seen.set(key, now)
      if (seen.size > 500) seen.delete(seen.keys().next().value)
      try { onEvent(message) } catch { onStatus('EVENT_HANDLER_ERROR') }
    }
    const timer = setTimeout(() => finish('AUTH_TIMEOUT'), authTimeout)
    signal?.addEventListener('abort', abort, { once: true })
    socket.addEventListener('message', receive)
    socket.addEventListener('close', disconnected)
    socket.addEventListener('error', failed)
    if (cancelled()) { abort(); return }
    try { socket.send(JSON.stringify({ type: 'AUTH', app_id: credentials.app_id, key_id: credentials.key_id, secret: credentials.secret, version: '1.0.0' })) }
    catch { failed() }
    // This function does not persist credentials or log server-supplied error text.
    credentials = null
  })
}
