<script setup lang="ts">
import { computed, onMounted } from 'vue'

const props = defineProps<{
  formId: string
}>()

const isConfigured = computed(() => props.formId && props.formId !== 'FORM_ID')
const embedUrl = computed(
  () =>
    `https://tally.so/embed/${props.formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`,
)
const publicUrl = computed(() => `https://tally.so/r/${props.formId}`)

onMounted(() => {
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
    <div class="apply-glow apply-glow--cyan" aria-hidden="true"></div>
    <div class="apply-glow apply-glow--pink" aria-hidden="true"></div>
    <div class="apply-motion-lines" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <div class="apply-live-signals" aria-hidden="true">
      <span>live.like&nbsp;&nbsp;+1</span>
      <span>live.gift&nbsp;&nbsp;×1</span>
      <span>live.chat&nbsp;&nbsp;hello</span>
      <span>gateway&nbsp;&nbsp;connected</span>
    </div>

    <section class="apply-hero">
      <div class="apply-badge"><span></span> EARLY ACCESS</div>
      <h1>Turn live moments<br /><em>into gameplay.</em></h1>
      <p>
        Apply for LIVE Studio Local Data Access and build interactive games with real-time likes,
        gifts, and chat events.
      </p>
      <div class="event-stream" aria-label="Available live events">
        <span><i class="pulse pulse--cyan"></i> live.like</span>
        <span><i class="pulse pulse--pink"></i> live.gift</span>
        <span><i class="pulse pulse--violet"></i> live.chat</span>
      </div>
    </section>

    <section class="apply-shell">
      <header class="apply-shell__header">
        <div>
          <span class="eyebrow">DEVELOPER PROGRAM</span>
          <h2>Request early access</h2>
        </div>
        <span class="open-status"><i></i> Applications open</span>
      </header>

      <ol class="apply-steps" aria-label="Application steps">
        <li><b>01</b><span>About you</span></li>
        <li><b>02</b><span>Your game</span></li>
        <li><b>03</b><span>Data needs</span></li>
      </ol>

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
  </main>
</template>

<style scoped>
.apply-page {
  --apply-cyan: #25f4ee;
  --apply-pink: #fe2c55;
  --apply-violet: #8b5cf6;
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(260px, 0.78fr) minmax(520px, 1.22fr);
  gap: clamp(32px, 6vw, 88px);
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: clamp(64px, 8vw, 112px) 0 96px;
  color: #f7f8fb;
}

.apply-page::before {
  position: fixed;
  z-index: -3;
  inset: 0;
  content: '';
  background:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    radial-gradient(circle at 10% 16%, rgba(37, 244, 238, 0.22), transparent 34%),
    radial-gradient(circle at 92% 68%, rgba(254, 44, 85, 0.18), transparent 36%),
    radial-gradient(circle at 50% 108%, rgba(139, 92, 246, 0.24), transparent 42%),
    linear-gradient(135deg, #122b50 0%, #1c3157 34%, #342754 68%, #143a47 100%);
  background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0;
  background-size: 40px 40px, 40px 40px, 120% 120%, 120% 120%, 120% 120%, auto;
  animation: ambient-grid 18s ease-in-out infinite alternate;
}

.apply-page::after {
  position: fixed;
  z-index: -2;
  top: -34vh;
  left: -24vw;
  width: 72vw;
  height: 72vw;
  content: '';
  border-radius: 50%;
  background: conic-gradient(from 160deg, transparent 0 34%, rgba(37, 244, 238, 0.13) 45%, transparent 58% 76%, rgba(254, 44, 85, 0.1) 88%, transparent);
  filter: blur(30px);
  pointer-events: none;
  animation: aurora-orbit 24s linear infinite;
}

.apply-glow {
  position: absolute;
  z-index: -1;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  filter: blur(110px);
  opacity: 0.32;
  pointer-events: none;
  animation: glow-float 8s ease-in-out infinite alternate;
}

.apply-glow--cyan {
  top: 10%;
  left: -16%;
  background: var(--apply-cyan);
}

.apply-glow--pink {
  right: -12%;
  bottom: 8%;
  background: var(--apply-pink);
  animation-delay: -3.5s;
}

.apply-motion-lines {
  position: fixed;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.apply-motion-lines span {
  position: absolute;
  top: -18%;
  width: 1px;
  height: 42%;
  opacity: 0;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.48), transparent);
  transform: rotate(34deg);
  animation: light-streak 9s linear infinite;
}

.apply-motion-lines span:nth-child(1) { left: 18%; }
.apply-motion-lines span:nth-child(2) { left: 54%; animation-delay: -3s; }
.apply-motion-lines span:nth-child(3) { left: 84%; animation-delay: -6s; }

.apply-live-signals span {
  position: fixed;
  z-index: -1;
  padding: 8px 11px;
  color: rgba(219, 255, 253, 0.62);
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.03em;
  border: 1px solid rgba(37, 244, 238, 0.16);
  border-radius: 8px;
  background: rgba(19, 48, 80, 0.42);
  box-shadow: 0 10px 36px rgba(4, 11, 30, 0.2);
  backdrop-filter: blur(12px);
  pointer-events: none;
  animation: signal-float 7s ease-in-out infinite alternate;
}

.apply-live-signals span:nth-child(1) { top: 17%; left: 3%; }
.apply-live-signals span:nth-child(2) { top: 30%; right: 3%; color: rgba(255, 215, 224, 0.68); border-color: rgba(254, 44, 85, 0.18); animation-delay: -2s; }
.apply-live-signals span:nth-child(3) { bottom: 16%; left: 4%; color: rgba(230, 217, 255, 0.68); border-color: rgba(139, 92, 246, 0.2); animation-delay: -4s; }
.apply-live-signals span:nth-child(4) { right: 4%; bottom: 8%; animation-delay: -6s; }

.apply-hero {
  position: sticky;
  top: 110px;
  align-self: start;
  padding-top: 38px;
}

.apply-badge,
.eyebrow {
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.18em;
}

.apply-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  color: #b8fffb;
  border: 1px solid rgba(37, 244, 238, 0.22);
  border-radius: 999px;
  background: rgba(37, 244, 238, 0.07);
}

.apply-badge span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--apply-cyan);
  box-shadow: 0 0 14px var(--apply-cyan);
  animation: live-pulse 1.9s ease-in-out infinite;
}

