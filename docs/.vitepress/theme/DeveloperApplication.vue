<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  formId: string
}>()

const demoVideo = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(true)
const isVideoMuted = ref(true)

const isConfigured = computed(() => props.formId && props.formId !== 'FORM_ID')
const embedUrl = computed(
  () =>
    `https://tally.so/embed/${props.formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`,
)
const publicUrl = computed(() => `https://tally.so/r/${props.formId}`)

async function toggleVideoPlayback() {
  if (!demoVideo.value) return

  if (demoVideo.value.paused) {
    await demoVideo.value.play()
  } else {
    demoVideo.value.pause()
  }
}

function toggleVideoSound() {
  if (!demoVideo.value) return
  demoVideo.value.muted = !demoVideo.value.muted
  isVideoMuted.value = demoVideo.value.muted
}

function syncVideoMute(event: Event) {
  isVideoMuted.value = (event.target as HTMLVideoElement).muted
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    demoVideo.value?.pause()
    isVideoPlaying.value = false
  }

  if (!isConfigured.value) return

  const tallyWindow = window as Window & {
    Tally?: { loadEmbeds: () => void }
  }

  if (tallyWindow.Tally) {
    tallyWindow.Tally.loadEmbeds()
    return
  }

  if (!document.querySelector('script[src="https://tally.so/widgets/embed.js"]')) {
    const script = document.createElement('script')
    script.src = 'https://tally.so/widgets/embed.js'
    script.async = true
    document.body.appendChild(script)
  }
})
</script>

<template>
  <main class="apply-page">
    <div class="apply-noise" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--cyan" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--pink" aria-hidden="true"></div>

    <section class="apply-masthead">
      <div class="apply-copy">
        <div class="apply-badge"><span></span> DEVELOPER EARLY ACCESS</div>
        <p class="apply-kicker">LIVE INTERACTIONS. REAL GAMEPLAY.</p>
        <h1>Build for the moment<br /><em>the chat changes the game.</em></h1>
        <p class="apply-lede">
          Use local, real-time likes, gifts, and chat events to build interactive games in H5,
          Unity, Unreal, or any stack you choose.
        </p>

        <div class="apply-actions">
          <a class="apply-button apply-button--primary" href="#application">Apply for early access</a>
          <a class="apply-button apply-button--secondary" href="/guide/quick-start">Read the quick start</a>
        </div>

        <div class="event-stream" aria-label="Available live events">
          <span><i class="pulse pulse--cyan"></i> live.like</span>
          <span><i class="pulse pulse--pink"></i> live.gift</span>
          <span><i class="pulse pulse--white"></i> live.chat</span>
        </div>
      </div>

      <article class="demo-card" aria-labelledby="demo-title">
        <header class="demo-card__topbar">
          <span class="demo-live"><i></i> LIVE</span>
          <span>INTERACTIVE GAME DEMO</span>
          <span>12 SEC</span>
        </header>

        <div class="demo-media">
          <video
            ref="demoVideo"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            poster="/media/interactive-tower-defense-demo.webp"
            aria-label="Tower Defense interactive game running inside LIVE Studio"
            @play="isVideoPlaying = true"
            @pause="isVideoPlaying = false"
            @volumechange="syncVideoMute"
          >
            <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
          </video>
          <div class="demo-media__shade" aria-hidden="true"></div>

          <div class="demo-story">
            <span>GIFT EVENT → GAME ACTION</span>
            <h2 id="demo-title">Tower Defense × LIVE</h2>
            <p>Watch a gift become a tower and reshape the round inside LIVE Studio.</p>
          </div>

          <div class="demo-controls" aria-label="Video controls">
            <button type="button" :aria-label="isVideoPlaying ? 'Pause demo video' : 'Play demo video'" @click="toggleVideoPlayback">
              {{ isVideoPlaying ? 'Pause' : 'Play' }}
            </button>
            <button type="button" :aria-label="isVideoMuted ? 'Turn demo sound on' : 'Mute demo video'" @click="toggleVideoSound">
              {{ isVideoMuted ? 'Sound on' : 'Mute' }}
            </button>
          </div>
        </div>
      </article>
    </section>

    <section id="application" class="application-section">
      <div class="application-intro">
        <span class="section-index">02 / APPLY</span>
        <h2>Bring your game to LIVE Studio.</h2>
        <p>
          Tell us what you want to build. We are opening local event access to a small group of
          developers first.
        </p>

        <ol class="apply-steps" aria-label="Application steps">
          <li><b>01</b><span>About you</span></li>
          <li><b>02</b><span>Your game</span></li>
          <li><b>03</b><span>Data needs</span></li>
        </ol>
      </div>

      <section class="apply-shell">
        <header class="apply-shell__header">
          <div>
            <span class="eyebrow">DEVELOPER PROGRAM</span>
            <h2>Request early access</h2>
          </div>
          <span class="open-status"><i></i> Applications open</span>
        </header>

        <div v-if="isConfigured" class="tally-frame">
          <iframe
            :data-tally-src="embedUrl"
            loading="lazy"
            width="100%"
            height="960"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            title="LIVE Studio developer access application"
          ></iframe>
          <noscript>
            <a :href="publicUrl">Open the application form</a>
          </noscript>
        </div>

        <div v-else class="form-placeholder" role="status">
          <div class="form-placeholder__mark">LS</div>
          <strong>Application form is being configured</strong>
          <span>The public form will appear here after it is published.</span>
        </div>

        <footer class="apply-shell__footer">
          <span>Private by default</span>
          <span>Reviewed by the LIVE Studio team</span>
          <span>No production access is granted automatically</span>
        </footer>
      </section>
    </section>
  </main>
