<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()
const wordSpace = computed(() => lang.value.startsWith('zh') ? '' : ' ')
const hero = computed(() => frontmatter.value.hero)
const headline = computed(() => hero.value?.headline)
</script>

<template>
  <p v-if="hero?.kicker" class="home-hero-kicker">{{ hero.kicker }}</p>
  <h1 v-if="headline" class="home-headline">
    <span class="home-headline__accessible">{{ hero.text }}</span>
    <span class="home-headline__visual" aria-hidden="true">
      <span class="home-headline__lead">{{ headline.lead }}{{ wordSpace }}{{ headline.subject }}</span>
      <span class="home-headline__outcome">
        {{ headline.bridge }}{{ wordSpace }}<em class="home-headline__accent" :data-text="headline.accent">{{ headline.accent }}</em>
      </span>
    </span>
  </h1>
  <h1 v-else class="heading"><span class="text">{{ hero?.text }}</span></h1>
  <p v-if="hero?.tagline" class="tagline">{{ hero.tagline }}</p>
</template>

<style scoped>
.home-headline {
  --headline-type: clamp(2rem, 3.6vw, 3.25rem);
  --headline-weight: 720;
  --headline-shadow: -0.7px 0 color-mix(in srgb, var(--tt-brand-cyan) 38%, transparent), 0.7px 0 color-mix(in srgb, var(--tt-brand-pink) 34%, transparent);
  margin: 0;
  color: var(--tt-color-text-primary);
  font-family: var(--vp-font-family-base);
  font-size: var(--headline-type);
  font-weight: var(--headline-weight);
  line-height: 1.14;
  letter-spacing: -0.04em;
}

.home-headline__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.home-headline__visual,
.home-headline__lead,
.home-headline__outcome { display: block; }

.home-headline__lead { text-wrap: balance; }
.home-headline__outcome { margin-top: 0.04em; }

.home-headline__accent {
  position: relative;
  display: inline-block;
  font: inherit;
  letter-spacing: inherit;
  white-space: nowrap;
  text-shadow: var(--headline-shadow);
}

/* Keep the real text still and readable; only two thin color slices move. */
.home-headline__accent::before,
.home-headline__accent::after {
  position: absolute;
  inset: 0;
  content: attr(data-text);
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.home-headline__accent::before {
  color: var(--tt-brand-cyan);
  animation: home-accent-cyan 5s steps(1, end) infinite;
}

.home-headline__accent::after {
  color: var(--tt-brand-pink);
  animation: home-accent-pink 5s steps(1, end) infinite;
}

@keyframes home-accent-cyan {
  0%, 90%, 94%, 100% { opacity: 0; transform: translateX(0); }
  91% { opacity: 0.4; clip-path: inset(28% 0 58% 0); transform: translateX(-2px); }
  92.5% { opacity: 0.25; clip-path: inset(65% 0 22% 0); transform: translateX(1px); }
}

@keyframes home-accent-pink {
  0%, 90%, 94%, 100% { opacity: 0; transform: translateX(0); }
  91% { opacity: 0.35; clip-path: inset(62% 0 24% 0); transform: translateX(2px); }
  92.5% { opacity: 0.2; clip-path: inset(32% 0 55% 0); transform: translateX(-1px); }
}

@media (prefers-reduced-motion: reduce) {
  .home-headline__accent::before,
  .home-headline__accent::after { display: none; animation: none; }
}
</style>
