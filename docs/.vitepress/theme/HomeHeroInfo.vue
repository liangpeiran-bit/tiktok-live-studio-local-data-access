<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const hero = computed(() => frontmatter.value.hero)
const headline = computed(() => hero.value?.headline)
const openingLines = computed(() => headline.value?.lines?.slice(0, -1) ?? [])
const accentLine = computed(() => headline.value?.lines?.at(-1) ?? '')
</script>

<template>
  <p v-if="hero?.kicker" class="home-hero-kicker">{{ hero.kicker }}</p>
  <h1 v-if="headline" class="home-headline">
    <span class="home-headline__accessible">{{ hero.text }}</span>
    <span class="home-headline__visual" aria-hidden="true">
      <span class="home-headline__lead">{{ headline.lead }}</span>
      <span v-for="line in openingLines" :key="line" class="home-headline__opening">{{ line }}</span>
      <em class="home-headline__accent">
        <span class="home-headline__line" :data-text="accentLine">
          <span class="home-headline__echo" :data-text="accentLine"></span>
          <span class="home-headline__ink">{{ accentLine }}</span>
        </span>
        <span class="home-headline__circuit"></span>
      </em>
    </span>
  </h1>
  <h1 v-else class="heading"><span class="text">{{ hero?.text }}</span></h1>
  <p v-if="hero?.tagline" class="tagline"><template v-if="hero.taglineLines"><span v-for="line in hero.taglineLines" :key="line" class="home-tagline-line">{{ line }}</span></template><template v-else>{{ hero.tagline }}</template></p>
</template>

<style scoped>
.home-headline {
  --headline-type: clamp(3.25rem, 22.6cqi, 7rem);
  --headline-type-lead: clamp(1.25rem, 5.2cqi, 1.625rem);
  --headline-compression: 0.8;
  --headline-weight: 900;
  --headline-weight-lead: 450;
  --headline-cycle: 5s;
  --headline-delay: 420ms;
  --headline-cyan: var(--tt-brand-cyan);
  --headline-pink: var(--tt-brand-pink);
  --headline-shadow: -1.5px 0 color-mix(in srgb, var(--headline-cyan) 72%, transparent), 1.5px 0 color-mix(in srgb, var(--headline-pink) 68%, transparent);
  margin: 0;
  color: var(--home-title-ink, var(--tt-color-text-primary));
  font-family: var(--vp-font-family-base);
  font-size: var(--headline-type);
  font-weight: var(--headline-weight);
  line-height: 0.8;
  letter-spacing: -0.06em;
}
.home-headline:lang(zh) { --headline-type: clamp(2.375rem, 19.5cqi, 6.25rem); --headline-compression: 0.96; line-height: 1.06; letter-spacing: -0.04em; }
.home-headline__accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.home-headline__visual, .home-headline__lead, .home-headline__opening { display: block; }
.home-headline__opening { width: calc(100% / var(--headline-compression)); transform: scaleX(var(--headline-compression)); transform-origin: left center; text-transform: uppercase; white-space: nowrap; -webkit-text-stroke: 0.009em currentColor; }
.home-headline__lead {
  margin-bottom: 16px;
  color: var(--tt-color-text-primary);
  font-size: var(--headline-type-lead);
  font-weight: var(--headline-weight-lead);
  line-height: 1.25;
  letter-spacing: -0.025em;
}
.home-headline__accent {
  position: relative;
  isolation: isolate;
  display: block;
  width: max-content;
  max-width: calc(100% / var(--headline-compression));
  margin-top: 10px;
  padding: 0.08em 0.13em 0.08em;
  transform: scaleX(var(--headline-compression)) rotate(-2.5deg);
  transform-origin: left center;
  color: var(--home-contrast-ink, var(--tt-color-text-primary));
  font: inherit;
  font-style: normal;
  letter-spacing: inherit;
  text-transform: uppercase;
  text-shadow: var(--headline-shadow);
}
.home-headline__accent::before, .home-headline__accent::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  content: '';
}
.home-headline__accent::before {
  background: var(--home-contrast-surface, var(--tt-color-bg-base));
  box-shadow: -3px 3px 0 var(--headline-cyan), 3px -3px 0 var(--headline-pink);
}
.home-headline__accent::after {
  z-index: -2;
  inset: -13px -38px -17px;
  background: var(--headline-pink);
  mask: url('/media/home/brush-stroke.svg') center / 100% 100% no-repeat;
  transform: rotate(5deg);
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
  -webkit-text-stroke: 0.006em currentColor;
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
  background: linear-gradient(90deg, transparent, var(--headline-cyan) 15%, var(--home-contrast-ink, var(--tt-color-text-primary)) 50%, var(--headline-pink) 85%, transparent);
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
