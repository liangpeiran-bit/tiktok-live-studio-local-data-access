<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  locale?: 'en' | 'zh'
  compact?: boolean
}>(), {
  locale: 'en',
  compact: false,
})

const copy = computed(() => props.locale === 'zh' ? {
  eyebrow: 'BUILT WITH LOCAL DATA ACCESS',
  title: '直播互动，不止一种玩法',
  intro: '两款可直接试玩的 Demo，展示同一套点赞、礼物和评论事件，如何进入不同技术栈与游戏循环。',
  all: '查看全部 Demo',
  play: '立即试玩',
  story: '查看案例',
  simulated: '试玩模式 · 模拟事件',
  games: [
    {
      key: 'tug',
      title: '拔河陷阱',
      kicker: '多人阵营对抗',
      description: '评论选队、点赞蓄力、礼物出招。让整场直播共同决定绳索与主播的位置。',
      stack: 'Vite · TypeScript · PixiJS',
      image: '/media/demos/tug-of-trap-cover.webp',
      detail: '/zh/demos/tug-of-trap',
      demo: 'https://liangpeiran-bit.github.io/playable_interaction_game/?demo=1',
      events: ['live.chat', 'live.like', 'live.gift'],
    },
    {
      key: 'candy',
      title: '糖果擂台',
      kicker: '节奏战斗',
      description: '主播完成节拍与闪避，观众用点赞、助威和礼物技能改变一场糖果格斗。',
      stack: 'React · Phaser · TypeScript',
      image: '/media/demos/candy-arena-cover.webp',
      detail: '/zh/demos/candy-arena-duel',
      demo: 'https://liangpeiran-bit.github.io/candy-arena-duel/?demo=1',
      events: ['live.like', 'live.chat', 'live.gift'],
    },
  ],
} : {
  eyebrow: 'BUILT WITH LOCAL DATA ACCESS',
  title: 'One event stream. Different games.',
  intro: 'Two playable demos show how the same like, gift, and chat events can power very different stacks and game loops.',
  all: 'Explore all demos',
  play: 'Try the demo',
  story: 'View case study',
  simulated: 'Demo mode · simulated events',
  games: [
    {
      key: 'tug',
      title: 'Tug of Trap',
      kicker: 'Team-versus-team party game',
      description: 'Chat selects a team, likes build strength, and gifts trigger skills while the room pulls the streamer across the arena.',
      stack: 'Vite · TypeScript · PixiJS',
      image: '/media/demos/tug-of-trap-cover.webp',
      detail: '/demos/tug-of-trap',
      demo: 'https://liangpeiran-bit.github.io/playable_interaction_game/?demo=1',
      events: ['live.chat', 'live.like', 'live.gift'],
    },
    {
      key: 'candy',
      title: 'Candy Arena',
      kicker: 'Rhythm battle',
      description: 'The creator hits beats and dodges attacks while likes, cheers, and gift skills reshape a candy-colored duel.',
      stack: 'React · Phaser · TypeScript',
      image: '/media/demos/candy-arena-cover.webp',
      detail: '/demos/candy-arena-duel',
      demo: 'https://liangpeiran-bit.github.io/candy-arena-duel/?demo=1',
      events: ['live.like', 'live.chat', 'live.gift'],
    },
  ],
})
</script>

<template>
  <section :class="['tt-demo-showcase', { 'tt-demo-showcase--compact': compact }]" :aria-label="copy.title">
    <header v-if="compact" class="tt-demo-showcase__header">
      <div>
        <p>{{ copy.eyebrow }}</p>
        <h2 id="demo-showcase-title">{{ copy.title }}</h2>
        <span>{{ copy.intro }}</span>
      </div>
      <a :href="locale === 'zh' ? '/zh/demos/' : '/demos/'">{{ copy.all }} <b aria-hidden="true">→</b></a>
    </header>

    <div class="tt-demo-showcase__grid">
      <article v-for="game in copy.games" :key="game.key" :class="['tt-demo-card', `tt-demo-card--${game.key}`]">
        <a class="tt-demo-card__visual" :href="game.detail">
          <img :src="game.image" :alt="`${game.title} gameplay`" loading="lazy">
          <span><i aria-hidden="true" /> {{ copy.simulated }}</span>
        </a>
        <div class="tt-demo-card__body">
          <p>{{ game.kicker }}</p>
          <h3><a :href="game.detail">{{ game.title }}</a></h3>
          <span>{{ game.description }}</span>
          <div class="tt-demo-card__meta">
            <small>{{ game.stack }}</small>
            <ul aria-label="Event types">
              <li v-for="event in game.events" :key="event">{{ event }}</li>
            </ul>
          </div>
          <footer>
            <a class="tt-demo-button tt-demo-button--brand" :href="game.demo" target="_blank" rel="noreferrer">{{ copy.play }} ↗</a>
            <a class="tt-demo-button" :href="game.detail">{{ copy.story }}</a>
          </footer>
        </div>
      </article>
    </div>
  </section>
</template>
