// Serve only this starter's two assets, only on loopback. No credential endpoint.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
const files = { '/': ['local-overlay.html', 'text/html'], '/local-client.mjs': ['local-client.mjs', 'text/javascript'] }
const server = createServer(async (request, response) => {
  const asset = files[request.url]
  if (request.method !== 'GET' || !Array.isArray(asset)) { response.writeHead(404).end(); return }
  try {
    const content = await readFile(new URL(asset[0], import.meta.url))
    response.writeHead(200, { 'Content-Type': asset[1] + '; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; connect-src ws://127.0.0.1:*; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff' })
    response.end(content)
  } catch { response.writeHead(500).end('Download local-overlay.html and local-client.mjs into the same folder as preview.mjs.'); }
})
server.on('error', () => { console.error('Could not start preview. Check whether 127.0.0.1:4178 is already in use.'); process.exitCode = 1 })
server.listen(4178, '127.0.0.1', () => console.log('Open http://127.0.0.1:4178 — press Ctrl+C to stop.'))
