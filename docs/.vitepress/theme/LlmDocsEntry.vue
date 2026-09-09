<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type Locale = 'en' | 'zh'
type ResourceKind = 'index' | 'full'

const props = withDefaults(defineProps<{ locale?: Locale }>(), {
  locale: 'en',
})

const copied = ref<ResourceKind | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const content = computed(() => {
  if (props.locale === 'zh') {
    return {
      eyebrow: 'LLM READY',
      title: '给 AI 编码助手的文档入口',
      description: '把下面的地址交给 Codex、Cursor、Claude Code 或其他编程 Agent，它就能先读索引，再按任务加载协议、事件与示例。',
      indexDescription: '精简索引，适合先发现文档能力',
      fullDescription: '完整上下文，适合一次性导入',
      copy: '复制地址',
      copied: '已复制',
      open: '打开',
      indexPath: '/zh/llms.txt',
      fullPath: '/zh/llms-full.txt',
    }
  }

  return {
    eyebrow: 'LLM READY',
    title: 'Documentation for AI coding assistants',
    description: 'Give these URLs to Codex, Cursor, Claude Code, or another coding agent. It can read the index first, then load the protocol, events, and samples it needs.',
    indexDescription: 'Compact index for discovering the documentation',
    fullDescription: 'Complete context for a one-shot import',
    copy: 'Copy URL',
    copied: 'Copied',
    open: 'Open',
    indexPath: '/llms.txt',
    fullPath: '/llms-full.txt',
  }
})

function resourcePath(kind: ResourceKind) {
  return kind === 'index' ? content.value.indexPath : content.value.fullPath
}

async function copyUrl(kind: ResourceKind) {
  const url = new URL(resourcePath(kind), window.location.origin).href

  try {
    await navigator.clipboard.writeText(url)
    copied.value = kind
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => {
      copied.value = null
    }, 1800)
  } catch {
    const input = document.createElement('textarea')
    input.value = url
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
    copied.value = kind
  }
}

onBeforeUnmount(() => window.clearTimeout(copiedTimer))
</script>

<template>
  <section class="llm-docs-entry" :lang="locale === 'zh' ? 'zh-CN' : 'en'" aria-labelledby="llm-docs-entry-title">
    <div class="llm-docs-entry__intro">
      <span class="llm-docs-entry__eyebrow">{{ content.eyebrow }}</span>
      <h2 id="llm-docs-entry-title">{{ content.title }}</h2>
      <p>{{ content.description }}</p>
    </div>

    <div class="llm-docs-entry__resources">
      <article class="llm-docs-entry__resource">
        <div>
          <code>llms.txt</code>
          <p>{{ content.indexDescription }}</p>
        </div>
        <div class="llm-docs-entry__actions">
          <button type="button" @click="copyUrl('index')">
            {{ copied === 'index' ? content.copied : content.copy }}
          </button>
          <a :href="content.indexPath">{{ content.open }}</a>
        </div>
      </article>

      <article class="llm-docs-entry__resource">
        <div>
          <code>llms-full.txt</code>
          <p>{{ content.fullDescription }}</p>
        </div>
        <div class="llm-docs-entry__actions">
          <button type="button" @click="copyUrl('full')">
            {{ copied === 'full' ? content.copied : content.copy }}
          </button>
          <a :href="content.fullPath">{{ content.open }}</a>
        </div>
      </article>
    </div>

    <span class="sr-only" aria-live="polite">
      {{ copied ? content.copied : '' }}
    </span>
  </section>
</template>

<style scoped>
.llm-docs-entry {
  --llm-entry-gap: 22px;
  --llm-entry-padding: clamp(20px, 3vw, 30px);
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
  gap: var(--llm-entry-gap);
  margin: 30px 0 36px;
  padding: var(--llm-entry-padding);
  overflow: hidden;
  color: var(--tt-color-text-primary);
  border: 1px solid var(--tt-color-border-strong);
  border-radius: var(--tux-v2-radius-container-level1-large);
  background:
    linear-gradient(112deg, var(--tt-color-cyan-soft), transparent 42%, var(--tt-color-brand-soft)),
    var(--tt-color-surface);
  box-shadow: var(--tt-shadow-card);
}

.llm-docs-entry::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--tt-gradient-brand);
  content: '';
}

.llm-docs-entry__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.llm-docs-entry__eyebrow {
  margin-bottom: 10px;
  color: var(--tt-color-text-secondary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.llm-docs-entry h2 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: clamp(22px, 2.5vw, 29px);
  line-height: 1.18;
}

.llm-docs-entry__intro p {
  margin: 12px 0 0;
  color: var(--tt-color-text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.llm-docs-entry__resources {
  display: grid;
  gap: 10px;
}

.llm-docs-entry__resource {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid var(--tt-color-border);
  border-radius: var(--tux-v2-radius-container-level0-large);
  background: var(--tt-color-surface-raised);
  transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}

.llm-docs-entry__resource:hover {
  border-color: var(--tt-color-border-strong);
  transform: translateY(-1px);
  box-shadow: var(--tt-shadow-card);
}

.llm-docs-entry__resource code {
  display: inline-block;
  padding: 0;
  color: var(--tt-color-text-primary);
  border: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 800;
}

.llm-docs-entry__resource p {
  margin: 4px 0 0;
  color: var(--tt-color-text-tertiary);
  font-size: 12px;
  line-height: 1.45;
}

.llm-docs-entry__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.llm-docs-entry__actions button,
.llm-docs-entry__actions a {
  min-height: 34px;
  padding: 7px 11px;
  color: var(--tt-color-text-primary);
  border: 1px solid var(--tt-color-border-strong);
  border-radius: var(--tux-v2-radius-content-medium);
  background: var(--tt-color-surface-soft);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
}

.llm-docs-entry__actions a {
  color: #ffffff;
  border-color: transparent;
  background: var(--tt-brand-black);
  box-shadow: -2px 2px 0 var(--tt-brand-cyan), 2px -2px 0 var(--tt-brand-pink);
}

.llm-docs-entry__actions button:hover,
.llm-docs-entry__actions a:hover {
  color: var(--tt-color-text-primary);
  border-color: var(--tt-brand-cyan);
  background: var(--tt-color-surface);
  text-decoration: none;
}

.llm-docs-entry__actions button:focus-visible,
.llm-docs-entry__actions a:focus-visible {
  outline: 2px solid var(--tt-brand-cyan);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .llm-docs-entry {
    grid-template-columns: 1fr;
    margin: 24px 0 30px;
  }
}

@media (max-width: 520px) {
  .llm-docs-entry__resource {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .llm-docs-entry__resource {
    transition: none;
  }
}
</style>