.apply-hero h1 {
  margin: 28px 0 20px;
  font-size: clamp(42px, 5vw, 70px);
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.apply-hero h1 em {
  color: transparent;
  font-style: normal;
  background: linear-gradient(100deg, var(--apply-cyan), #a5fff9 38%, #ffffff 48%, #ff829a 72%, var(--apply-pink));
  background-clip: text;
  -webkit-background-clip: text;
}

.apply-hero > p {
  max-width: 480px;
  margin: 0;
  color: #a8abb7;
  font-size: 16px;
  line-height: 1.7;
}

.event-stream {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 30px;
}

.event-stream span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  color: #d7dae2;
  font: 600 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  background: rgba(16, 26, 49, 0.58);
  backdrop-filter: blur(10px);
}

.pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.pulse--cyan { background: var(--apply-cyan); box-shadow: 0 0 9px var(--apply-cyan); }
.pulse--pink { background: var(--apply-pink); box-shadow: 0 0 9px var(--apply-pink); }
.pulse--violet { background: var(--apply-violet); box-shadow: 0 0 9px var(--apply-violet); }

.apply-shell {
  overflow: hidden;
  border: 1px solid rgba(170, 201, 255, 0.2);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(35, 58, 96, 0.94), rgba(53, 40, 83, 0.94));
  box-shadow:
    -24px 30px 90px rgba(37, 244, 238, 0.08),
    28px -16px 90px rgba(254, 44, 85, 0.08),
    0 34px 100px rgba(4, 8, 24, 0.38),
    inset 0 1px rgba(255, 255, 255, 0.075);
  backdrop-filter: blur(24px);
}

.apply-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 30px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(100deg, rgba(37, 244, 238, 0.045), rgba(139, 92, 246, 0.035) 50%, rgba(254, 44, 85, 0.045));
}

