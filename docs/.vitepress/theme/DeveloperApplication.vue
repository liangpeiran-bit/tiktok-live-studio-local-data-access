<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  formId: string
  locale?: 'en' | 'zh'
}>()

const demoVideo = ref<HTMLVideoElement | null>(null)
const tallyFrame = ref<HTMLIFrameElement | null>(null)
const successPanel = ref<HTMLElement | null>(null)
const submitted = ref(false)

const isZh = computed(() => props.locale === 'zh')
const copy = computed(() =>
  isZh.value
    ? {
        badge: '开发者抢先体验',
        kicker: '直播互动，实时成为玩法',
        headlineLead: '为直播互动而生',
        headlineAccent: '让弹幕改变游戏',
        lede: '使用本机实时的点赞、礼物和评论事件，在 H5、Unity、Unreal 或任意技术栈中构建互动游戏。',
        applyAction: '申请抢先体验',
        quickStartAction: '阅读快速开始',
        quickStartHref: '/zh/guide/quick-start',
        demoAria: '在 LIVE Studio 中运行的塔防互动游戏',
        demoEvent: '礼物事件 → 游戏动作',
        demoTitle: 'Tower Defense × LIVE Studio',
        demoDescription: '观看一份礼物如何变成防御塔，并实时改变 LIVE Studio 内的战局。',
        sectionIndex: '02 / 申请',
        applicationTitle: '四步接入 LIVE Studio',
        applicationDescription: '先告诉我们你想做什么。审核通过后，开发凭据会发送到你的申请邮箱。',
        stepsAria: 'LIVE Studio 开发者接入流程',
        steps: [
          {
            title: '提交申请',
            description: '填写开发者、游戏和所需直播事件信息。',
            meta: '在线提交',
          },
          {
            title: 'LIVE Studio 官方审核',
            description: '团队确认使用场景、测试信息与接入计划。',
            meta: '邮件同步结果',
          },
          {
            title: '邮件获取 Secret Key',
            description: '审核通过后，凭据和接入说明会发送到申请邮箱。',
            meta: '仅发送至申请邮箱',
          },
          {
            title: '连接本地 LIVE Studio',
            description: '使用 Secret Key 完成 WebSocket 鉴权，开始接收直播事件。',
            meta: '本地 WebSocket',
          },
        ],
        secretNote: '请勿将 Secret Key 提交到公开仓库或分享给无关人员。',
        program: '开发者计划',
        requestAccess: '申请抢先体验',
        applicationsOpen: '申请开放中',
        iframeTitle: 'LIVE Studio 开发者接入申请表',
        openForm: '打开申请表',
        successEyebrow: '申请已提交',
        successTitle: '感谢你的申请',
        successDescription: '我们将在 3 个工作日内完成审核，并通过你填写的工作邮箱发送审核结果。',
        successWindow: '工作日内',
        successNote: '请留意收件箱和垃圾邮件。',
        configuringTitle: '申请表正在配置中',
        configuringDescription: '公开表单发布后会显示在这里。',
        footer: ['默认保护隐私', '由 LIVE Studio 团队审核', '提交申请不会自动获得生产环境权限'],
      }
    : {
        badge: 'DEVELOPER EARLY ACCESS',
        kicker: 'LIVE INTERACTIONS. REAL GAMEPLAY.',
        headlineLead: 'Build for the moment',
        headlineAccent: 'the chat changes the game.',
        lede: 'Use local, real-time likes, gifts, and chat events to build interactive games in H5, Unity, Unreal, or any stack you choose.',
        applyAction: 'Apply for early access',
        quickStartAction: 'Read the quick start',
        quickStartHref: '/guide/quick-start',
        demoAria: 'Tower Defense interactive game running inside LIVE Studio',
        demoEvent: 'GIFT EVENT → GAME ACTION',
        demoTitle: 'Tower Defense × LIVE Studio',
        demoDescription: 'Watch a gift become a tower and reshape the round inside LIVE Studio.',
        sectionIndex: '02 / APPLY',
        applicationTitle: 'Four steps to your first connection.',
        applicationDescription: 'Tell us what you are building. Once approved, your developer credentials will arrive by email.',
        stepsAria: 'LIVE Studio developer access journey',
        steps: [
          {
            title: 'Submit your application',
            description: 'Share your developer profile, game, and requested live events.',
            meta: 'Online form',
          },
          {
            title: 'LIVE Studio review',
            description: 'Our team reviews the use case, testing details, and launch plan.',
            meta: 'Result sent by email',
          },
          {
            title: 'Receive your Secret Key',
            description: 'Approved developers receive credentials and connection guidance by email.',
            meta: 'Sent to your work email',
          },
          {
            title: 'Connect to LIVE Studio',
            description: 'Authenticate the local WebSocket with your Secret Key and start receiving events.',
            meta: 'Local WebSocket',
          },
        ],
        secretNote: 'Never commit your Secret Key to a public repository or share it outside your team.',
        program: 'DEVELOPER PROGRAM',
        requestAccess: 'Request early access',
        applicationsOpen: 'Applications open',
        iframeTitle: 'LIVE Studio developer access application',
        openForm: 'Open the application form',
        successEyebrow: 'APPLICATION RECEIVED',
        successTitle: 'Thanks for applying.',
        successDescription: 'We will review your application and email the result to your work address within 3 business days.',
        successWindow: 'business days',
        successNote: 'Please check your inbox and spam folder.',
        configuringTitle: 'Application form is being configured',
        configuringDescription: 'The public form will appear here after it is published.',
        footer: ['Private by default', 'Reviewed by the LIVE Studio team', 'No production access is granted automatically'],
      },
)