</template>

<style scoped>
.apply-page {
  --tt-cyan: #25f4ee;
  --tt-pink: #fe2c55;
  --tt-ink: #0d0d10;
  --tt-surface: #171820;
  --tt-surface-raised: #20212b;
  --tt-text: #f8f8fa;
  --tt-muted: #adb0bc;
  position: relative;
  isolation: isolate;
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(56px, 7vw, 96px) 0 104px;
  color: var(--tt-text);
  font-family: 'TikTok Sans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.apply-page::before {
  position: fixed;
  z-index: -4;
  inset: 0;
  content: '';
  background:
    radial-gradient(circle at 12% 12%, rgba(37, 244, 238, 0.18), transparent 30%),
    radial-gradient(circle at 86% 20%, rgba(254, 44, 85, 0.15), transparent 28%),
    radial-gradient(circle at 52% 80%, rgba(85, 72, 176, 0.18), transparent 36%),
    linear-gradient(135deg, #10202b 0%, #191923 44%, #2a1722 100%);
}

.apply-page::after {
  position: fixed;
  z-index: -3;
  inset: 0;
  content: '';
  opacity: 0.32;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, #000, transparent 75%);
  animation: grid-drift 18s linear infinite;
}

.apply-noise {
  position: fixed;
  z-index: -2;
  inset: 0;
  opacity: 0.035;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E");
}

.apply-orbit {
  position: absolute;
  z-index: -1;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.2;
  pointer-events: none;
  animation: orbit-float 8s ease-in-out infinite alternate;
}

.apply-orbit--cyan { top: 6%; left: -12%; background: var(--tt-cyan); }
.apply-orbit--pink { top: 28%; right: -10%; background: var(--tt-pink); animation-delay: -4s; }

.apply-masthead {
  display: grid;
  grid-template-columns: minmax(360px, 0.82fr) minmax(520px, 1.18fr);
  align-items: center;
  gap: clamp(44px, 6vw, 84px);
  min-height: min(720px, calc(100vh - 110px));
}

.apply-copy { padding-block: 28px; }

.apply-badge,
.eyebrow,
.section-index {
  font-size: 11px;
  font-weight: 760;
  letter-spacing: 0.16em;
}

.apply-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 11px;
  color: #dffffd;
  border: 1px solid rgba(37, 244, 238, 0.3);
  border-radius: 8px;
  background: rgba(37, 244, 238, 0.08);
  box-shadow: 4px 4px 0 rgba(254, 44, 85, 0.16);
}

.apply-badge span,
.demo-live i,
.open-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--tt-pink);
  box-shadow: 0 0 12px rgba(254, 44, 85, 0.82);
  animation: live-pulse 1.8s ease-in-out infinite;
}

.apply-kicker {
  margin: 34px 0 13px;
  color: var(--tt-cyan);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.apply-copy h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(44px, 5vw, 72px);
  line-height: 0.98;
  letter-spacing: -0.057em;
}

