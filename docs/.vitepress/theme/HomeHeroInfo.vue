<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const hero = computed(() => frontmatter.value.hero)
const headline = computed(() => hero.value?.headline)
</script>

<template>
  <p v-if="hero?.kicker" class="home-hero-kicker">{{ hero.kicker }}</p>
  <h1 v-if="headline" class="home-headline">
    <span class="home-headline__accessible">{{ hero.text }}</span>
    <span class="home-headline__visual" aria-hidden="true">
      <span class="home-headline__lead">{{ headline.lead }}</span>
      <em class="home-headline__accent">
        <span v-for="line in headline.lines" :key="line" class="home-headline__line" :data-text="line">
          <span class="home-headline__echo" :data-text="line"></span>
          <span class="home-headline__ink">{{ line }}</span>
        </span>
        <span class="home-headline__circuit"></span>
      </em>
    </span>
  </h1>
  <h1 v-else class="heading"><span class="text">{{ hero?.text }}</span></h1>
  <p v-if="hero?.tagline" class="tagline">{{ hero.tagline }}</p>
</template>

<style scoped>
.home-headline {
  --headline-type: clamp(2.25rem, 4vw, 3.75rem);
  --headline-type-lead: clamp(1.5rem, 2.1vw, 1.875rem);
  --headline-weight: 750;
  --headline-weight-lead: 550;
  --headline-cycle: 5s;
  --headline-delay: 420ms;
  --headline-cyan: var(--tt-brand-cyan);
  --headline-pink: var(--tt-brand-pink);
  --headline-shadow: -1.5px 0 color-mix(in srgb, var(--headline-cyan) 72%, transparent), 1.5px 0 color-mix(in srgb, var(--headline-pink) 68%, transparent);
  margin: 0;
  color: var(--tt-color-text-primary);
  font-family: var(--vp-font-family-base);
  font-size: var(--headline-type);
  font-weight: var(--headline-weight);
  line-height: 1.07;
  letter-spacing: -0.045em;
}
.home-headline:lang(zh) { --headline-type: clamp(1.875rem, 3.4vw, 3.125rem); letter-spacing: -0.045em; }
.home-headline__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.home-headline__visual, .home-headline__lead { display: block; }
.home-headline__lead {
  color: var(--tt-color-text-secondary);
  font-size: var(--headline-type-lead);
  font-weight: var(--headline-weight-lead);
  line-height: 1.25;
  letter-spacing: -0.025em;
}
.home-headline__accent {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin-top: 16px;
  font: inherit;
  letter-spacing: inherit;
  text-shadow: var(--headline-shadow);
}
.home-headline__line {
  position: relative;
  display: block;
  isolation: isolate;
  white-space: nowrap;
}
.home-headline__ink {
  position: relative;
  z-index: 1;
  display: block;
  transform-origin: left center;
  animation: headline-short-circuit var(--headline-cycle) linear var(--headline-delay) infinite;
}
.home-headline__line::before, .home-headline__line::after {
  position: absolute;
  z-index: 2;
  inset: 0;
  content: attr(data-text);
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}
.home-headline__line::before {
  color: var(--headline-cyan);
  animation: headline-glitch-cyan var(--headline-cycle) steps(1, end) var(--headline-delay) infinite;
}
.home-headline__line::after {
  color: var(--headline-pink);
  animation: headline-glitch-pink var(--headline-cycle) steps(1, end) var(--headline-delay) infinite;
}
.home-headline__echo { position: absolute; z-index: 0; inset: 0; pointer-events: none; }
.home-headline__echo::before, .home-headline__echo::after {
  position: absolute;
  inset: 0;
  content: attr(data-text);
  color: transparent;
  opacity: 0;
}
.home-headline__echo::before {
  text-shadow: -8px 0 8px color-mix(in srgb, var(--headline-cyan) 80%, transparent), -20px 0 18px color-mix(in srgb, var(--headline-cyan) 32%, transparent);
  animation: headline-tiktok-smear-cyan var(--headline-cycle) ease-in-out var(--headline-delay) infinite;
}
.home-headline__echo::after {
  text-shadow: 8px 0 8px color-mix(in srgb, var(--headline-pink) 76%, transparent), 20px 0 18px color-mix(in srgb, var(--headline-pink) 30%, transparent);
  animation: headline-tiktok-smear-pink var(--headline-cycle) ease-in-out var(--headline-delay) infinite;
}
.home-headline__circuit {
  position: absolute;
  z-index: 3;
  top: 51%;
  left: 0;
  width: 100%;
  height: 1px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, var(--headline-cyan) 15%, var(--tt-color-text-primary) 50%, var(--headline-pink) 85%, transparent);
  transform-origin: left center;
  pointer-events: none;
  animation: headline-electric-line var(--headline-cycle) linear var(--headline-delay) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .home-headline__ink { animation: none; }
  .home-headline__line::before, .home-headline__line::after,
  .home-headline__echo::before, .home-headline__echo::after,
  .home-headline__circuit { display: none; animation: none; }
}
</style>
