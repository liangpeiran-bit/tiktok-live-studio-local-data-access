import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = process.argv[2]

if (!inputPath) {
  console.error('Usage: npm run gifts:extract -- <path-to-gifts.json>')
  process.exit(1)
}

const source = JSON.parse(await readFile(resolve(inputPath), 'utf8'))
const pages = Array.isArray(source?.data?.pages) ? source.data.pages : []
const giftPage = pages.find((page) => page?.page_type === 1 && Array.isArray(page?.gifts))

if (!giftPage) {
  throw new Error('Cannot find data.pages[].gifts for page_type=1')
}

const rawGifts = giftPage.gifts
const idSet = new Set()

const gifts = rawGifts.map((gift, index) => {
  const id = String(gift?.id ?? '')
  if (!id) throw new Error(`Gift at index ${index} has no id`)
  if (idSet.has(id)) throw new Error(`Duplicate gift id: ${id}`)
  idSet.add(id)

  const imageUrls = Array.isArray(gift?.image?.url_list) ? gift.image.url_list : []
  const iconUrls = Array.isArray(gift?.icon?.url_list) ? gift.icon.url_list : []

  return {
    id,
    name: String(gift?.name ?? ''),
    diamond_count: Number(gift?.diamond_count ?? 0),
    type: Number(gift?.type ?? 0),
    combo: Boolean(gift?.combo),
    is_displayed_on_panel: Boolean(gift?.is_displayed_on_panel),
    image_url: String(imageUrls[0] ?? iconUrls[0] ?? ''),
    panel_order: index + 1,
  }
})

const capturedAt = Number.isFinite(Number(source?.extra?.now))
  ? new Date(Number(source.extra.now)).toISOString()
  : null
const duplicateNameGroups = [...gifts.reduce((groups, gift) => {
  const ids = groups.get(gift.name) ?? []
  ids.push(gift.id)
  groups.set(gift.name, ids)
  return groups
}, new Map())].filter(([, ids]) => ids.length > 1).length

const catalog = {
  schema_version: '1.0.0',
  captured_at: capturedAt,
  region: String(giftPage.region ?? ''),
  source_kind: 'gift-panel-capture',
  is_full_gift_data: Boolean(source?.data?.is_full_gift_data),
  gift_count: gifts.length,
  displayed_gift_count: gifts.filter((gift) => gift.is_displayed_on_panel).length,
  duplicate_name_group_count: duplicateNameGroups,
  notices: [
    'This is a point-in-time catalog from one gift-panel response, not a permanent global allowlist.',
    'Gift availability, names, prices, and images may vary by region, room, account, campaign, and time.',
    'Match live.gift events by gift.id. Do not use gift.name as a programmatic key.',
    'The live event payload is the runtime source of truth for name, diamond_count, type, and image_url.',
  ],
  gifts,
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const csvFields = [
  'id',
  'name',
  'diamond_count',
  'type',
  'combo',
  'is_displayed_on_panel',
  'image_url',
  'panel_order',
]
const csv = [
  csvFields.join(','),
  ...gifts.map((gift) => csvFields.map((field) => csvEscape(gift[field])).join(',')),
  '',
].join('\n')

const outputs = [
  ['docs/public/data/gifts.json', `${JSON.stringify(catalog, null, 2)}\n`],
  ['docs/public/data/gifts.csv', csv],
  [
    '.agents/skills/tiktok-live-studio-local-data-access/assets/gifts.json',
    `${JSON.stringify(catalog, null, 2)}\n`,
  ],
]

for (const [relativePath, content] of outputs) {
  const outputPath = resolve(repositoryRoot, relativePath)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, content, 'utf8')
  console.log(`Generated ${relativePath} (${Buffer.byteLength(content, 'utf8')} bytes)`)
}

console.log(
  `Extracted ${catalog.gift_count} unique gifts (${catalog.displayed_gift_count} displayed, ${catalog.duplicate_name_group_count} duplicate-name groups) from ${catalog.region || 'unknown region'}.`,
)