.apply-copy h1 em {
  display: inline-block;
  color: #fff;
  font-style: normal;
  text-shadow: -3px 0 rgba(37, 244, 238, 0.62), 3px 0 rgba(254, 44, 85, 0.56);
}

.apply-lede {
  max-width: 560px;
  margin: 26px 0 0;
  color: var(--tt-muted);
  font-size: 17px;
  line-height: 1.68;
}

.apply-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.apply-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 760;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.apply-button:hover { color: #fff; text-decoration: none; transform: translateY(-2px); }
.apply-button:focus-visible,
.demo-controls button:focus-visible { outline: 3px solid rgba(37, 244, 238, 0.72); outline-offset: 3px; }

.apply-button--primary {
  background: var(--tt-pink);
  box-shadow: -5px 5px 0 var(--tt-cyan);
}

.apply-button--primary:hover { box-shadow: -7px 7px 0 var(--tt-cyan); }

.apply-button--secondary {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
}

.apply-button--secondary:hover { border-color: rgba(37, 244, 238, 0.5); background: rgba(37, 244, 238, 0.08); }

.event-stream {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 34px;
}

.event-stream span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  color: #d5d7df;
  font: 650 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(7, 8, 12, 0.28);
}

.pulse { width: 6px; height: 6px; border-radius: 50%; }
.pulse--cyan { background: var(--tt-cyan); box-shadow: 0 0 8px var(--tt-cyan); }
.pulse--pink { background: var(--tt-pink); box-shadow: 0 0 8px var(--tt-pink); }
.pulse--white { background: #fff; box-shadow: 0 0 8px rgba(255, 255, 255, 0.7); }

.demo-card {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(12, 13, 17, 0.92);
  box-shadow:
    -9px 9px 0 rgba(37, 244, 238, 0.7),
    9px -9px 0 rgba(254, 44, 85, 0.62),
    0 36px 90px rgba(0, 0, 0, 0.4);
  transform: rotate(0.35deg);
}

.demo-card__topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  color: #838690;
  font: 720 10px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.12em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-card__topbar > :last-child { justify-self: end; }
.demo-live { display: inline-flex; align-items: center; gap: 7px; color: #fff; }
.demo-live i { width: 6px; height: 6px; }

.demo-media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #050609;
}

.demo-media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.demo-media__shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to top, rgba(5, 5, 8, 0.88) 0%, transparent 48%), linear-gradient(90deg, rgba(0, 0, 0, 0.15), transparent 42%);
}

.demo-story {
  position: absolute;
  left: clamp(18px, 4vw, 34px);
  right: 160px;
  bottom: clamp(18px, 3.5vw, 32px);
}

.demo-story span {
  color: var(--tt-cyan);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.demo-story h2 {
  margin: 5px 0 5px;
  color: #fff;
  font-size: clamp(23px, 3vw, 36px);
  line-height: 1;
  letter-spacing: -0.035em;
}

.demo-story p { max-width: 430px; margin: 0; color: #c9cbd2; font-size: 12px; line-height: 1.45; }

.demo-controls {
  position: absolute;
  right: 18px;
  bottom: 20px;
  display: flex;
  gap: 7px;
}

.demo-controls button {
  min-height: 34px;
  padding: 0 11px;
  color: #fff;
  font: 700 11px/1 inherit;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 8px;
  background: rgba(11, 11, 14, 0.68);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}

.demo-controls button:hover { border-color: var(--tt-cyan); background: rgba(20, 22, 27, 0.9); }

.application-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.42fr) minmax(560px, 1fr);
  align-items: start;
  gap: clamp(32px, 6vw, 80px);
  margin-top: clamp(92px, 12vw, 150px);
  scroll-margin-top: 92px;
}

.application-intro { position: sticky; top: 108px; padding-top: 18px; }
.section-index { color: var(--tt-pink); }

.application-intro h2 {
  margin: 18px 0 16px;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.02;
  letter-spacing: -0.045em;
}

.application-intro > p { margin: 0; color: var(--tt-muted); font-size: 15px; line-height: 1.65; }

.apply-steps {
  display: grid;
  gap: 10px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.apply-steps li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #dfe1e7;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.045);
}

