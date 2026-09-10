import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
const root = resolve('docs/.vitepress/dist')
async function walk(path) {
  const children = await readdir(path, { withFileTypes: true })
  return (await Promise.all(children.map(child => child.isDirectory() ? walk(join(path, child.name)) : join(path, child.name)))).flat()
}
const pages = (await walk(root)).filter(path => path.endsWith('.html'))
const broken = []
let checked = 0
for (const page of pages) {
  const html = await readFile(page, 'utf8')
  const pagePath = page.slice(root.length).replaceAll('\\', '/')
  for (const [, tag, href] of html.matchAll(/<(a|img|source)\b[^>]*?(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://local.test' + pagePath)
    let target = join(root, decodeURIComponent(url.pathname))
    if (!extname(target)) target += url.pathname.endsWith('/') ? 'index.html' : '.html'
    try {
      if (!(await stat(target)).isFile()) throw new Error('not a file')
      if (tag === 'a' && url.hash && target.endsWith('.html')) {
        const content = await readFile(target, 'utf8')
        if (!content.includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"')) throw new Error('anchor missing')
      }
      checked++
    } catch (error) { broken.push(`${pagePath} -> ${href}: ${error.message}`) }
  }
}
if (broken.length) { console.error(broken.join('\n')); process.exitCode = 1 }
else console.log(`Checked ${checked} local links/assets across ${pages.length} built pages.`)
