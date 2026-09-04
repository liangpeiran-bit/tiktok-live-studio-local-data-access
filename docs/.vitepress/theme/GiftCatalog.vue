<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

type Gift = {
  id: string
  name: string
  diamond_count: number
  type: number
  combo: boolean
  is_displayed_on_panel: boolean
  image_url: string
  panel_order: number
}

type Catalog = {
  captured_at: string | null
  region: string
  gift_count: number
  displayed_gift_count: number
  gifts: Gift[]
}

const catalog = ref<Catalog | null>(null)
const loadError = ref('')
const query = ref('')
const visibility = ref<'displayed' | 'all'>('displayed')
const sort = ref<'panel' | 'price-asc' | 'price-desc' | 'name'>('panel')
const limit = ref(100)
const copiedId = ref('')

onMounted(async () => {
  try {
    const response = await fetch(withBase('/data/gifts.json'))
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    catalog.value = await response.json()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  }
})

watch([query, visibility, sort], () => {
  limit.value = 100
})

const filteredGifts = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase()
  const matches = (catalog.value?.gifts ?? []).filter((gift) => {
    if (visibility.value === 'displayed' && !gift.is_displayed_on_panel) return false
    if (!normalizedQuery) return true
    return (
      gift.id.includes(normalizedQuery) ||
      gift.name.toLocaleLowerCase().includes(normalizedQuery) ||
      String(gift.diamond_count) === normalizedQuery
    )
  })

  return [...matches].sort((left, right) => {
    if (sort.value === 'price-asc') return left.diamond_count - right.diamond_count
    if (sort.value === 'price-desc') return right.diamond_count - left.diamond_count
    if (sort.value === 'name') return left.name.localeCompare(right.name)
    return left.panel_order - right.panel_order
  })
})

const visibleGifts = computed(() => filteredGifts.value.slice(0, limit.value))

async function copyGiftId(id: string) {
  await navigator.clipboard.writeText(id)
  copiedId.value = id
  window.setTimeout(() => {
    if (copiedId.value === id) copiedId.value = ''
  }, 1200)
}
</script>

<template>
  <div class="gift-catalog">
    <div v-if="catalog" class="gift-catalog__summary">
      <strong>{{ catalog.displayed_gift_count }}</strong> displayed in the captured panel ·
      <strong>{{ catalog.gift_count }}</strong> captured IDs · region {{ catalog.region || 'unknown' }}
    </div>

    <div class="gift-catalog__controls">
      <input v-model="query" type="search" placeholder="Search by gift name, ID, or exact diamond value" />
      <select v-model="visibility" aria-label="Gift visibility">
        <option value="displayed">Displayed in snapshot</option>
        <option value="all">All captured gifts</option>
      </select>
      <select v-model="sort" aria-label="Sort gifts">
        <option value="panel">Panel order</option>
        <option value="price-asc">Diamonds: low to high</option>
        <option value="price-desc">Diamonds: high to low</option>
        <option value="name">Name</option>
      </select>
    </div>

    <p v-if="loadError" class="gift-catalog__error">Unable to load the catalog: {{ loadError }}</p>
    <p v-else-if="!catalog">Loading gift catalog…</p>

    <template v-else>
      <div class="gift-catalog__table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gift</th>
              <th>ID</th>
              <th>Diamonds</th>
              <th>Type</th>
              <th>Combo</th>
              <th>Snapshot</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gift in visibleGifts" :key="gift.id">
              <td>
                <span class="gift-catalog__gift">
                  <img :src="gift.image_url" :alt="gift.name" loading="lazy" />
                  <span>{{ gift.name || 'Unnamed gift' }}</span>
                </span>
              </td>
              <td>
                <button class="gift-catalog__copy" type="button" @click="copyGiftId(gift.id)">
                  <code>{{ gift.id }}</code>
                  <span>{{ copiedId === gift.id ? 'Copied' : 'Copy' }}</span>
                </button>
              </td>
              <td>{{ gift.diamond_count }}</td>
              <td>{{ gift.type }}</td>
              <td>{{ gift.combo ? 'Yes' : 'No' }}</td>
              <td>{{ gift.is_displayed_on_panel ? 'Displayed' : 'Captured only' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="filteredGifts.length === 0" class="gift-catalog__empty">No matching gifts.</p>
      <button
        v-else-if="visibleGifts.length < filteredGifts.length"
        class="gift-catalog__more"
        type="button"
        @click="limit += 100"
      >
        Show more ({{ filteredGifts.length - visibleGifts.length }} remaining)
      </button>
    </template>
  </div>
</template>

<style scoped>
.gift-catalog {
  margin: 20px 0;
}

.gift-catalog__summary {
  margin-bottom: 12px;
  color: var(--vp-c-text-2);
}

.gift-catalog__controls {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto auto;
  gap: 10px;
  margin-bottom: 16px;
}

.gift-catalog__controls input,
.gift-catalog__controls select {
  min-height: 38px;
  padding: 7px 10px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.gift-catalog__table-wrap {
  overflow-x: auto;
}

.gift-catalog table {
  display: table;
  width: 100%;
  margin: 0;
}

.gift-catalog__gift {
  display: inline-flex;
  align-items: center;
  min-width: 150px;
  gap: 10px;
}

.gift-catalog__gift img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.gift-catalog__copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
}

.gift-catalog__copy span {
  font-size: 12px;
}

.gift-catalog__more {
  display: block;
  margin: 16px auto 0;
  padding: 8px 16px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  cursor: pointer;
}

.gift-catalog__error {
  color: var(--vp-c-danger-1);
}

.gift-catalog__empty {
  color: var(--vp-c-text-2);
  text-align: center;
}

@media (max-width: 760px) {
  .gift-catalog__controls {
    grid-template-columns: 1fr;
  }
}
</style>