const isConfigured = computed(() => props.formId && props.formId !== 'FORM_ID')
const embedUrl = computed(
  () =>
    `https://tally.so/embed/${props.formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`,
)
const publicUrl = computed(() => `https://tally.so/r/${props.formId}`)

const handleTallyMessage = (event: MessageEvent) => {
  if (
    event.origin !== 'https://tally.so' ||
    event.source !== tallyFrame.value?.contentWindow ||
    typeof event.data !== 'string' ||
    !event.data.includes('Tally.FormSubmitted')
  ) {
    return
  }

  submitted.value = true
  void nextTick(() => successPanel.value?.focus())
}

onMounted(() => {
  window.addEventListener('message', handleTallyMessage)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    demoVideo.value?.pause()
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

onBeforeUnmount(() => {
  window.removeEventListener('message', handleTallyMessage)
})
</script>

<template>
  <main class="apply-page" :class="{ 'apply-page--zh': isZh }" :lang="isZh ? 'zh-CN' : 'en'">
    <div class="apply-noise" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--cyan" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--pink" aria-hidden="true"></div>
    <div class="radial-light-columns" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span>
    </div>
    <div class="apply-ribbons" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <div class="ambient-events" aria-hidden="true">
      <span>LIKE +248</span>
      <span>ROSE ×1</span>
      <span>WAVE CLEARED</span>
      <span>LIVE.CHAT</span>
      <span>CONNECTED</span>
    </div>

    <section class="apply-masthead">
      <div class="apply-copy">
        <div class="apply-badge"><span></span>{{ copy.badge }}</div>
        <p class="apply-kicker">{{ copy.kicker }}</p>
        <h1 class="apply-headline">
          <span class="apply-headline__lead">{{ copy.headlineLead }}</span>
          <em :data-text="copy.headlineAccent">
            <span class="headline-tiktok-echo" :data-text="copy.headlineAccent" aria-hidden="true"></span>
            <span class="headline-short-circuit" aria-hidden="true"></span>
            {{ copy.headlineAccent }}
          </em>
        </h1>
        <p class="apply-lede">{{ copy.lede }}</p>

        <div class="apply-actions">
          <a class="apply-button apply-button--primary" href="#application">{{ copy.applyAction }}</a>
          <a class="apply-button apply-button--secondary" :href="copy.quickStartHref">{{ copy.quickStartAction }}</a>
        </div>

      </div>

      <article class="demo-card" aria-labelledby="demo-title">
        <div class="demo-media">
          <video
            ref="demoVideo"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            poster="/media/interactive-tower-defense-demo.webp"
            :aria-label="copy.demoAria"
          >
            <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
          </video>
          <div class="demo-media__shade" aria-hidden="true"></div>

          <div class="demo-story">
            <span>{{ copy.demoEvent }}</span>
            <h2 id="demo-title">{{ copy.demoTitle }}</h2>
            <p>{{ copy.demoDescription }}</p>
          </div>
        </div>
      </article>
    </section>

    <section id="application" class="application-section">
      <div class="application-intro">
        <span class="section-index">{{ copy.sectionIndex }}</span>
        <h2>{{ copy.applicationTitle }}</h2>
        <p>{{ copy.applicationDescription }}</p>

        <ol class="apply-steps" :aria-label="copy.stepsAria">
          <li v-for="(step, index) in copy.steps" :key="step.title">
            <div class="step-marker" aria-hidden="true"><span>0{{ index + 1 }}</span></div>
            <div class="step-content">
              <div class="step-heading">
                <h3>{{ step.title }}</h3>
              </div>
              <p>{{ step.description }}</p>
              <span class="step-meta">{{ step.meta }}</span>
            </div>
          </li>
        </ol>

        <p class="secret-note"><strong>SECRET KEY</strong>{{ copy.secretNote }}</p>
      </div>

      <section class="apply-shell">
        <header class="apply-shell__header">
          <div>
            <span class="eyebrow">{{ copy.program }}</span>
            <h2>{{ copy.requestAccess }}</h2>
          </div>
          <span class="open-status"><i></i>{{ copy.applicationsOpen }}</span>
        </header>

        <div
          v-if="isConfigured && submitted"
          ref="successPanel"
          class="submission-success"
          role="status"
          tabindex="-1"
        >
          <span class="submission-success__eyebrow"><i aria-hidden="true"></i>{{ copy.successEyebrow }}</span>
          <h3>{{ copy.successTitle }}</h3>
          <p>{{ copy.successDescription }}</p>
          <div class="review-window" aria-hidden="true">
            <strong>3</strong><span>{{ copy.successWindow }}</span>
          </div>
          <small>{{ copy.successNote }}</small>
        </div>

        <div v-else-if="isConfigured" class="tally-frame">
          <iframe
            ref="tallyFrame"
            :data-tally-src="embedUrl"
            loading="lazy"
            width="100%"
            height="960"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            :title="copy.iframeTitle"
          ></iframe>
          <noscript>
            <a :href="publicUrl">{{ copy.openForm }}</a>
          </noscript>
        </div>

        <div v-else class="form-placeholder" role="status">
          <div class="form-placeholder__mark">LS</div>
          <strong>{{ copy.configuringTitle }}</strong>
          <span>{{ copy.configuringDescription }}</span>
        </div>

        <footer class="apply-shell__footer">
          <span v-for="item in copy.footer" :key="item">{{ item }}</span>
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
  --tt-ray-cyan: rgba(62, 188, 188, 0.62);
  --tt-ray-pink: rgba(172, 74, 98, 0.5);
  --apply-layout-width: 1600px;
  --apply-copy-width: 560px;
  --apply-type-display: clamp(52px, 4.25vw, 68px);
  --apply-type-display-zh: clamp(50px, 3.7vw, 62px);
  --apply-type-section: clamp(38px, 3.5vw, 50px);
  --apply-radius-control: var(--tux-v2-radius-content-large);
  --apply-radius-card: var(--tux-v2-radius-container-level1-large);
  --apply-shadow-media: 0 38px 96px rgba(0, 0, 0, 0.42);
  --apply-shadow-panel: 0 34px 90px rgba(0, 0, 0, 0.34);
  position: relative;
  isolation: isolate;
  width: min(var(--apply-layout-width), calc(100% - 64px));
  margin: 0 auto;
  padding: clamp(52px, 5.5vw, 82px) 0 112px;
  color: var(--tt-text);
  font-family: 'TikTok Sans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  opacity: 0.16;
  pointer-events: none;
  animation: orbit-float 8s ease-in-out infinite alternate;
}

.apply-orbit--cyan { top: 6%; left: -12%; background: var(--tt-cyan); }
.apply-orbit--pink { top: 28%; right: -10%; background: var(--tt-pink); animation-delay: -4s; }

.radial-light-columns {
  position: fixed;
  z-index: -1;
  top: 48px;
  left: 0;
  width: min(56vw, 920px);
  height: min(74vh, 780px);
  overflow: hidden;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse 94% 90% at 0 0, #000 0 38%, rgba(0, 0, 0, 0.82) 62%, transparent 92%);
  mask-image: radial-gradient(ellipse 94% 90% at 0 0, #000 0 38%, rgba(0, 0, 0, 0.82) 62%, transparent 92%);
}

.radial-light-columns::before {
  position: absolute;
  top: -180px;
  left: -210px;
  width: 500px;
  height: 500px;
  content: '';
  border-radius: 50%;
  background: radial-gradient(circle, rgba(62, 188, 188, 0.2), rgba(172, 74, 98, 0.08) 38%, transparent 72%);
  filter: blur(42px);
}

.radial-light-columns span {
  --ray-angle: 12deg;
  --ray-length: min(42vw, 680px);
  --ray-width: 72px;
  --ray-color: var(--tt-ray-cyan);
  --ray-opacity-low: 0.11;
  --ray-opacity-high: 0.22;
  position: absolute;
  top: -10px;
  left: -46px;
  width: var(--ray-length);
  height: var(--ray-width);
  border-radius: 0 999px 999px 0;
  background: linear-gradient(90deg, var(--ray-color), var(--ray-color) 22%, transparent 88%);
  clip-path: polygon(0 40%, 100% 0, 100% 100%, 0 60%);
  filter: blur(14px);
  mix-blend-mode: screen;
  transform-origin: 0 50%;
  will-change: opacity, transform;
  animation: radial-column-breathe 10s ease-in-out infinite;
}

.radial-light-columns span:nth-child(1) { --ray-angle: 5deg; --ray-length: min(34vw, 560px); --ray-width: 52px; --ray-opacity-low: 0.11; --ray-opacity-high: 0.2; animation-delay: -2s; }
.radial-light-columns span:nth-child(2) { --ray-angle: 14deg; --ray-length: min(44vw, 720px); --ray-width: 82px; --ray-opacity-low: 0.12; --ray-opacity-high: 0.23; animation-delay: -7s; animation-duration: 12s; }
.radial-light-columns span:nth-child(3) { --ray-angle: 24deg; --ray-length: min(40vw, 660px); --ray-width: 70px; --ray-color: var(--tt-ray-pink); --ray-opacity-low: 0.1; --ray-opacity-high: 0.2; animation-delay: -4s; animation-duration: 11s; }
.radial-light-columns span:nth-child(4) { --ray-angle: 35deg; --ray-length: min(46vw, 760px); --ray-width: 96px; --ray-opacity-low: 0.14; --ray-opacity-high: 0.27; animation-delay: -9s; animation-duration: 13s; }
.radial-light-columns span:nth-child(5) { --ray-angle: 47deg; --ray-length: min(40vw, 650px); --ray-width: 78px; --ray-color: var(--tt-ray-pink); --ray-opacity-low: 0.1; --ray-opacity-high: 0.2; animation-delay: -5s; animation-duration: 11.5s; }
.radial-light-columns span:nth-child(6) { --ray-angle: 59deg; --ray-length: min(42vw, 690px); --ray-width: 88px; --ray-opacity-low: 0.12; --ray-opacity-high: 0.24; animation-delay: -1s; animation-duration: 12.5s; }
.radial-light-columns span:nth-child(7) { --ray-angle: 70deg; --ray-length: min(34vw, 560px); --ray-width: 64px; --ray-color: var(--tt-ray-pink); --ray-opacity-low: 0.08; --ray-opacity-high: 0.16; animation-delay: -8s; animation-duration: 14s; }
.radial-light-columns span:nth-child(8) { --ray-angle: 80deg; --ray-length: min(29vw, 480px); --ray-width: 52px; --ray-opacity-low: 0.08; --ray-opacity-high: 0.16; animation-delay: -3s; animation-duration: 13.5s; }

.apply-ribbons {
  position: fixed;
  z-index: -2;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.apply-ribbons span {
  position: absolute;
  width: 72vw;
  height: 12vw;
  min-height: 100px;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.1;
  transform: rotate(-18deg);
  animation: ribbon-sweep 14s ease-in-out infinite alternate;
}

.apply-ribbons span:nth-child(1) {
  top: 8%;
  left: -30%;
  background: linear-gradient(90deg, transparent, var(--tt-cyan), transparent);
}

.apply-ribbons span:nth-child(2) {
  top: 36%;
  right: -34%;
  background: linear-gradient(90deg, transparent, var(--tt-pink), transparent);
  animation-delay: -5s;
}

.apply-ribbons span:nth-child(3) {
  bottom: 5%;
  left: -8%;
  background: linear-gradient(90deg, transparent, #8d7dff, transparent);
  animation-delay: -9s;
}

.ambient-events span {
  position: fixed;
  z-index: -1;
  padding: 7px 10px;
  color: rgba(224, 255, 253, 0.42);
  font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.08em;
  border: 1px solid rgba(37, 244, 238, 0.14);
  border-radius: 6px;
  background: rgba(11, 19, 25, 0.22);
  backdrop-filter: blur(8px);
  pointer-events: none;
  animation: event-drift 9s ease-in-out infinite alternate;
}

.ambient-events span:nth-child(1) { top: 20%; left: 2%; }
.ambient-events span:nth-child(2) { top: 36%; right: 2%; color: rgba(255, 215, 223, 0.48); border-color: rgba(254, 44, 85, 0.16); animation-delay: -2s; }
.ambient-events span:nth-child(3) { top: 64%; left: 3%; animation-delay: -4s; }
.ambient-events span:nth-child(4) { right: 3%; bottom: 18%; color: rgba(255, 215, 223, 0.48); border-color: rgba(254, 44, 85, 0.16); animation-delay: -6s; }
.ambient-events span:nth-child(5) { right: 10%; bottom: 4%; animation-delay: -8s; }

.apply-masthead {
  display: grid;
  grid-template-columns: minmax(480px, 0.72fr) minmax(0, 1.28fr);
  align-items: center;
  gap: clamp(54px, 5vw, 84px);
  min-height: min(720px, calc(100svh - 96px));
}

.apply-copy {
  width: min(100%, var(--apply-copy-width));
  padding-block: 12px;
}

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
  border-radius: var(--apply-radius-control);
  background: rgba(37, 244, 238, 0.08);
  box-shadow: 4px 4px 0 rgba(254, 44, 85, 0.16);
}

.apply-badge span,
.open-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--tt-pink);
  box-shadow: 0 0 12px rgba(254, 44, 85, 0.82);
  animation: live-pulse 1.8s ease-in-out infinite;
}

.apply-kicker {
  margin: 30px 0 14px;
  color: var(--tt-cyan);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.apply-headline {
  margin: 0;
  color: #fff;
  font-size: var(--apply-type-display);
  line-height: 0.97;
  letter-spacing: -0.052em;
  text-wrap: balance;
}

.apply-headline__lead,
.apply-headline em {
  display: block;
}

.apply-headline em {
  display: inline-block;
  position: relative;
  isolation: isolate;
  margin-top: 10px;
  color: #fff;
  font-style: normal;
  text-shadow:
    -3px 0 rgba(37, 244, 238, 0.82),
    3px 0 rgba(254, 44, 85, 0.78),
    0 0 18px rgba(255, 255, 255, 0.16);
  transform-origin: left center;
  will-change: filter, opacity, transform;
  animation: headline-short-circuit 5s linear 420ms infinite both;
}

.apply-page--zh .apply-headline {
  font-size: var(--apply-type-display-zh);
  line-height: 1.06;
  letter-spacing: -0.065em;
}

.apply-page--zh .apply-headline__lead,
.apply-page--zh .apply-headline em {
  white-space: nowrap;
}

.apply-headline em::before,
.apply-headline em::after {
  position: absolute;
  z-index: 2;
  inset: 0;
  content: attr(data-text);
  overflow: hidden;
  color: #fff;
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  will-change: clip-path, opacity, transform;
}

.apply-headline em::before {
  text-shadow: -5px 0 var(--tt-cyan), -14px 0 rgba(37, 244, 238, 0.5);
  animation: headline-glitch-cyan 5s steps(1, end) 420ms infinite both;
}

.apply-headline em::after {
  text-shadow: 5px 0 var(--tt-pink), 14px 0 rgba(254, 44, 85, 0.5);
  animation: headline-glitch-pink 5s steps(1, end) 420ms infinite both;
}

.headline-tiktok-echo {
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
}

.headline-tiktok-echo::before,
.headline-tiktok-echo::after {
  position: absolute;
  inset: 0;
  content: attr(data-text);
  color: transparent;
  mix-blend-mode: screen;
  will-change: filter, opacity, transform;
}

.headline-tiktok-echo::before {
  text-shadow:
    -12px 0 8px rgba(37, 244, 238, 0.92),
    -30px 0 22px rgba(37, 244, 238, 0.46),
    -52px 0 38px rgba(37, 244, 238, 0.2);
  animation: headline-tiktok-smear-cyan 5s cubic-bezier(0.42, 0, 0.58, 1) 420ms infinite both;
}

.headline-tiktok-echo::after {
  text-shadow:
    12px 0 8px rgba(254, 44, 85, 0.92),
    30px 0 22px rgba(254, 44, 85, 0.46),
    52px 0 38px rgba(254, 44, 85, 0.2);
  animation: headline-tiktok-smear-pink 5s cubic-bezier(0.42, 0, 0.58, 1) 420ms infinite both;
}

.headline-short-circuit {
  position: absolute;
  z-index: 3;
  top: 52%;
  left: -10%;
  width: 120%;
  height: 2px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, var(--tt-cyan) 12%, #fff 46% 54%, var(--tt-pink) 88%, transparent);
  box-shadow:
    0 -8px 0 rgba(37, 244, 238, 0.36),
    0 8px 0 rgba(254, 44, 85, 0.34),
    0 0 18px rgba(255, 255, 255, 0.72);
  transform-origin: left center;
  pointer-events: none;
  will-change: opacity, transform;
  animation: headline-electric-line 5s steps(1, end) 420ms infinite both;
}

.apply-lede {
  max-width: 520px;
  margin: 24px 0 0;
  color: var(--tt-muted);
  font-size: 16px;
  line-height: 1.64;
}

.apply-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
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
  border-radius: var(--apply-radius-control);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

.apply-button:hover { color: #fff; text-decoration: none; transform: translateY(-2px); }
.apply-button:focus-visible { outline: 3px solid rgba(37, 244, 238, 0.72); outline-offset: 3px; }

.apply-button--primary {
  color: #fff;
  border-color: transparent;
  background:
    linear-gradient(#08090d, #08090d) padding-box,
    linear-gradient(110deg, var(--tt-cyan) 0 44%, var(--tt-pink) 56% 100%) border-box;
  box-shadow:
    -5px 5px 0 var(--tt-cyan),
    5px -5px 0 var(--tt-pink),
    0 12px 28px rgba(0, 0, 0, 0.32);
}

.apply-button--primary:hover {
  background:
    linear-gradient(#111218, #08090d) padding-box,
    linear-gradient(110deg, var(--tt-cyan) 0 44%, var(--tt-pink) 56% 100%) border-box;
  box-shadow:
    -7px 7px 0 var(--tt-cyan),
    7px -7px 0 var(--tt-pink),
    0 16px 34px rgba(0, 0, 0, 0.4);
}

.apply-button--primary:active {
  transform: translateY(1px);
  box-shadow:
    -3px 3px 0 var(--tt-cyan),
    3px -3px 0 var(--tt-pink),
    0 8px 18px rgba(0, 0, 0, 0.3);
}

.apply-button--secondary {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
}

.apply-button--secondary:hover { border-color: rgba(37, 244, 238, 0.5); background: rgba(37, 244, 238, 0.08); }

.demo-card {
  align-self: center;
  width: min(100%, 980px);
  justify-self: end;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--apply-radius-card);
  background: rgba(12, 13, 17, 0.92);
  box-shadow:
    -9px 9px 0 rgba(37, 244, 238, 0.68),
    9px -9px 0 rgba(254, 44, 85, 0.62),
    var(--apply-shadow-media);
  transform: none;
  transform-origin: left center;
  transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 350ms ease;
  animation: demo-enter 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.demo-card:hover {
  box-shadow:
    -12px 12px 0 rgba(37, 244, 238, 0.74),
    12px -12px 0 rgba(254, 44, 85, 0.68),
    0 48px 112px rgba(0, 0, 0, 0.5);
  transform: translateY(-4px);
}

.demo-media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #050609;
}

.demo-media::after {
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: -32%;
  width: 18%;
  content: '';
  opacity: 0.13;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  filter: blur(8px);
  transform: skewX(-16deg);
  pointer-events: none;
  animation: media-scan 6s ease-in-out infinite;
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
  left: clamp(20px, 3vw, 32px);
  right: 32px;
  bottom: clamp(20px, 3vw, 30px);
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
  font-size: clamp(24px, 2.5vw, 34px);
  line-height: 1;
  letter-spacing: -0.035em;
}

.demo-story p { max-width: 430px; margin: 0; color: #c9cbd2; font-size: 12px; line-height: 1.45; }

.application-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(400px, 0.54fr) minmax(680px, 1fr);
  align-items: start;
  gap: clamp(48px, 5vw, 76px);
  margin-top: clamp(96px, 10vw, 132px);
  padding-top: clamp(54px, 6vw, 78px);
  scroll-margin-top: 92px;
}

.application-section::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(37, 244, 238, 0.36) 18%, rgba(255, 255, 255, 0.12) 50%, rgba(254, 44, 85, 0.34) 82%, transparent);
}

.application-intro { position: sticky; top: 92px; max-width: 520px; padding-top: 10px; }
.section-index { color: var(--tt-pink); }

.application-intro h2 {
  max-width: 500px;
  margin: 16px 0 16px;
  font-size: var(--apply-type-section);
  line-height: 1.05;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.application-intro > p { max-width: 470px; margin: 0; color: var(--tt-muted); font-size: 15px; line-height: 1.65; }

.apply-steps {
  display: grid;
  gap: 10px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.apply-steps li {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: start;
  gap: 13px;
}

.apply-steps li:not(:last-child)::after {
  position: absolute;
  z-index: -1;
  top: 39px;
  left: 19px;
  width: 1px;
  height: calc(100% + 13px);
  content: '';
  background: linear-gradient(to bottom, rgba(37, 244, 238, 0.36), rgba(254, 44, 85, 0.18));
}

.step-marker {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: #b8bbc5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--tux-v2-radius-content-large);
  background: rgba(12, 13, 18, 0.72);
}

.apply-steps li:first-child .step-marker {
  color: #071315;
  border-color: rgba(37, 244, 238, 0.56);
  background: rgba(37, 244, 238, 0.9);
  box-shadow: 3px -3px 0 rgba(254, 44, 85, 0.48);
}

.step-content {
  min-width: 0;
  padding: 14px 16px 15px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--tux-v2-radius-container-level0-large);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025));
}

.apply-steps li:first-child .step-content {
  border-color: rgba(37, 244, 238, 0.2);
  background: linear-gradient(135deg, rgba(37, 244, 238, 0.075), rgba(255, 255, 255, 0.025) 64%, rgba(254, 44, 85, 0.04));
}

.apply-steps li:first-child .step-meta {
  color: rgba(37, 244, 238, 0.78);
}

.step-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.step-heading h3 {
  margin: 0;
  color: #f5f6f8;
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.step-content p {
  margin: 7px 0 0;
  color: #a9acb7;
  font-size: 12px;
  line-height: 1.55;
}

.step-meta {
  display: block;
  margin-top: 10px;
  color: #7f828e;
  font-size: 9px;
  font-weight: 760;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.secret-note {
  margin: 20px 0 0 !important;
  padding: 13px 15px;
  color: #898c97 !important;
  font-size: 10px !important;
  line-height: 1.55 !important;
  border-left: 2px solid var(--tt-pink);
  background: rgba(254, 44, 85, 0.035);
}

.secret-note strong {
  display: block;
  margin-bottom: 4px;
  color: #d7d9e0;
  font-size: 9px;
  letter-spacing: 0.13em;
}

.apply-shell {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: var(--apply-radius-card);
  background: linear-gradient(145deg, rgba(31, 32, 42, 0.97), rgba(18, 19, 26, 0.98));
  box-shadow: var(--apply-shadow-panel), 8px 8px 0 rgba(254, 44, 85, 0.1);
}

.apply-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 30px 24px;
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

.tally-frame { min-height: 620px; padding: 18px 22px 0; }
.tally-frame iframe { display: block; color-scheme: dark; }

.submission-success {
  position: relative;
  display: flex;
  min-height: 620px;
  padding: 72px clamp(28px, 7vw, 92px);
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background:
    radial-gradient(circle at 28% 28%, rgba(37, 244, 238, 0.09), transparent 34%),
    radial-gradient(circle at 76% 68%, rgba(254, 44, 85, 0.09), transparent 36%);
  animation: success-enter 350ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.submission-success::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, var(--tt-cyan), rgba(255, 255, 255, 0.7), var(--tt-pink));
}

.submission-success:focus-visible {
  outline: 2px solid var(--tt-cyan);
  outline-offset: -6px;
}

.submission-success__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #dffffd;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.submission-success__eyebrow i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--tt-cyan);
  box-shadow: 0 0 12px rgba(37, 244, 238, 0.72);
}

.submission-success h3 {
  max-width: 560px;
  margin: 20px 0 0;
  color: #fff;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.04;
  letter-spacing: -0.045em;
}

.submission-success > p {
  max-width: 620px;
  margin: 20px 0 0;
  color: #b7bac5;
  font-size: 15px;
  line-height: 1.7;
}

.review-window {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 32px;
  padding: 14px 20px;
  color: #f6f7f9;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--tux-v2-radius-container-level0-large);
  background: rgba(255, 255, 255, 0.055);
  box-shadow: -4px 4px 0 rgba(37, 244, 238, 0.62), 4px -4px 0 rgba(254, 44, 85, 0.56);
}

.review-window strong {
  color: #fff;
  font-size: 44px;
  line-height: 1;
  letter-spacing: -0.05em;
}

.review-window span {
  color: #d9dbe2;
  font-size: 13px;
  font-weight: 700;
}

.submission-success small {
  margin-top: 24px;
  color: #7f828d;
  font-size: 11px;
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
  padding: 18px 30px 22px;
  color: #777a84;
  font-size: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.apply-shell__footer span::before { margin-right: 7px; color: var(--tt-cyan); content: '•'; }

@keyframes live-pulse {
  0%, 100% { opacity: 0.5; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1.18); }
}

@keyframes success-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes grid-drift { to { background-position: 56px 28px, 56px 28px; } }

@keyframes headline-short-circuit {
  0%, 1.1% { opacity: 0; filter: brightness(2.2) blur(1px); transform: translate3d(-24px, 0, 0) scaleX(1.12); }
  1.8% { opacity: 0.36; filter: brightness(2); transform: translate3d(12px, 0, 0) skewX(2deg); }
  2.8% { opacity: 1; filter: brightness(1.7); transform: translate3d(-7px, 0, 0) skewX(-1deg); }
  4% { filter: brightness(1.25); transform: translate3d(3px, 0, 0); }
  5.5%, 100% { opacity: 1; filter: brightness(1); transform: translate3d(0, 0, 0); }
}

@keyframes headline-glitch-cyan {
  0%, 1.1%, 5.7%, 100% { opacity: 0; clip-path: inset(0 0 100% 0); transform: translate3d(0, 0, 0); }
  1.3% { opacity: 0.95; clip-path: inset(5% 0 69% 0); transform: translate3d(-42px, 0, 0) scaleX(1.18); }
  2.2% { opacity: 0.86; clip-path: inset(34% 0 40% 0); transform: translate3d(-18px, 0, 0) scaleX(1.08); }
  3.1% { opacity: 0.76; clip-path: inset(63% 0 10% 0); transform: translate3d(13px, 0, 0); }
  4.2% { opacity: 0.55; clip-path: inset(19% 0 57% 0); transform: translate3d(-8px, 0, 0); }
  5.3% { opacity: 0.22; clip-path: inset(76% 0 4% 0); transform: translate3d(-3px, 0, 0); }
}

@keyframes headline-glitch-pink {
  0%, 1.1%, 5.7%, 100% { opacity: 0; clip-path: inset(100% 0 0 0); transform: translate3d(0, 0, 0); }
  1.3% { opacity: 0.9; clip-path: inset(68% 0 6% 0); transform: translate3d(40px, 0, 0) scaleX(1.18); }
  2.2% { opacity: 0.82; clip-path: inset(12% 0 62% 0); transform: translate3d(17px, 0, 0) scaleX(1.08); }
  3.1% { opacity: 0.72; clip-path: inset(42% 0 31% 0); transform: translate3d(-12px, 0, 0); }
  4.2% { opacity: 0.5; clip-path: inset(72% 0 7% 0); transform: translate3d(8px, 0, 0); }
  5.3% { opacity: 0.2; clip-path: inset(27% 0 55% 0); transform: translate3d(3px, 0, 0); }
}

@keyframes headline-electric-line {
  0% { opacity: 0; transform: translate3d(-24%, 0, 0) scaleX(0.08); }
  0.7% { opacity: 0.42; transform: translate3d(-18%, 0, 0) scaleX(0.28); }
  1.3% { opacity: 1; transform: translate3d(-4%, 0, 0) scaleX(0.82); }
  2% { opacity: 0.94; transform: translate3d(0, 0, 0) scaleX(1); }
  2.9% { opacity: 0.56; transform: translate3d(8%, 0, 0) scaleX(0.72); }
  4%, 100% { opacity: 0; transform: translate3d(28%, 0, 0) scaleX(0.12); }
}

@keyframes headline-tiktok-smear-cyan {
  0%, 46%, 72%, 100% { opacity: 0.42; filter: blur(2px); transform: translate3d(-3px, 0, 0) scaleX(1); }
  58% { opacity: 0.96; filter: blur(7px); transform: translate3d(-20px, 0, 0) scaleX(1.08); }
}

@keyframes headline-tiktok-smear-pink {
  0%, 46%, 72%, 100% { opacity: 0.38; filter: blur(2px); transform: translate3d(3px, 0, 0) scaleX(1); }
  58% { opacity: 0.92; filter: blur(7px); transform: translate3d(20px, 0, 0) scaleX(1.08); }
}

@keyframes orbit-float {
  from { transform: translate3d(-20px, -12px, 0) scale(0.9); }
  to { transform: translate3d(38px, 28px, 0) scale(1.12); }
}

@keyframes radial-column-breathe {
  0%, 100% { opacity: var(--ray-opacity-low); transform: rotate(var(--ray-angle)) scaleX(0.9); }
  50% { opacity: var(--ray-opacity-high); transform: rotate(var(--ray-angle)) scaleX(1.04); }
}

@keyframes ribbon-sweep {
  from { opacity: 0.08; transform: translate3d(-12vw, -3vh, 0) rotate(-18deg) scale(0.92); }
  to { opacity: 0.2; transform: translate3d(28vw, 10vh, 0) rotate(-12deg) scale(1.18); }
}

@keyframes event-drift {
  from { opacity: 0.25; transform: translate3d(0, -10px, 0); }
  to { opacity: 0.7; transform: translate3d(18px, 16px, 0); }
}

@keyframes demo-enter {
  from { opacity: 0; transform: translate3d(40px, 18px, 0) rotate(1.4deg) scale(0.97); }
  to { opacity: 1; transform: translate3d(0, 0, 0) rotate(0) scale(1); }
}

@keyframes media-scan {
  0%, 18% { left: -32%; opacity: 0; }
  32% { opacity: 0.16; }
  58%, 100% { left: 118%; opacity: 0; }
}

@media (max-width: 1180px) {
  .apply-page { width: min(860px, calc(100% - 40px)); padding-top: 48px; }
  .apply-masthead,
  .application-section { grid-template-columns: 1fr; }
  .apply-masthead { min-height: auto; }
  .apply-copy { width: min(100%, 680px); padding-bottom: 22px; }
  .demo-card { justify-self: stretch; width: 100%; }
  .application-section { gap: 34px; margin-top: 108px; padding-top: 58px; }
  .application-intro { position: static; max-width: 860px; padding-top: 0; }
  .apply-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .apply-steps li:not(:last-child)::after { display: none; }
  .ambient-events { display: none; }
}

@media (max-width: 620px) {
  .apply-page { width: min(100% - 22px, 760px); padding: 34px 0 64px; }
  .radial-light-columns { width: 100vw; height: 52vh; opacity: 0.72; }
  .apply-headline { font-size: 43px; }
  .apply-page--zh .apply-headline { font-size: clamp(34px, 10.6vw, 42px); letter-spacing: -0.06em; }
  .apply-lede { font-size: 15px; }
  .apply-actions { display: grid; }
  .apply-button { width: 100%; }
  .demo-card { border-radius: 11px; box-shadow: -5px 5px 0 rgba(37, 244, 238, 0.66), 5px -5px 0 rgba(254, 44, 85, 0.58), 0 24px 60px rgba(0, 0, 0, 0.4); }
  .demo-story { right: 16px; bottom: 16px; }
  .demo-story p { display: none; }
  .application-section { margin-top: 82px; padding-top: 44px; }
  .apply-steps { grid-template-columns: 1fr; gap: 10px; }
  .apply-steps li { gap: 11px; }
  .step-content { padding: 12px 13px 13px; }
  .apply-shell { border-radius: 11px; }
  .apply-shell__header { display: block; padding: 22px 20px; }
  .open-status { margin-top: 15px; }
  .tally-frame { padding-inline: 6px; }
  .submission-success { min-height: 520px; padding: 56px 24px; }
  .apply-shell__footer { display: grid; padding: 16px 20px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .apply-page::after,
  .apply-orbit,
  .radial-light-columns span,
  .apply-ribbons span,
  .ambient-events span,
  .demo-card,
  .demo-media::after,
  .apply-headline em,
  .apply-headline em::before,
  .apply-headline em::after,
  .headline-tiktok-echo::before,
  .headline-tiktok-echo::after,
  .headline-short-circuit,
  .apply-badge span,
  .open-status i,
  .submission-success { animation: none; }

  .apply-button,
  .demo-card { transition: none; }

  .demo-card:hover { transform: none; }
}
</style>
