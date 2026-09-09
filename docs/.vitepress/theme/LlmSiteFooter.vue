<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isChinese = computed(() => route.path.startsWith('/zh/'))
const isApplicationPage = computed(() => /\/apply(?:\.html)?$/.test(route.path))

const content = computed(() => isChinese.value
  ? {
      label: '面向 AI 的机器可读文档',
      full: '完整上下文',
      indexPath: '/zh/llms.txt',
      fullPath: '/zh/llms-full.txt',
    }
  : {
      label: 'Machine-readable documentation',
      full: 'Full context',
      indexPath: '/llms.txt',
      fullPath: '/llms-full.txt',
    })
</script>

<template>
  <footer v-if="!isApplicationPage" class="llm-site-footer" :aria-label="content.label">
    <div class="llm-site-footer__inner">
      <span>{{ content.label }}</span>
      <nav aria-label="LLM documentation">
        <a :href="content.indexPath">llms.txt</a>
        <span aria-hidden="true">·</span>
        <a :href="content.fullPath">{{ content.full }}</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.llm-site-footer {
  position: relative;
  z-index: 1;
  padding: 22px 24px;
  color: var(--tt-color-text-tertiary);
  border-top: 1px solid var(--tt-color-border);
  background:
    linear-gradient(90deg, var(--tt-color-cyan-soft), transparent 22%, transparent 78%, var(--tt-color-brand-soft)),
    var(--tt-color-bg-grouped);
  font-size: 13px;
}

.llm-site-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
}

.llm-site-footer nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.llm-site-footer a {
  color: var(--tt-color-text-secondary);
  font-weight: 700;
  text-decoration-color: color-mix(in srgb, var(--tt-brand-cyan) 44%, transparent);
  text-underline-offset: 3px;
}

.llm-site-footer a:hover {
  color: var(--tt-brand-pink);
  text-decoration-color: var(--tt-brand-cyan);
}

.llm-site-footer a:focus-visible {
  outline: 2px solid var(--tt-brand-cyan);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .llm-site-footer__inner {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
