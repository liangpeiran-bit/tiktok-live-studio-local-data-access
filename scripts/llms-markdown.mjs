const site = 'https://tiktok-live-studio-local-data-access.pages.dev'
const raw = 'https://raw.githubusercontent.com/liangpeiran-bit/tiktok-live-studio-local-data-access/main'

export function canonicalUrl(path) {
  if (path.startsWith('docs/public/')) return `${site}/${path.slice(12)}`
  if (path.startsWith('docs/')) return `${site}/${path.slice(5).replace(/index\.md$/, '').replace(/\.md$/, '')}`
  return `${raw}/${path}`
}

export function normalizeDocument(markdown, path) {
  const canonical = canonicalUrl(path)
  const zh = path.startsWith('docs/zh/')
  const prefix = zh ? '/zh' : ''
  function link(href) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return href
    const url = new URL(href, href.startsWith('/') ? site : canonical)
    if (url.origin === site) url.pathname = url.pathname.replace(/index\.md$/, '').replace(/\.md$/, '')
    return url.href
  }
  let fence = null
  return markdown.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '').split('\n').map(line => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (marker) {
      if (!fence) fence = marker[1]
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      return line
    }
    if (fence) return line
    return line
      .replace(/<GiftCatalog\b[^>]*\/>/g, `[Gift catalog JSON](${site}/data/gifts.json) · [Search aliases](${site}/data/gift-aliases.json)`)
      .replace(/<LlmDocsEntry\b[^>]*\/>/g, `[LLM index](${site}${prefix}/llms.txt) · [Complete context](${site}${prefix}/llms-full.txt)`)
      .replace(/<DemoShowcase\b[^>]*\/>/g, `[Tug of Trap](${site}${prefix}/demos/tug-of-trap) · [Candy Arena](${site}${prefix}/demos/candy-arena-duel). Public demo mode uses simulated events.`)
      .replace(/<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, (_, href, label) => `[${label.replace(/<[^>]+>/g, '') || 'View resource'}](${link(href)})`)
      .replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (_, href) => `[Image](${link(href)})`)
      .replace(/<\/?(?:div|section|article|header|footer|p|h[1-6]|small|strong|span|b|video|source)\b[^>]*>/g, '')
      .replace(/(!?\[[^\]]*\]\()([^\s)]+)(\))/g, (_, before, href, after) => before + link(href) + after)
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
