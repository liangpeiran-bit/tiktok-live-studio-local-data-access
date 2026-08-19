<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  code: string
}>()

const { isDark } = useData()
const canvas = ref<HTMLElement | null>(null)
const error = ref('')
let renderCount = 0

async function renderDiagram(): Promise<void> {
  if (!canvas.value) {
    return
  }

  error.value = ''
  const source = decodeURIComponent(props.code)
  const mermaid = (await import('mermaid')).default
  const id = `mermaid-${Date.now()}-${++renderCount}`

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: isDark.value ? 'dark' : 'default',
  })

  try {
    const { svg } = await mermaid.render(id, source)
    canvas.value.innerHTML = svg
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    canvas.value.innerHTML = ''
  }
}

onMounted(() => {
  void renderDiagram()
})

watch(isDark, () => {
  void renderDiagram()
})
</script>

<template>
  <div class="vp-mermaid">
    <p v-if="error" class="vp-mermaid__error">{{ error }}</p>
    <div ref="canvas" class="vp-mermaid__canvas" />
  </div>
</template>

<style scoped>
.vp-mermaid {
  margin: 16px 0;
  overflow-x: auto;
}

.vp-mermaid__canvas :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.vp-mermaid__error {
  margin: 0 0 8px;
  color: var(--vp-c-danger-1);
  font-size: 14px;
}
</style>
