<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

type Gift = { id: string; name: string; diamond_count: number; combo: boolean; is_displayed_on_panel: boolean; image_url: string; panel_order: number }
type Catalog = { region: string; gift_count: number; displayed_gift_count: number; gifts: Gift[] }
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const t = computed(() => zh.value ? {
  search: '搜索名称、英文别名、ID 或准确钻石数', displayed: '快照中面板可见', all: '全部抓取礼物',
  panel: '面板顺序', asc: '钻石数：从低到高', desc: '钻石数：从高到低', name: '名称', sort: '排序',
  gift: '礼物', diamonds: '钻石', combo: '支持连击', yes: '是', no: '否', copy: '复制 ID', copied: '已复制',
  loading: '正在加载礼物目录…', error: '礼物目录加载失败，请重试。', retry: '重新加载', empty: '没有匹配的礼物。试试 ID，或切换为全部礼物。',
  previous: '上一页', next: '下一页', matches: '条结果', page: '页', unavailable: '复制失败，请手动选择 ID。',
  aliases: '英文别名仅用于检索文档中的示例，不代表全球官方名称；匹配始终使用 ID。',
} : {
  search: 'Search name, English alias, ID, or exact diamonds', displayed: 'Displayed in snapshot', all: 'All captured gifts',
  panel: 'Panel order', asc: 'Diamonds: low to high', desc: 'Diamonds: high to low', name: 'Name', sort: 'Sort gifts',
  gift: 'Gift', diamonds: 'Diamonds', combo: 'Combo', yes: 'Yes', no: 'No', copy: 'Copy ID', copied: 'Copied',
  loading: 'Loading gift catalog…', error: 'Unable to load the catalog. Please retry.', retry: 'Retry', empty: 'No matching gifts. Try an ID or switch to all captured gifts.',
  previous: 'Previous', next: 'Next', matches: 'results', page: 'Page', unavailable: 'Copy failed. Select the ID manually.',
  aliases: 'English aliases help find documented examples; they are not a global official name list. Always match by ID.',
})
const catalog = ref<Catalog | null>(null)
const loadError = ref(false)
const query = ref('')
const visibility = ref('displayed')
const sort = ref('panel')
const page = ref(1)
const pageSize = 25
const copyStatus = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const aliasById = ref<Record<string, string[]>>({})
const names = (gift: Gift) => aliasById.value[gift.id]?.join(' · ') || ''

async function loadCatalog() {
  loadError.value = false
  try {
    const [data, aliases] = await Promise.all(['/data/gifts.json', '/data/gift-aliases.json'].map(async path => {
      const response = await fetch(withBase(path))
      if (!response.ok) throw new Error('Catalog unavailable')
      return response.json()
    }))
    aliasById.value = aliases.aliases
    catalog.value = data
  } catch { loadError.value = true }
}
onMounted(loadCatalog)
watch([query, visibility, sort], () => { page.value = 1 })
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return (catalog.value?.gifts ?? []).filter(gift =>
    (visibility.value === 'all' || gift.is_displayed_on_panel) &&
    (!q || (gift.id + ' ' + gift.name + ' ' + names(gift)).toLowerCase().includes(q) || String(gift.diamond_count) === q)
  ).sort((a, b) => sort.value === 'price-asc' ? a.diamond_count - b.diamond_count
    : sort.value === 'price-desc' ? b.diamond_count - a.diamond_count
    : sort.value === 'name' ? a.name.localeCompare(b.name) : a.panel_order - b.panel_order)
})
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
function turnPage(delta: number) {
  page.value = Math.max(1, Math.min(pageCount.value, page.value + delta))
  searchInput.value?.focus({ preventScroll: true })
  searchInput.value?.scrollIntoView({ block: 'center' })
}
async function copyId(id: string) {
  try { await navigator.clipboard.writeText(id); copyStatus.value = t.value.copied + ': ' + id }
  catch { copyStatus.value = t.value.unavailable }
}
</script>

