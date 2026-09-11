<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()
const hero = computed(() => frontmatter.value.hero)
const headline = computed(() => hero.value?.headline)
</script>

<template>
  <h1 v-if="headline" class="home-headline" :class="{ 'home-headline--zh': lang.startsWith('zh') }">
    <span class="home-headline__accessible">{{ hero.text }}</span>
    <span class="home-headline__visual" aria-hidden="true">
      <span class="home-headline__lead">
        <span class="home-headline__connector">{{ headline.lead }}</span>{{ ' ' }}<span>{{ headline.subject }}</span>
      </span>
      <span class="home-headline__outcome">
        <span class="home-headline__bridge">{{ headline.bridge }}</span>{{ ' ' }}
        <em class="home-headline__accent" :data-text="headline.accent">
          <span class="home-headline__echo" :data-text="headline.accent"></span>
          <span class="home-headline__electric"></span>
          {{ headline.accent }}
        </em>
      </span>
    </span>
  </h1>
  <h1 v-else class="heading"><span class="text">{{ hero?.text }}</span></h1>
  <p v-if="hero?.tagline" class="tagline">{{ hero.tagline }}</p>
</template>

<style scoped>
.home-headline {
  --headline-type-lead: clamp(1.75rem, 3.8vw, 3.75rem);
  --headline-type-bridge: clamp(1.25rem, 3vw, 2.875rem);
  --headline-type-accent: clamp(3rem, 15vw, 8.25rem);
  --headline-weight-lead: 650;
  --headline-weight-connector: 450;
  --headline-weight-accent: 850;
  --headline-shadow: -2px 0 color-mix(in srgb, var(--tt-brand-cyan) 72%, transparent), 2px 0 color-mix(in srgb, var(--tt-brand-pink) 68%, transparent);
  margin: 0;
  color: var(--tt-color-text-primary);
  font-family: var(--vp-font-family-base);
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
.home-headline__lead { display: block; }

.home-headline__lead {
  font-size: var(--headline-type-lead);
  font-weight: var(--headline-weight-lead);
  line-height: 1.16;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.home-headline__connector,
.home-headline__bridge {
  color: var(--tt-color-text-secondary);
  font-weight: var(--headline-weight-connector);
}

.home-headline__outcome {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.1em 0.2em;
  margin-top: 0.06em;
  font-size: var(--headline-type-accent);
  line-height: 1.08;
}

.home-headline__bridge {
  font-size: var(--headline-type-bridge);
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.home-headline__accent {
  position: relative;
  isolation: isolate;
  display: inline-block;
  font-weight: var(--headline-weight-accent);
  font-style: normal;
  letter-spacing: -0.065em;
  white-space: nowrap;
  text-shadow: var(--headline-shadow);
  transform-origin: left center;
  animation: headline-short-circuit 5s linear 420ms infinite both;
}

.home-headline__accent::before,
.home-headline__accent::after,
.home-headline__echo,
.home-headline__echo::before,
.home-headline__echo::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.home-headline__accent::before,
.home-headline__accent::after {
  z-index: 2;
  content: attr(data-text);
  opacity: 0;
  overflow: hidden;
}

.home-headline__accent::before {
  color: var(--tt-brand-cyan);
  text-shadow: -5px 0 var(--tt-brand-cyan);
  animation: headline-glitch-cyan 5s steps(1, end) 420ms infinite both;
}

.home-headline__accent::after {
  color: var(--tt-brand-pink);
  text-shadow: 5px 0 var(--tt-brand-pink);
  animation: headline-glitch-pink 5s steps(1, end) 420ms infinite both;
}

.home-headline__echo { z-index: -1; }
.home-headline__echo::before,
.home-headline__echo::after { content: attr(data-text); color: transparent; }

.home-headline__echo::before {
  text-shadow: -12px 0 8px color-mix(in srgb, var(--tt-brand-cyan) 72%, transparent), -30px 0 22px color-mix(in srgb, var(--tt-brand-cyan) 30%, transparent);
  animation: headline-tiktok-smear-cyan 5s cubic-bezier(0.42, 0, 0.58, 1) 420ms infinite both;
}

.home-headline__echo::after {
  text-shadow: 12px 0 8px color-mix(in srgb, var(--tt-brand-pink) 72%, transparent), 30px 0 22px color-mix(in srgb, var(--tt-brand-pink) 30%, transparent);
  animation: headline-tiktok-smear-pink 5s cubic-bezier(0.42, 0, 0.58, 1) 420ms infinite both;
}

.home-headline__electric {
  position: absolute;
  z-index: 3;
  top: 52%;
  left: -5%;
  width: 110%;
  height: 2px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, var(--tt-brand-cyan) 12%, var(--tt-color-text-primary) 46% 54%, var(--tt-brand-pink) 88%, transparent);
  transform-origin: left center;
  animation: headline-electric-line 5s steps(1, end) 420ms infinite both;
}

.home-headline--zh {
  --headline-type-accent: clamp(2.5rem, 11vw, 6.5rem);
  --headline-type-bridge: clamp(1.125rem, 2.8vw, 2.5rem);
}

.home-headline--zh .home-headline__lead { letter-spacing: -0.025em; }
.home-headline--zh .home-headline__accent { letter-spacing: -0.045em; }

@media (prefers-reduced-motion: reduce) {
  .home-headline__accent { animation: none; }
  .home-headline__accent::before,
  .home-headline__accent::after,
  .home-headline__echo,
  .home-headline__electric { display: none; animation: none; }
}
</style>