.eyebrow { color: #7c8190; }

.apply-shell__header h2 {
  margin: 7px 0 0;
  color: #f7f8fb;
  font-size: 25px;
  letter-spacing: -0.025em;
}

.open-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  color: #aefbd2;
  font-size: 11px;
  font-weight: 650;
  border: 1px solid rgba(50, 213, 131, 0.19);
  border-radius: 999px;
  background: rgba(50, 213, 131, 0.07);
}

.open-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #45e19a;
  box-shadow: 0 0 10px rgba(69, 225, 154, 0.8);
}

.apply-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 0;
  padding: 20px 30px;
  list-style: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.apply-steps li {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  color: #8c909c;
  font-size: 12px;
}

.apply-steps b {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  color: #d9fbf9;
  font-size: 10px;
  border: 1px solid rgba(37, 244, 238, 0.18);
  border-radius: 8px;
  background: rgba(37, 244, 238, 0.07);
}

.tally-frame {
  min-height: 620px;
  padding: 16px 22px 0;
}

.tally-frame iframe {
  display: block;
  color-scheme: dark;
}

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
  width: 68px;
  height: 68px;
  margin-bottom: 20px;
  color: #081114;
  font-weight: 900;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--apply-cyan), #ffffff 48%, var(--apply-pink));
  box-shadow: -10px 10px 30px rgba(37, 244, 238, 0.12), 10px -10px 30px rgba(254, 44, 85, 0.12);
}

.form-placeholder strong { font-size: 18px; }
.form-placeholder span { margin-top: 8px; color: #7f8390; font-size: 13px; }

.apply-shell__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  padding: 18px 30px 22px;
  color: #747884;
  font-size: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.apply-shell__footer span::before {
  margin-right: 7px;
  color: #4b4f5a;
  content: '•';
}

@keyframes live-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1.15); }
}

@keyframes ambient-grid {
  0% { background-position: 0 0, 0 0, -8% -5%, 8% 4%, 0 6%, 0 0; }
  100% { background-position: 40px 20px, 40px 20px, 8% 7%, -7% -4%, 4% -5%, 0 0; }
}

@keyframes aurora-orbit {
  to { transform: translate(58vw, 44vh) rotate(360deg); }
}

@keyframes glow-float {
  0% { transform: translate3d(-18px, -10px, 0) scale(0.9); }
  100% { transform: translate3d(34px, 28px, 0) scale(1.12); }
}

@keyframes light-streak {
  0% { opacity: 0; transform: translate3d(-18vw, -30vh, 0) rotate(34deg); }
  14% { opacity: 0.32; }
  42%, 100% { opacity: 0; transform: translate3d(34vw, 145vh, 0) rotate(34deg); }
}

@keyframes signal-float {
  0% { opacity: 0.28; transform: translate3d(0, -8px, 0); }
  100% { opacity: 0.72; transform: translate3d(14px, 12px, 0); }
}

@media (max-width: 860px) {
  .apply-page {
    grid-template-columns: 1fr;
    width: min(680px, calc(100% - 28px));
    padding-top: 44px;
  }

  .apply-hero {
    position: relative;
    top: auto;
    padding-top: 12px;
  }

  .apply-hero h1 { max-width: 620px; }
}

@media (max-width: 540px) {
  .apply-page { width: min(100% - 20px, 680px); gap: 28px; padding-bottom: 56px; }
  .apply-hero h1 { font-size: 42px; }
  .apply-shell { border-radius: 18px; }
  .apply-shell__header { display: block; padding: 22px 20px; }
  .open-status { margin-top: 16px; }
  .apply-steps { gap: 8px; padding: 16px 20px; }
  .apply-steps li { display: grid; gap: 6px; }
  .tally-frame { padding-inline: 8px; }
  .apply-shell__footer { display: grid; padding: 16px 20px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .apply-page::before,
  .apply-page::after,
  .apply-glow,
  .apply-motion-lines span,
  .apply-live-signals span,
  .apply-badge span { animation: none; }
}

@media (max-width: 1180px) {
  .apply-live-signals { display: none; }
}
</style>