<template>
  <section class="gift-catalog" :aria-label="t.gift">
    <p class="gift-catalog__hint">{{ t.aliases }}</p>
    <div class="gift-catalog__controls">
      <input ref="searchInput" v-model="query" type="search" :aria-label="t.search" :placeholder="t.search" />
      <select v-model="visibility" :aria-label="zh ? '礼物可见性' : 'Gift visibility'">
        <option value="displayed">{{ t.displayed }}</option><option value="all">{{ t.all }}</option>
      </select>
      <select v-model="sort" :aria-label="t.sort">
        <option value="panel">{{ t.panel }}</option><option value="price-asc">{{ t.asc }}</option>
        <option value="price-desc">{{ t.desc }}</option><option value="name">{{ t.name }}</option>
      </select>
    </div>
    <p v-if="loadError" role="alert">{{ t.error }} <button type="button" @click="loadCatalog">{{ t.retry }}</button></p>
    <p v-else-if="!catalog" role="status">{{ t.loading }}</p>
    <template v-else>
      <p class="gift-catalog__status" role="status">{{ filtered.length }} {{ t.matches }} · {{ t.page }} {{ page }} / {{ pageCount }}</p>
      <p v-if="!filtered.length">{{ t.empty }}</p>
      <table v-else class="gift-catalog__table">
        <thead><tr><th>{{ t.gift }}</th><th>ID</th><th>{{ t.diamonds }}</th><th>{{ t.combo }}</th></tr></thead>
        <tbody>
          <tr v-for="gift in visible" :key="gift.id">
            <td class="gift-catalog__name"><img :src="gift.image_url" alt="" width="40" height="40" loading="lazy" /><span>{{ gift.name }}<small v-if="names(gift)">{{ names(gift) }}</small></span></td>
            <td><button type="button" :aria-label="t.copy + ' ' + gift.id" @click="copyId(gift.id)"><code>{{ gift.id }}</code> <small>{{ t.copy }}</small></button></td>
            <td :data-label="t.diamonds">{{ gift.diamond_count }}</td>
            <td :data-label="t.combo">{{ gift.combo ? t.yes : t.no }}</td>
          </tr>
        </tbody>
      </table>
      <nav v-if="filtered.length" class="gift-catalog__pagination" :aria-label="zh ? '礼物分页' : 'Gift pagination'">
        <button type="button" :disabled="page === 1" @click="turnPage(-1)">{{ t.previous }}</button>
        <span>{{ page }} / {{ pageCount }}</span>
        <button type="button" :disabled="page === pageCount" @click="turnPage(1)">{{ t.next }}</button>
      </nav>
    </template>
    <p class="gift-catalog__copy-status" role="status">{{ copyStatus }}</p>
  </section>
</template>

<style scoped>
.gift-catalog { margin: 24px 0; }
.gift-catalog__hint, .gift-catalog__status { color: var(--vp-c-text-2); font-size: 14px; }
.gift-catalog__controls { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.gift-catalog__controls input { grid-column: 1 / -1; }
input, select, button { min-height: 44px; min-width: 0; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); font: inherit; }
button { cursor: pointer; }
button:disabled { opacity: .4; cursor: default; }
button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.gift-catalog__table { display: table; width: 100%; font-size: 14px; }
.gift-catalog__name img { float: left; margin-right: 10px; object-fit: contain; }
.gift-catalog__name small { display: block; color: var(--vp-c-text-2); }
.gift-catalog__table button { white-space: nowrap; }
.gift-catalog__pagination { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 20px; }
.gift-catalog__copy-status { color: var(--vp-c-brand-1); min-height: 24px; }
@media (max-width: 600px) {
  .gift-catalog__controls { grid-template-columns: 1fr; }
  .gift-catalog__table, .gift-catalog__table tbody { display: block; border: 0; box-shadow: none; background: transparent; }
  .gift-catalog__table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .gift-catalog__table tr { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
  .gift-catalog__table td { border: 0; padding: 0; }
  .gift-catalog__table td:first-child, .gift-catalog__table td:nth-child(2) { grid-column: 1 / -1; }
  .gift-catalog__table td[data-label]::before { content: attr(data-label) ': '; color: var(--vp-c-text-2); }
}
</style>
