<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const video = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
let cleanUp: (() => void) | undefined
const copy = computed(() => lang.value.startsWith('zh') ? {
  label: '在 LIVE Studio 中运行的塔防互动游戏',
  event: '礼物事件 → 游戏动作',
  description: '一份礼物变成一座防御塔，实时改变直播中的战局。',
  pause: '暂停演示', play: '播放演示',
} : {
  label: 'Tower Defense interactive game running inside LIVE Studio',
  event: 'GIFT EVENT → GAME ACTION',
  description: 'Watch a gift become a tower and reshape the round inside LIVE Studio.',
  pause: 'Pause demo', play: 'Play demo',
})

const togglePlayback = () => {
  if (video.value?.paused) void video.value.play().catch(() => {})
  else video.value?.pause()
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updatePlayback = () => {
    if (reducedMotion.matches) video.value?.pause()
    else void video.value?.play().catch(() => {})
  }
  updatePlayback()
  reducedMotion.addEventListener('change', updatePlayback)
  cleanUp = () => reducedMotion.removeEventListener('change', updatePlayback)
})
onUnmounted(() => cleanUp?.())
</script>

<template>
  <article class="home-live-demo" aria-labelledby="home-demo-title">
    <video
      ref="video" muted loop playsinline preload="metadata"
      poster="/media/interactive-tower-defense-demo.webp"
      role="button" tabindex="0"
      :aria-label="`${copy.label} — ${playing ? copy.pause : copy.play}`"
      @click="togglePlayback" @keydown.space.prevent="togglePlayback" @keydown.enter.prevent="togglePlayback"
      @play="playing = true" @pause="playing = false"
    >
      <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
    </video>
    <div class="home-live-demo__caption">
      <span>{{ copy.event }}</span>
      <h2 id="home-demo-title">Tower Defense × LIVE Studio</h2>
      <p>{{ copy.description }}</p>
    </div>
  </article>
</template>

<style scoped>
.home-live-demo {
  --demo-ink: #0d0d10;
  --demo-text: #ffffff;
  --demo-muted: #d0d2da;
  --demo-type-kicker: 0.625rem;
  --demo-type-title: clamp(1.125rem, 1.8vw, 1.5rem);
  --demo-type-description: 0.75rem;
  --demo-weight: 700;
  --demo-edge: -1px 1px 0 var(--tt-brand-cyan), 1px -1px 0 var(--tt-brand-pink);
  --demo-shadow: 0 20px 48px color-mix(in srgb, var(--demo-ink) 14%, transparent);
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--tt-color-border-strong);
  border-radius: var(--tux-v2-radius-container-level1-large);
  background: var(--demo-ink);
  box-shadow: var(--demo-edge), var(--demo-shadow);
  text-align: left;
}
.home-live-demo video { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; cursor: pointer; }
.home-live-demo video:focus-visible { outline: 2px solid var(--tt-brand-cyan); outline-offset: -4px; }
.home-live-demo__caption { position: absolute; inset: auto 0 0; padding: 18px 22px; color: var(--demo-text); pointer-events: none; }
.home-live-demo__caption::before {
  position: absolute;
  inset: -24px 0 0;
  content: '';
  background: linear-gradient(transparent, color-mix(in srgb, var(--demo-ink) 28%, transparent) 40%, color-mix(in srgb, var(--demo-ink) 72%, transparent));
}
.home-live-demo__caption > * { position: relative; }
.home-live-demo__caption span { color: var(--tt-brand-cyan); font-size: var(--demo-type-kicker); font-weight: var(--demo-weight); letter-spacing: 0.08em; }
.home-live-demo__caption h2 { margin: 5px 0; color: inherit; font-size: var(--demo-type-title); font-weight: var(--demo-weight); line-height: 1.15; letter-spacing: -0.025em; }
.home-live-demo__caption p { max-width: 430px; margin: 0; color: var(--demo-muted); font-size: var(--demo-type-description); line-height: 1.5; }
@media (max-width: 620px) {
  .home-live-demo__caption { padding: 10px 14px; }
  .home-live-demo__caption p { display: none; }
}
</style>
