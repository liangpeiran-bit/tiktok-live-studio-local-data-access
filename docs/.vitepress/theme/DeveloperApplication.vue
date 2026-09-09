<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  formId: string
  locale?: 'en' | 'zh'
}>()

const demoVideo = ref<HTMLVideoElement | null>(null)
const tallyFrame = ref<HTMLIFrameElement | null>(null)
const applicationStage = ref(0)

const isZh = computed(() => props.locale === 'zh')
const copy = computed(() =>
  isZh.value
    ? {
        badge: '开发者抢先体验',
        kicker: '直播互动，实时成为玩法',
        headlineLead: '为直播互动而生',
        headlineAccent: '让弹幕改变游戏。',
        lede: '使用本机实时的点赞、礼物和评论事件，在 H5、Unity、Unreal 或任意技术栈中构建互动游戏。',
        applyAction: '申请抢先体验',
        quickStartAction: '阅读快速开始',
        quickStartHref: '/zh/guide/quick-start',
        availableEvents: '当前开放的直播事件',
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
        filling: '填写中',
        submitted: '已提交',
        reviewing: '审核中',
        submissionReceived: '申请已提交，接下来由 LIVE Studio 官方审核。',
        secretNote: '请勿将 Secret Key 提交到公开仓库或分享给无关人员。',
        program: '开发者计划',
        requestAccess: '申请抢先体验',
        applicationsOpen: '申请开放中',
        iframeTitle: 'LIVE Studio 开发者接入申请表',
        openForm: '打开申请表',
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
        availableEvents: 'Available live events',
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
        filling: 'In progress',
        submitted: 'Submitted',
        reviewing: 'In review',
        submissionReceived: 'Application received. The LIVE Studio team will review it next.',
        secretNote: 'Never commit your Secret Key to a public repository or share it outside your team.',
        program: 'DEVELOPER PROGRAM',
        requestAccess: 'Request early access',
        applicationsOpen: 'Applications open',
        iframeTitle: 'LIVE Studio developer access application',
        openForm: 'Open the application form',
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

const getStepState = (index: number) => {
  if (index < applicationStage.value) return 'complete'
  if (index === applicationStage.value) return 'active'
  return 'upcoming'
}

const getStepTag = (index: number) => {
  if (index < applicationStage.value) return copy.value.submitted
  if (index !== applicationStage.value) return ''
  return index === 0 ? copy.value.filling : copy.value.reviewing
}

const handleTallyMessage = (event: MessageEvent) => {
  if (
    event.origin !== 'https://tally.so' ||
    event.source !== tallyFrame.value?.contentWindow ||
    typeof event.data !== 'string' ||
    !event.data.includes('Tally.FormSubmitted')
  ) {
    return
  }

  applicationStage.value = 1
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
  <main class="apply-page" :lang="isZh ? 'zh-CN' : 'en'">
    <div class="apply-noise" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--cyan" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--pink" aria-hidden="true"></div>
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
        <h1>{{ copy.headlineLead }}<br /><em :data-text="copy.headlineAccent">{{ copy.headlineAccent }}</em></h1>
        <p class="apply-lede">{{ copy.lede }}</p>

        <div class="apply-actions">
          <a class="apply-button apply-button--primary" href="#application">{{ copy.applyAction }}</a>
          <a class="apply-button apply-button--secondary" :href="copy.quickStartHref">{{ copy.quickStartAction }}</a>
        </div>

        <div class="event-stream" :aria-label="copy.availableEvents">
          <span><i class="pulse pulse--cyan"></i> live.like</span>
          <span><i class="pulse pulse--pink"></i> live.gift</span>
          <span><i class="pulse pulse--white"></i> live.chat</span>
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

        <p v-if="applicationStage === 1" class="submission-received" role="status">
          <i aria-hidden="true"></i>{{ copy.submissionReceived }}
        </p>

        <ol class="apply-steps" :aria-label="copy.stepsAria">
          <li
            v-for="(step, index) in copy.steps"
            :key="step.title"
            :class="`is-${getStepState(index)}`"
            :aria-current="index === applicationStage ? 'step' : undefined"
          >
            <div class="step-marker" aria-hidden="true"><span>0{{ index + 1 }}</span></div>
            <div class="step-content">
              <div class="step-heading">
                <h3>{{ step.title }}</h3>
                <span v-if="getStepTag(index)" class="step-tag">{{ getStepTag(index) }}</span>
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

        <div v-if="isConfigured" class="tally-frame">
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
  position: relative;
  isolation: isolate;
  width: min(1540px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(56px, 7vw, 96px) 0 104px;
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
  opacity: 0.2;
  pointer-events: none;
  animation: orbit-float 8s ease-in-out infinite alternate;
}

.apply-orbit--cyan { top: 6%; left: -12%; background: var(--tt-cyan); }
.apply-orbit--pink { top: 28%; right: -10%; background: var(--tt-pink); animation-delay: -4s; }

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
  opacity: 0.14;
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
  grid-template-columns: minmax(360px, 420px) minmax(620px, 1fr);
  align-items: center;
  gap: clamp(42px, 5vw, 76px);
  min-height: min(780px, calc(100vh - 90px));
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
  position: relative;
  isolation: isolate;
  color: #fff;
  font-style: normal;
  text-shadow:
    -3px 0 rgba(37, 244, 238, 0.82),
    3px 0 rgba(254, 44, 85, 0.78),
    0 0 18px rgba(255, 255, 255, 0.16);
  will-change: filter, transform;
  animation: headline-impact 4.8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

.apply-copy h1 em::before,
.apply-copy h1 em::after {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: attr(data-text);
  color: transparent;
  pointer-events: none;
  mix-blend-mode: screen;
  will-change: filter, opacity, transform;
}

.apply-copy h1 em::before {
  opacity: 0.52;
  text-shadow:
    -12px 0 8px rgba(37, 244, 238, 0.92),
    -30px 0 22px rgba(37, 244, 238, 0.46),
    -52px 0 38px rgba(37, 244, 238, 0.2);
  filter: blur(2px);
  transform: translate3d(-3px, 0, 0);
  animation: headline-smear-cyan 4.8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

.apply-copy h1 em::after {
  opacity: 0.48;
  text-shadow:
    12px 0 8px rgba(254, 44, 85, 0.92),
    30px 0 22px rgba(254, 44, 85, 0.46),
    52px 0 38px rgba(254, 44, 85, 0.2);
  filter: blur(2px);
  transform: translate3d(3px, 0, 0);
  animation: headline-smear-pink 4.8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
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
  align-self: center;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(12, 13, 17, 0.92);
  box-shadow:
    -12px 12px 0 rgba(37, 244, 238, 0.72),
    12px -12px 0 rgba(254, 44, 85, 0.66),
    0 44px 120px rgba(0, 0, 0, 0.48);
  transform: none;
  transform-origin: left center;
  transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 350ms ease;
  animation: demo-enter 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.demo-card:hover {
  box-shadow:
    -15px 15px 0 rgba(37, 244, 238, 0.78),
    15px -15px 0 rgba(254, 44, 85, 0.72),
    0 54px 140px rgba(0, 0, 0, 0.54);
  transform: translateY(-6px);
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
  left: clamp(18px, 4vw, 34px);
  right: 34px;
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

.application-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.42fr) minmax(560px, 1fr);
  align-items: start;
  gap: clamp(32px, 6vw, 80px);
  margin-top: clamp(92px, 12vw, 150px);
  scroll-margin-top: 92px;
}

.application-intro { position: sticky; top: 92px; padding-top: 18px; }
.section-index { color: var(--tt-pink); }

.application-intro h2 {
  margin: 18px 0 16px;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.02;
  letter-spacing: -0.045em;
}

.application-intro > p { margin: 0; color: var(--tt-muted); font-size: 15px; line-height: 1.65; }

.submission-received {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 24px !important;
  padding: 12px 14px;
  color: #dffffd !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
  border: 1px solid rgba(37, 244, 238, 0.24);
  border-radius: var(--tux-v2-radius-content-large);
  background: rgba(37, 244, 238, 0.07);
  animation: submission-enter 350ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.submission-received i {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--tt-cyan);
  box-shadow: 0 0 10px rgba(37, 244, 238, 0.72);
}

.apply-steps {
  display: grid;
  gap: 12px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}

.apply-steps li {
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: start;
  gap: 13px;
}

.apply-steps li:not(:last-child)::after {
  position: absolute;
  z-index: -1;
  top: 41px;
  left: 20px;
  width: 1px;
  height: calc(100% + 13px);
  content: '';
  background: linear-gradient(to bottom, rgba(37, 244, 238, 0.36), rgba(254, 44, 85, 0.18));
}

.step-marker {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  color: #8f929e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--tux-v2-radius-content-large);
  background: rgba(18, 19, 26, 0.94);
  transition: color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
}

.step-content {
  min-width: 0;
  padding: 13px 14px 14px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--tux-v2-radius-container-level0-large);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025));
  transition: transform 200ms ease, border-color 200ms ease, background 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
}

.apply-steps li:hover .step-content { transform: translateX(3px); }

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

.step-tag {
  flex: 0 0 auto;
  padding: 4px 7px;
  color: #071315;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  border-radius: var(--tux-v2-radius-content-capsule);
  background: var(--tt-cyan);
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

.apply-steps li.is-active .step-marker {
  color: #071315;
  border-color: var(--tt-cyan);
  background: var(--tt-cyan);
  box-shadow: 4px -4px 0 rgba(254, 44, 85, 0.78), 0 0 22px rgba(37, 244, 238, 0.18);
}

.apply-steps li.is-active .step-content {
  border-color: rgba(37, 244, 238, 0.3);
  background: linear-gradient(135deg, rgba(37, 244, 238, 0.1), rgba(254, 44, 85, 0.045));
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.16);
}

.apply-steps li.is-complete .step-marker {
  color: #dffffd;
  border-color: rgba(37, 244, 238, 0.42);
  background: rgba(37, 244, 238, 0.1);
}

.apply-steps li.is-complete .step-content { border-color: rgba(37, 244, 238, 0.16); }
.apply-steps li.is-complete .step-tag { color: #dffffd; background: rgba(37, 244, 238, 0.12); }
.apply-steps li.is-upcoming .step-content { opacity: 0.78; }

.secret-note {
  margin: 18px 0 0 !important;
  padding: 12px 14px;
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

@keyframes submission-enter {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes grid-drift { to { background-position: 56px 28px, 56px 28px; } }

@keyframes headline-impact {
  0%, 57%, 73%, 100% { filter: blur(0); transform: translate3d(0, 0, 0) skewX(0deg); }
  64% { filter: blur(1.8px); transform: translate3d(-5px, 0, 0) skewX(-1.6deg); }
}

@keyframes headline-smear-cyan {
  0%, 57%, 73%, 100% { opacity: 0.42; filter: blur(2px); transform: translate3d(-3px, 0, 0) scaleX(1); }
  64% { opacity: 0.96; filter: blur(7px); transform: translate3d(-20px, 0, 0) scaleX(1.08); }
}

@keyframes headline-smear-pink {
  0%, 57%, 73%, 100% { opacity: 0.38; filter: blur(2px); transform: translate3d(3px, 0, 0) scaleX(1); }
  64% { opacity: 0.92; filter: blur(7px); transform: translate3d(20px, 0, 0) scaleX(1.08); }
}

@keyframes orbit-float {
  from { transform: translate3d(-20px, -12px, 0) scale(0.9); }
  to { transform: translate3d(38px, 28px, 0) scale(1.12); }
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

@media (max-width: 1120px) {
  .apply-page { width: min(760px, calc(100% - 32px)); padding-top: 44px; }
  .apply-masthead,
  .application-section { grid-template-columns: 1fr; }
  .apply-masthead { min-height: auto; }
  .apply-copy { padding-bottom: 8px; }
  .application-section { gap: 28px; margin-top: 112px; }
  .application-intro { position: static; max-width: 760px; padding-top: 0; }
  .apply-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .apply-steps li:not(:last-child)::after { display: none; }
  .ambient-events { display: none; }
}

@media (max-width: 620px) {
  .apply-page { width: min(100% - 22px, 760px); padding: 34px 0 64px; }
  .apply-copy h1 { font-size: 43px; }
  .apply-lede { font-size: 15px; }
  .apply-actions { display: grid; }
  .apply-button { width: 100%; }
  .demo-card { border-radius: 11px; box-shadow: -5px 5px 0 rgba(37, 244, 238, 0.66), 5px -5px 0 rgba(254, 44, 85, 0.58), 0 24px 60px rgba(0, 0, 0, 0.4); }
  .demo-story { right: 16px; bottom: 16px; }
  .demo-story p { display: none; }
  .application-section { margin-top: 88px; }
  .apply-steps { grid-template-columns: 1fr; gap: 10px; }
  .apply-steps li { gap: 11px; }
  .step-content { padding: 12px 13px 13px; }
  .apply-shell { border-radius: 11px; }
  .apply-shell__header { display: block; padding: 22px 20px; }
  .open-status { margin-top: 15px; }
  .tally-frame { padding-inline: 6px; }
  .apply-shell__footer { display: grid; padding: 16px 20px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .apply-page::after,
  .apply-orbit,
  .apply-ribbons span,
  .ambient-events span,
  .demo-card,
  .demo-media::after,
  .apply-copy h1 em,
  .apply-copy h1 em::before,
  .apply-copy h1 em::after,
  .apply-badge span,
  .open-status i,
  .submission-received { animation: none; }

  .apply-button,
  .demo-card,
  .step-marker,
  .step-content { transition: none; }

  .demo-card:hover,
  .apply-steps li:hover .step-content { transform: none; }
}
</style>
