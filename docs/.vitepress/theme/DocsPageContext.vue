<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { DefaultTheme } from 'vitepress'

const { lang, page, theme } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))
const normalize = (path: string) => path.replace(/\.(md|html)$/, '').replace(/\/index$/, '').replace(/\/$/, '')

// Derive the category from the same navigation source; don't duplicate translated labels.
const category = computed(() => {
  const sidebar = theme.value.sidebar
  if (!Array.isArray(sidebar)) return ''
  const path = normalize(`/${page.value.relativePath}`)
  const containsPage = (item: DefaultTheme.SidebarItem): boolean =>
    (!!item.link && normalize(item.link) === path) || !!item.items?.some(containsPage)
  return sidebar.find(containsPage)?.text || ''
})
</script>

<template>
  <div class="docs-page-context">
    <span class="docs-page-context__label">{{ isZh ? '开发文档' : 'DEVELOPER DOCS' }}</span>
    <template v-if="category">
      <span class="docs-page-context__separator" aria-hidden="true">/</span>
      <span class="docs-page-context__category">{{ category }}</span>
    </template>
  </div>
</template>