.apply-steps b {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: #061416;
  font-size: 10px;
  border-radius: 6px;
  background: var(--tt-cyan);
}

.apply-shell {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(31, 32, 42, 0.97), rgba(18, 19, 26, 0.98));
  box-shadow: 0 38px 110px rgba(0, 0, 0, 0.38), 8px 8px 0 rgba(254, 44, 85, 0.12);
}

.apply-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 28px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(90deg, rgba(37, 244, 238, 0.06), transparent 46%, rgba(254, 44, 85, 0.06));
}

.eyebrow { color: #8d909b; }
.apply-shell__header h2 { margin: 6px 0 0; color: #fff; font-size: 24px; letter-spacing: -0.026em; }

.open-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  color: #bfffdc;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(63, 218, 136, 0.25);
  border-radius: 999px;
  background: rgba(63, 218, 136, 0.08);
}

.open-status i { width: 6px; height: 6px; background: #3fda88; box-shadow: 0 0 9px rgba(63, 218, 136, 0.8); }

.tally-frame { min-height: 620px; padding: 14px 18px 0; }
.tally-frame iframe { display: block; color-scheme: dark; }

.form-placeholder {
  display: grid;
  place-items: center;
  min-height: 560px;
  padding: 60px 24px;
  text-align: center;
}

.form-placeholder__mark {
  display: grid;
  place-items: center;
  width: 66px;
  height: 66px;
  margin-bottom: 20px;
  color: #08090d;
  font-weight: 900;
  border-radius: 14px;
  background: #fff;
  box-shadow: -7px 7px 0 var(--tt-cyan), 7px -7px 0 var(--tt-pink);
}

.form-placeholder strong { font-size: 18px; }
.form-placeholder span { margin-top: 8px; color: #8b8e98; font-size: 13px; }

.apply-shell__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  padding: 18px 28px 22px;
  color: #777a84;
  font-size: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.apply-shell__footer span::before { margin-right: 7px; color: var(--tt-cyan); content: '•'; }

@keyframes live-pulse {
  0%, 100% { opacity: 0.5; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1.18); }
}

@keyframes grid-drift { to { background-position: 56px 28px, 56px 28px; } }

@keyframes orbit-float {
  from { transform: translate3d(-20px, -12px, 0) scale(0.9); }
  to { transform: translate3d(38px, 28px, 0) scale(1.12); }
}

@media (max-width: 980px) {
  .apply-page { width: min(760px, calc(100% - 32px)); padding-top: 44px; }
  .apply-masthead,
  .application-section { grid-template-columns: 1fr; }
  .apply-masthead { min-height: auto; }
  .apply-copy { padding-bottom: 8px; }
  .application-section { gap: 28px; margin-top: 112px; }
  .application-intro { position: static; max-width: 620px; padding-top: 0; }
  .apply-steps { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 620px) {
  .apply-page { width: min(100% - 22px, 760px); padding: 34px 0 64px; }
  .apply-copy h1 { font-size: 43px; }
  .apply-lede { font-size: 15px; }
  .apply-actions { display: grid; }
  .apply-button { width: 100%; }
  .demo-card { border-radius: 11px; box-shadow: -5px 5px 0 rgba(37, 244, 238, 0.66), 5px -5px 0 rgba(254, 44, 85, 0.58), 0 24px 60px rgba(0, 0, 0, 0.4); }
  .demo-card__topbar { grid-template-columns: 1fr auto; }
  .demo-card__topbar > :nth-child(2) { display: none; }
  .demo-story { right: 16px; bottom: 62px; }
  .demo-story p { display: none; }
  .demo-controls { right: 13px; bottom: 13px; left: 13px; }
  .demo-controls button { flex: 1; }
  .application-section { margin-top: 88px; }
  .apply-steps { gap: 7px; }
  .apply-steps li { display: grid; gap: 7px; padding: 10px 8px; }
  .apply-shell { border-radius: 11px; }
  .apply-shell__header { display: block; padding: 22px 20px; }
  .open-status { margin-top: 15px; }
  .tally-frame { padding-inline: 6px; }
  .apply-shell__footer { display: grid; padding: 16px 20px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .apply-page::after,
  .apply-orbit,
  .apply-badge span,
  .demo-live i,
  .open-status i { animation: none; }

  .apply-button { transition: none; }
}
</style>
