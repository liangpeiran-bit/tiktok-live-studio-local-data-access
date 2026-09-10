<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  formId: string
  locale?: 'en' | 'zh'
}>()

const demoVideo = ref<HTMLVideoElement | null>(null)
const fullDemoVideo = ref<HTMLVideoElement | null>(null)
const demoDialog = ref<HTMLDialogElement | null>(null)
const previewPlaying = ref(false)
const journeyOpen = ref(false)
let resumePreview = false
let cleanUpMediaQueries: (() => void) | undefined
const applicationForm = ref<HTMLFormElement | null>(null)
const successPanel = ref<HTMLElement | null>(null)
const currentStep = ref(0)
const selectedEvents = ref<string[]>([])
const isSubmitting = ref(false)
const submitError = ref('')
const eventsError = ref('')
const submitted = ref(false)

const isZh = computed(() => props.locale === 'zh')
const copy = computed(() =>
  isZh.value
    ? {
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
        watchDemo: '观看完整演示',
        pausePreview: '暂停预览',
        playPreview: '播放预览',
        closeDemo: '关闭演示',
        journeySummary: '申请后会发生什么？',
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
            title: '邮件获取开发凭证',
            description: '审核通过后，凭据和接入说明会发送到申请邮箱。',
            meta: '仅发送至申请邮箱',
          },
          {
            title: '连接本地 LIVE Studio',
            description: '使用 app_id、key_id 和 secret 完成 WebSocket 鉴权，开始接收直播事件。',
            meta: '本地 WebSocket',
          },
        ],
        secretNote: '请勿将 Secret Key 提交到公开仓库或分享给无关人员。',
        program: '开发者计划',
        requestAccess: '申请抢先体验',
        formIntro: '填写申请大约需要 3 分钟。带 * 的项目为必填项。',
        formStepLabel: '申请表进度',
        formSteps: ['关于你', '你的游戏', '数据需求'],
        fields: {
          fullName: '姓名',
          fullNamePlaceholder: '如何称呼你',
          workEmail: '工作邮箱',
          workEmailPlaceholder: 'name@company.com',
          country: '国家或地区',
          countryPlaceholder: '例如：Singapore',
          company: '团队或公司',
          companyPlaceholder: '选填',
          role: '你的角色',
          rolePlaceholder: '例如：游戏开发者',
          tiktokUsername: '用于测试的 TikTok 用户名',
          tiktokUsernamePlaceholder: '选填',
          gameName: '游戏或项目名称',
          gameNamePlaceholder: '你的项目叫什么？',
          gameDescription: '你想构建什么？',
          gameDescriptionPlaceholder: '简单介绍玩法、直播互动方式和目标用户。',
          technology: '技术栈',
          technologyPlaceholder: '请选择',
          technologyOptions: ['H5 / Web', 'Unity', 'Unreal Engine', '其他'],
          demoUrl: '演示或项目链接',
          demoUrlPlaceholder: '选填，Figma、视频、GitHub 或已上线地址',
          timeline: '预计何时可以开始测试？',
          timelinePlaceholder: '请选择',
          timelineOptions: ['已可以测试', '1 个月内', '1–3 个月', '仍在规划'],
          events: '需要哪些直播事件？',
          eventHint: '可多选，后续仍可调整。',
          eventOptions: [
            { value: 'GiftMessage', title: '礼物', description: '礼物 ID、数量与连击等事件' },
            { value: 'LikeMessage', title: '点赞', description: '实时点赞事件与累计变化' },
            { value: 'ChatMessage', title: '评论', description: '直播间公开评论消息' },
          ],
          interaction: '事件将如何改变游戏？',
          interactionPlaceholder: '例如：指定礼物生成防御塔，点赞累积为全局能量。',
          notes: '还有什么需要告诉我们？',
          notesPlaceholder: '选填，例如测试计划、技术问题或其他事件需求。',
          consent: '我确认以上信息准确，并同意 LIVE Studio 团队通过工作邮箱联系我处理本次申请。',
        },
        previous: '上一步',
        next: '下一步',
        submit: '提交申请',
        submitting: '正在提交…',
        required: '必填',
        eventRequired: '请至少选择一种直播事件。',
        submitFailed: '暂时无法提交，请稍后重试；你的填写内容仍保留在页面中。',
        successEyebrow: '申请已提交',
        successTitle: '感谢你的申请',
        successDescription: '审核结果将发送到你填写的工作邮箱。审核时间因申请情况而异。',
        successNote: '请留意收件箱和垃圾邮件。',
        configuringTitle: '申请表正在配置中',
        configuringDescription: '公开表单发布后会显示在这里。',
        informationUse: '申请信息通过 Formspree 提交，供 LIVE Studio 团队评估接入需求并通过邮箱联系你。请勿填写密钥或直播间原始数据。',
        support: '申请或接入遇到问题？',
        footer: ['由 LIVE Studio 团队审核', '提交申请不会自动获得生产环境权限'],
      }
    : {
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
        watchDemo: 'Watch the full demo',
        pausePreview: 'Pause preview',
        playPreview: 'Play preview',
        closeDemo: 'Close demo',
        journeySummary: 'What happens after applying?',
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
            title: 'Receive developer credentials',
            description: 'Approved developers receive credentials and connection guidance by email.',
            meta: 'Sent to your work email',
          },
          {
            title: 'Connect to LIVE Studio',
            description: 'Authenticate with your app_id, key_id, and secret to start receiving local events.',
            meta: 'Local WebSocket',
          },
        ],
        secretNote: 'Never commit your Secret Key to a public repository or share it outside your team.',
        program: 'DEVELOPER PROGRAM',
        requestAccess: 'Request early access',
        formIntro: 'This application takes about 3 minutes. Fields marked * are required.',
        formStepLabel: 'Application progress',
        formSteps: ['About you', 'Your game', 'Data needs'],
        fields: {
          fullName: 'Full name',
          fullNamePlaceholder: 'How should we address you?',
          workEmail: 'Work email',
          workEmailPlaceholder: 'name@company.com',
          country: 'Country or region',
          countryPlaceholder: 'e.g. United States',
          company: 'Team or company',
          companyPlaceholder: 'Optional',
          role: 'Your role',
          rolePlaceholder: 'e.g. Game developer',
          tiktokUsername: 'TikTok username used for testing',
          tiktokUsernamePlaceholder: 'Optional',
          gameName: 'Game or project name',
          gameNamePlaceholder: 'What is your project called?',
          gameDescription: 'What are you building?',
          gameDescriptionPlaceholder: 'Briefly describe the gameplay, live interaction, and target audience.',
          technology: 'Technology stack',
          technologyPlaceholder: 'Select one',
          technologyOptions: ['H5 / Web', 'Unity', 'Unreal Engine', 'Other'],
          demoUrl: 'Demo or project link',
          demoUrlPlaceholder: 'Optional — Figma, video, GitHub, or live build',
          timeline: 'When could you begin testing?',
          timelinePlaceholder: 'Select one',
          timelineOptions: ['Ready now', 'Within 1 month', 'In 1–3 months', 'Still planning'],
          events: 'Which LIVE events do you need?',
          eventHint: 'Select all that apply. You can adjust this later.',
          eventOptions: [
            { value: 'GiftMessage', title: 'Gifts', description: 'Gift IDs, quantity, and streak events' },
            { value: 'LikeMessage', title: 'Likes', description: 'Real-time likes and aggregate changes' },
            { value: 'ChatMessage', title: 'Chat', description: 'Public LIVE room comments' },
          ],
          interaction: 'How will events change the game?',
          interactionPlaceholder: 'For example: a selected gift spawns a tower; likes charge team energy.',
          notes: 'Anything else we should know?',
          notesPlaceholder: 'Optional — testing plans, technical questions, or other event needs.',
          consent: 'I confirm the information above is accurate and agree that the LIVE Studio team may contact me at my work email about this application.',
        },
        previous: 'Back',
        next: 'Next',
        submit: 'Submit application',
        submitting: 'Submitting…',
        required: 'Required',
        eventRequired: 'Choose at least one LIVE event.',
        submitFailed: 'We could not submit the form. Please try again; your answers are still here.',
        successEyebrow: 'APPLICATION RECEIVED',
        successTitle: 'Thanks for applying.',
        successDescription: 'We will email the review result to your work address. Review times vary by application.',
        successNote: 'Please check your inbox and spam folder.',
        configuringTitle: 'Application form is being configured',
        configuringDescription: 'The public form will appear here after it is published.',
        informationUse: 'Application details are submitted through Formspree for the LIVE Studio team to evaluate access needs and contact you by email. Do not include credentials or raw live-room data.',
        support: 'Need help with your application or integration?',
        footer: ['Reviewed by the LIVE Studio team', 'No production access is granted automatically'],
      },
)

const isConfigured = computed(() => props.formId && props.formId !== 'FORM_ID')
const formAction = computed(() => `https://formspree.io/f/${props.formId}`)

const validateCurrentStep = () => {
  submitError.value = ''
  eventsError.value = ''

  if (currentStep.value === 2 && selectedEvents.value.length === 0) {
    eventsError.value = copy.value.eventRequired
    return false
  }

  const panel = applicationForm.value?.querySelector<HTMLElement>(`[data-form-step="${currentStep.value}"]`)
  const fields = panel?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  )

  for (const field of fields ?? []) {
    if (!field.checkValidity()) {
      field.reportValidity()
      return false
    }
  }

  return true
}

const focusCurrentStep = () => {
  void nextTick(() => {
    const panel = applicationForm.value?.querySelector<HTMLElement>(`[data-form-step="${currentStep.value}"]`)
    panel?.querySelector<HTMLElement>('legend')?.focus({ preventScroll: true })
    applicationForm.value?.previousElementSibling?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  })
}

const goNext = () => {
  if (!validateCurrentStep()) return
  currentStep.value = Math.min(currentStep.value + 1, copy.value.formSteps.length - 1)
  focusCurrentStep()
}

const goBack = () => {
  submitError.value = ''
  eventsError.value = ''
  currentStep.value = Math.max(currentStep.value - 1, 0)
  focusCurrentStep()
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (currentStep.value < copy.value.formSteps.length - 1) {
    goNext()
    return
  }
  if (!validateCurrentStep() || !applicationForm.value || !isConfigured.value) return

  isSubmitting.value = true
  submitError.value = ''

  const payload = new FormData(applicationForm.value)
  payload.set('event_types', selectedEvents.value.join(', '))
  payload.set('locale', isZh.value ? 'zh-CN' : 'en')
  payload.set('source', 'LIVE Studio developer application')
  payload.set('page_url', window.location.href)

  try {
    const response = await fetch(formAction.value, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) throw new Error(`Form submission failed: ${response.status}`)

    submitted.value = true
    applicationForm.value.reset()
    selectedEvents.value = []
    void nextTick(() => successPanel.value?.focus())
  } catch {
    submitError.value = copy.value.submitFailed
  } finally {
    isSubmitting.value = false
  }
}

const togglePreview = () => {
  if (demoVideo.value?.paused) void demoVideo.value.play().catch(() => {})
  else demoVideo.value?.pause()
}

const openDemo = () => {
  if (!demoDialog.value) return
  resumePreview = !demoVideo.value?.paused
  demoVideo.value?.pause()
  demoDialog.value.showModal()
  // Load the full recording on demand; native controls include fullscreen.
  if (fullDemoVideo.value && !fullDemoVideo.value.getAttribute('src')) {
    fullDemoVideo.value.src = '/media/interactive-tower-defense-demo.mp4'
  }
  void fullDemoVideo.value?.play().catch(() => {})
}

const onDemoClosed = () => {
  fullDemoVideo.value?.pause()
  if (resumePreview && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    void demoVideo.value?.play().catch(() => {})
  }
}

onMounted(() => {
  const compactLayout = window.matchMedia('(max-width: 1180px)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updateLayout = () => { journeyOpen.value = !compactLayout.matches }
  const updateMotion = () => {
    if (reducedMotion.matches) demoVideo.value?.pause()
    else void demoVideo.value?.play().catch(() => {})
  }
  updateLayout()
  updateMotion()
  compactLayout.addEventListener('change', updateLayout)
  reducedMotion.addEventListener('change', updateMotion)
  cleanUpMediaQueries = () => {
    compactLayout.removeEventListener('change', updateLayout)
    reducedMotion.removeEventListener('change', updateMotion)
  }
})

onUnmounted(() => cleanUpMediaQueries?.())
</script>

<template>
  <main class="apply-page" :class="{ 'apply-page--zh': isZh }" :lang="isZh ? 'zh-CN' : 'en'">
    <div class="apply-noise" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--cyan" aria-hidden="true"></div>
    <div class="apply-orbit apply-orbit--pink" aria-hidden="true"></div>
    <img
      class="radial-light-columns"
      src="/media/application/radial-light-columns-v1.png"
      alt=""
      aria-hidden="true"
    />
    <div class="apply-ribbons" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <section class="apply-masthead">
      <div class="apply-copy">
        <p class="apply-kicker">{{ copy.kicker }}</p>
        <h1 class="apply-headline">
          <span class="apply-headline__lead">{{ copy.headlineLead }}</span>
          <span class="visually-hidden">{{ copy.headlineAccent }}</span>
          <em :data-text="copy.headlineAccent" aria-hidden="true">
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
          <div class="demo-gameplay">
          <video
            ref="demoVideo"
            muted
            loop
            playsinline
            preload="metadata"
            poster="/media/interactive-tower-defense-demo.webp"
            :aria-label="copy.demoAria"
            @play="previewPlaying = true"
            @pause="previewPlaying = false"
          >
            <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
          </video>
          </div>
          <button class="demo-control demo-preview-toggle" type="button" @click="togglePreview">
            {{ previewPlaying ? copy.pausePreview : copy.playPreview }}
          </button>
        </div>
        <div class="demo-caption">
          <div class="demo-story">
            <span>{{ copy.demoEvent }}</span>
            <h2 id="demo-title">{{ copy.demoTitle }}</h2>
            <p>{{ copy.demoDescription }}</p>
          </div>
          <button class="demo-control demo-watch" type="button" @click="openDemo">
            {{ copy.watchDemo }} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </article>
    </section>

    <dialog ref="demoDialog" class="demo-dialog" aria-labelledby="full-demo-title" @close="onDemoClosed" @click="($event.target === demoDialog) && demoDialog?.close()">
      <div class="demo-dialog__header">
        <h2 id="full-demo-title">{{ copy.demoTitle }}</h2>
        <button class="demo-control" type="button" autofocus @click="demoDialog?.close()">{{ copy.closeDemo }} <span aria-hidden="true">×</span></button>
      </div>
      <video ref="fullDemoVideo" controls playsinline preload="none" :aria-label="copy.demoAria" />
    </dialog>

    <section class="application-section">
      <div class="application-intro">
        <span class="section-index">{{ copy.sectionIndex }}</span>
        <h2>{{ copy.applicationTitle }}</h2>
        <p>{{ copy.applicationDescription }}</p>

        <details class="application-journey" :open="journeyOpen">
          <summary>{{ copy.journeySummary }}</summary>
        <ol class="apply-steps" :aria-label="copy.stepsAria">
          <li v-for="step in copy.steps" :key="step.title">
            <div class="step-marker" aria-hidden="true"></div>
            <div class="step-content">
              <div class="step-heading">
                <h3>{{ step.title }}</h3>
              </div>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>

        <p class="secret-note"><strong>SECRET KEY</strong>{{ copy.secretNote }}</p>
        </details>
      </div>

      <section id="application" class="apply-shell" aria-labelledby="application-title" tabindex="-1">
        <header class="apply-shell__header">
          <div>
            <span class="eyebrow">{{ copy.program }}</span>
            <h2 id="application-title">{{ copy.requestAccess }}</h2>
          </div>
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
          <small>{{ copy.successNote }}</small>
        </div>

        <div v-else-if="isConfigured" class="native-form">
          <div class="form-overview">
            <p>{{ copy.formIntro }}</p>
            <ol class="form-progress" :aria-label="copy.formStepLabel">
              <li
                v-for="(step, index) in copy.formSteps"
                :key="step"
                :class="{ 'is-active': index === currentStep, 'is-complete': index < currentStep }"
                :aria-current="index === currentStep ? 'step' : undefined"
              >
                <span>0{{ index + 1 }}</span>
                <strong>{{ step }}</strong>
              </li>
            </ol>
          </div>

          <form ref="applicationForm" :action="formAction" method="POST" novalidate @submit.prevent="handleSubmit">
            <input class="form-honeypot" type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
            <input type="hidden" name="_subject" value="LIVE Studio developer access application" />

            <fieldset v-show="currentStep === 0" class="form-step" data-form-step="0">
              <legend tabindex="-1">{{ copy.formSteps[0] }}</legend>
              <div class="form-grid">
                <label class="form-field">
                  <span>{{ copy.fields.fullName }} <i aria-hidden="true">*</i></span>
                  <input name="full_name" type="text" autocomplete="name" required :placeholder="copy.fields.fullNamePlaceholder" />
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.workEmail }} <i aria-hidden="true">*</i></span>
                  <input name="email" type="email" autocomplete="email" required :placeholder="copy.fields.workEmailPlaceholder" />
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.country }} <i aria-hidden="true">*</i></span>
                  <input name="country_or_region" type="text" autocomplete="country-name" required :placeholder="copy.fields.countryPlaceholder" />
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.company }}</span>
                  <input name="team_or_company" type="text" autocomplete="organization" :placeholder="copy.fields.companyPlaceholder" />
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.role }} <i aria-hidden="true">*</i></span>
                  <input name="role" type="text" autocomplete="organization-title" required :placeholder="copy.fields.rolePlaceholder" />
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.tiktokUsername }}</span>
                  <input name="tiktok_username" type="text" autocomplete="off" :placeholder="copy.fields.tiktokUsernamePlaceholder" />
                </label>
              </div>
            </fieldset>

            <fieldset v-show="currentStep === 1" class="form-step" data-form-step="1">
              <legend tabindex="-1">{{ copy.formSteps[1] }}</legend>
              <div class="form-grid">
                <label class="form-field form-field--wide">
                  <span>{{ copy.fields.gameName }} <i aria-hidden="true">*</i></span>
                  <input name="game_name" type="text" required :placeholder="copy.fields.gameNamePlaceholder" />
                </label>
                <label class="form-field form-field--wide">
                  <span>{{ copy.fields.gameDescription }} <i aria-hidden="true">*</i></span>
                  <textarea name="game_description" rows="5" required :placeholder="copy.fields.gameDescriptionPlaceholder"></textarea>
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.technology }} <i aria-hidden="true">*</i></span>
                  <select name="technology_stack" required>
                    <option value="" selected disabled>{{ copy.fields.technologyPlaceholder }}</option>
                    <option v-for="option in copy.fields.technologyOptions" :key="option" :value="option">{{ option }}</option>
                  </select>
                </label>
                <label class="form-field">
                  <span>{{ copy.fields.timeline }} <i aria-hidden="true">*</i></span>
                  <select name="testing_timeline" required>
                    <option value="" selected disabled>{{ copy.fields.timelinePlaceholder }}</option>
                    <option v-for="option in copy.fields.timelineOptions" :key="option" :value="option">{{ option }}</option>
                  </select>
                </label>
                <label class="form-field form-field--wide">
                  <span>{{ copy.fields.demoUrl }}</span>
                  <input name="demo_url" type="url" inputmode="url" :placeholder="copy.fields.demoUrlPlaceholder" />
                </label>
              </div>
            </fieldset>

            <fieldset v-show="currentStep === 2" class="form-step" data-form-step="2">
              <legend tabindex="-1">{{ copy.formSteps[2] }}</legend>
              <div class="event-question">
                <div class="event-question__heading">
                  <span>{{ copy.fields.events }} <i aria-hidden="true">*</i></span>
                  <small>{{ copy.fields.eventHint }}</small>
                </div>
                <div class="event-options">
                  <label v-for="option in copy.fields.eventOptions" :key="option.value" class="event-option">
                    <input v-model="selectedEvents" type="checkbox" :value="option.value" />
                    <span class="event-option__check" aria-hidden="true"></span>
                    <span><strong>{{ option.title }}</strong><small>{{ option.description }}</small></span>
                  </label>
                </div>
                <p v-if="eventsError" class="field-error" role="alert">{{ eventsError }}</p>
              </div>

              <div class="form-grid">
                <label class="form-field form-field--wide">
                  <span>{{ copy.fields.interaction }} <i aria-hidden="true">*</i></span>
                  <textarea name="interaction_design" rows="5" required :placeholder="copy.fields.interactionPlaceholder"></textarea>
                </label>
                <label class="form-field form-field--wide">
                  <span>{{ copy.fields.notes }}</span>
                  <textarea name="additional_notes" rows="4" :placeholder="copy.fields.notesPlaceholder"></textarea>
                </label>
              </div>

              <label class="consent-field">
                <input name="contact_consent" type="checkbox" value="confirmed" required />
                <span class="consent-field__check" aria-hidden="true"></span>
                <span>{{ copy.fields.consent }}</span>
              </label>
            </fieldset>

            <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>

            <div class="form-actions">
              <button v-if="currentStep > 0" class="form-button form-button--secondary" type="button" :disabled="isSubmitting" @click="goBack">
                {{ copy.previous }}
              </button>
              <button v-if="currentStep < copy.formSteps.length - 1" class="form-button form-button--primary" type="button" @click="goNext">
                {{ copy.next }} <span aria-hidden="true">→</span>
              </button>
              <button v-else class="form-button form-button--primary" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? copy.submitting : copy.submit }} <span v-if="!isSubmitting" aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>

        <div v-else class="form-placeholder" role="status">
          <div class="form-placeholder__mark">LS</div>
          <strong>{{ copy.configuringTitle }}</strong>
          <span>{{ copy.configuringDescription }}</span>
        </div>

        <footer class="apply-shell__footer">
          <p>{{ copy.informationUse }}</p>
          <p>{{ copy.support }} <a href="mailto:liangpeiran@bytedance.com">liangpeiran@bytedance.com</a></p>
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
  --apply-layout-width: 1600px;
  --apply-copy-width: 560px;
  --apply-type-display: clamp(52px, 4.25vw, 68px);
  --apply-type-lead: clamp(28px, 2.35vw, 38px);
  --apply-type-display-zh: clamp(50px, 3.7vw, 62px);
  --apply-type-section: clamp(38px, 3.5vw, 50px);
  --apply-radius-control: var(--tux-v2-radius-content-large);
  --apply-radius-card: var(--tux-v2-radius-container-level1-large);
  --apply-shadow-media: 0 38px 96px rgba(0, 0, 0, 0.42);
  --apply-shadow-panel: 0 34px 90px rgba(0, 0, 0, 0.34);
  --apply-media-border: rgba(255, 255, 255, 0.14);
  --apply-media-glow: radial-gradient(ellipse at 24% 35%, rgba(37, 244, 238, 0.16), transparent 65%), radial-gradient(ellipse at 84% 68%, rgba(254, 44, 85, 0.14), transparent 60%);
  --apply-media-edge: -3px 3px 0 rgba(37, 244, 238, 0.64), 3px -3px 0 rgba(254, 44, 85, 0.64);
  --apply-control-height: 44px;
  --apply-type-control: 13px;
  --apply-weight-control: 700;
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
  opacity: 0.18;
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
  position: absolute;
  z-index: -1;
  top: -42px;
  left: calc((100vw - 100%) / -2);
  width: clamp(660px, 48vw, 920px);
  max-width: none;
  height: auto;
  opacity: 0.3;
  filter: blur(3px) saturate(0.6) brightness(0.8);
  mix-blend-mode: screen;
  pointer-events: none;
  user-select: none;
}

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

.eyebrow,
.section-index {
  font-size: 11px;
  font-weight: 760;
  letter-spacing: 0.16em;
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

.apply-headline__lead {
  max-width: 420px;
  color: var(--tt-muted);
  font-size: var(--apply-type-lead);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.apply-headline em {
  display: inline-block;
  position: relative;
  isolation: isolate;
  margin-top: 20px;
  color: #fff;
  font-style: normal;
  text-shadow:
    -2px 0 rgba(37, 244, 238, 0.72),
    2px 0 rgba(254, 44, 85, 0.68);
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
  min-height: var(--tt-control-height);
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
  box-shadow: var(--tt-shadow-brand);
}

.apply-button--primary:hover {
  background:
    linear-gradient(#111218, #08090d) padding-box,
    linear-gradient(110deg, var(--tt-cyan) 0 44%, var(--tt-pink) 56% 100%) border-box;
  box-shadow: var(--tt-shadow-brand-hover);
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
  box-shadow: var(--apply-media-edge), var(--apply-shadow-media);
  transform: none;
  transform-origin: left center;
  transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 350ms ease;
  animation: demo-enter 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.demo-card:hover {
  transform: translateY(-2px);
}

.demo-media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--apply-media-glow), var(--tt-ink);
}

.demo-media::before {
  position: absolute;
  inset: -24px;
  content: '';
  opacity: 0.2;
  background: url('/media/interactive-tower-defense-demo.webp') center / cover;
  filter: blur(18px);
  pointer-events: none;
}

.demo-gameplay {
  position: absolute;
  height: 92%;
  aspect-ratio: 310 / 552;
  top: 4%;
  left: 50%;
  overflow: hidden;
  transform: translateX(-50%);
  border-radius: var(--apply-radius-control);
  box-shadow: var(--apply-shadow-media);
}

.demo-gameplay video {
  /* Gameplay bounds in the 1280 × 720 recording: x=484, y=98, w=310, h=552. */
  position: absolute;
  width: 412.9032%;
  max-width: none;
  height: 130.4348%;
  left: -156.129%;
  top: -17.7536%;
}

.demo-caption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  border-top: 1px solid var(--apply-media-border);
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

.demo-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: var(--apply-control-height);
  padding: 0 14px;
  border: 1px solid var(--apply-media-border);
  border-radius: var(--apply-radius-control);
  background: var(--tt-ink);
  color: var(--tt-text);
  font: inherit;
  font-size: var(--apply-type-control);
  font-weight: var(--apply-weight-control);
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.demo-control:hover { border-color: var(--tt-cyan); background: var(--tt-surface-raised); }
.demo-control:active { background: var(--tt-surface); }
.demo-control:focus-visible,
.application-journey summary:focus-visible { outline: 2px solid var(--tt-cyan); outline-offset: 4px; }
.demo-preview-toggle { position: absolute; bottom: 16px; right: 16px; }
.demo-watch { flex-shrink: 0; }

.demo-dialog {
  width: min(1200px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: 0;
  border: 1px solid var(--apply-media-border);
  border-radius: var(--apply-radius-card);
  background: var(--tt-ink);
  color: var(--tt-text);
  box-shadow: var(--apply-shadow-media);
}

.demo-dialog::backdrop { background: rgba(0, 0, 0, 0.86); backdrop-filter: blur(12px); }
.demo-dialog__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; }
.demo-dialog__header h2 { font-size: var(--apply-type-control); font-weight: var(--apply-weight-control); line-height: 1.4; }
.demo-dialog video { display: block; width: 100%; max-height: calc(100dvh - 116px); }

.application-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(340px, 0.54fr) minmax(0, 1fr);
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

.application-journey summary { display: none; cursor: pointer; color: var(--tt-text); }

.apply-steps {
  display: grid;
  gap: 24px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.apply-steps li {
  position: relative;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  align-items: start;
  gap: 18px;
}

.apply-steps li:not(:last-child)::after {
  position: absolute;
  z-index: -1;
  top: 16px;
  left: 5px;
  width: 1px;
  height: calc(100% + 12px);
  content: '';
  background: linear-gradient(to bottom, rgba(37, 244, 238, 0.36), rgba(254, 44, 85, 0.18));
}

.step-marker {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border: 2px solid var(--tt-cyan);
  border-radius: var(--tux-v2-radius-content-capsule);
  background: var(--tt-ink);
}

.step-content {
  min-width: 0;
  padding: 0;
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

.secret-note {
  margin: 20px 0 0 !important;
  padding: 13px 15px;
  color: var(--tt-muted) !important;
  font-size: 12px !important;
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
  scroll-margin-top: calc(var(--vp-nav-height) + 24px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: var(--apply-radius-card);
  background: linear-gradient(145deg, rgba(31, 32, 42, 0.97), rgba(18, 19, 26, 0.98));
  box-shadow: var(--apply-shadow-panel);
}

/* The anchor moves keyboard focus without drawing a frame around the whole form. */
.apply-shell:focus { outline: none; }

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

.native-form {
  min-height: 650px;
  padding: 26px 30px 32px;
}

.form-overview {
  scroll-margin-top: calc(var(--vp-nav-height) + 24px);
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.form-step legend:focus { outline: none; }

.form-overview > p {
  margin: 0;
  color: #9ca0ac;
  font-size: 12px;
  line-height: 1.55;
}

.form-progress {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.form-progress li {
  position: relative;
  display: grid;
  min-width: 0;
  padding-top: 12px;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  color: var(--tt-muted);
  border-top: 2px solid rgba(255, 255, 255, 0.09);
  transition: color 180ms ease, border-color 180ms ease;
}

.form-progress li::before {
  position: absolute;
  top: -2px;
  left: 0;
  width: 0;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, var(--tt-cyan), var(--tt-pink));
  transition: width 200ms ease;
}

.form-progress li.is-active,
.form-progress li.is-complete {
  color: #f5f6f8;
}

.form-progress li.is-active::before,
.form-progress li.is-complete::before { width: 100%; }

.form-progress li > span {
  color: inherit;
  font: 760 9px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.06em;
}

.form-progress li > strong {
  min-width: 0;
  overflow: hidden;
  font-size: 11px;
  font-weight: 720;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.native-form form { padding-top: 28px; }

.form-honeypot {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.form-step {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  animation: form-step-enter 200ms ease both;
}

.form-step > legend {
  width: 100%;
  margin: 0 0 24px;
  padding: 0;
  color: #fff;
  font-size: 22px;
  font-weight: 740;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 18px;
}

.form-field {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.form-field--wide { grid-column: 1 / -1; }

.form-field > span,
.event-question__heading > span {
  color: #eef0f4;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.form-field i,
.event-question__heading i {
  color: var(--tt-pink);
  font-style: normal;
}

.form-field input,
.form-field textarea,
.form-field select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  color: #f6f7fa;
  font: inherit;
  font-size: 13px;
  line-height: 1.45;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--tux-v2-radius-content-large);
  outline: none;
  background: rgba(255, 255, 255, 0.055);
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.form-field input,
.form-field select { height: 44px; padding: 0 13px; }

.form-field textarea {
  min-height: 112px;
  padding: 12px 13px;
  resize: vertical;
}

.form-field input::placeholder,
.form-field textarea::placeholder { color: var(--tt-muted); opacity: 1; }

.form-field select { color-scheme: dark; }
.form-field select:invalid { color: var(--tt-muted); }

.form-field input:hover,
.form-field textarea:hover,
.form-field select:hover { border-color: rgba(255, 255, 255, 0.24); }

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  border-color: rgba(37, 244, 238, 0.72);
  background: rgba(37, 244, 238, 0.055);
  box-shadow: 0 0 0 3px rgba(37, 244, 238, 0.1), 3px 0 0 rgba(254, 44, 85, 0.28);
}

.event-question { margin-bottom: 24px; }

.event-question__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.event-question__heading small {
  color: var(--tt-muted);
  font-size: 10px;
  line-height: 1.35;
  text-align: right;
}

.event-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.event-option {
  position: relative;
  display: grid;
  min-width: 0;
  padding: 14px;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--tux-v2-radius-container-level0-large);
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

.event-option:hover {
  border-color: rgba(37, 244, 238, 0.3);
  background: rgba(37, 244, 238, 0.04);
  transform: translateY(-1px);
}

.event-option input,
.consent-field input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.event-option__check,
.consent-field__check {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--tux-v2-radius-content-tiny);
  background: rgba(0, 0, 0, 0.18);
}

.event-option__check::after,
.consent-field__check::after {
  position: absolute;
  top: 3px;
  left: 6px;
  width: 4px;
  height: 8px;
  content: '';
  opacity: 0;
  border: solid #071214;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0.6);
  transition: opacity 120ms ease, transform 180ms ease;
}

.event-option input:checked + .event-option__check,
.consent-field input:checked + .consent-field__check {
  border-color: var(--tt-cyan);
  background: var(--tt-cyan);
  box-shadow: 2px -2px 0 rgba(254, 44, 85, 0.7);
}

.event-option input:checked + .event-option__check::after,
.consent-field input:checked + .consent-field__check::after {
  opacity: 1;
  transform: rotate(45deg) scale(1);
}

.event-option input:focus-visible + .event-option__check,
.consent-field input:focus-visible + .consent-field__check {
  outline: 3px solid rgba(37, 244, 238, 0.5);
  outline-offset: 3px;
}

.event-option strong {
  display: block;
  color: #f5f6f8;
  font-size: 12px;
  line-height: 1.25;
}

.event-option small {
  display: block;
  margin-top: 5px;
  color: #858894;
  font-size: 9px;
  line-height: 1.45;
}

.consent-field {
  display: grid;
  margin-top: 20px;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  color: #9497a2;
  font-size: 10px;
  line-height: 1.55;
  cursor: pointer;
}

.field-error,
.form-error {
  color: #ff9cad;
  font-size: 11px;
  line-height: 1.45;
}

.field-error { margin: 9px 0 0; }

.form-error {
  margin: 20px 0 0;
  padding: 11px 13px;
  border: 1px solid rgba(254, 44, 85, 0.24);
  border-radius: var(--tux-v2-radius-content-medium);
  background: rgba(254, 44, 85, 0.07);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.form-button {
  display: inline-flex;
  min-width: 112px;
  min-height: var(--tt-control-height);
  padding: 0 17px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #f6f7f9;
  font: inherit;
  font-size: 12px;
  font-weight: 760;
  border: 1px solid transparent;
  border-radius: var(--tux-v2-radius-content-large);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.form-button:hover:not(:disabled) { transform: translateY(-1px); }
.form-button:focus-visible { outline: 3px solid rgba(37, 244, 238, 0.6); outline-offset: 3px; }
.form-button:disabled { opacity: 0.55; cursor: wait; }

.form-button--secondary {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.045);
}

.form-button--secondary:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.28); background: rgba(255, 255, 255, 0.075); }

.form-button--primary {
  color: var(--tt-text);
  background: var(--tt-brand-black);
  box-shadow: var(--tt-shadow-brand);
}

.form-button--primary:hover:not(:disabled) {
  background: var(--tt-ink);
  box-shadow: var(--tt-shadow-brand-hover);
}

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
  color: var(--tt-muted);
  font-size: 12px;
  line-height: 1.6;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.apply-shell__footer p { flex-basis: 100%; margin: 0; }
.apply-shell__footer a { color: var(--tt-text); text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
.apply-shell__footer span::before { margin-right: 7px; color: var(--tt-cyan); content: '•'; }

@keyframes live-pulse {
  0%, 100% { opacity: 0.5; transform: scale(0.82); }
  50% { opacity: 1; transform: scale(1.18); }
}

@keyframes success-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes form-step-enter {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes grid-drift { to { background-position: 56px 28px, 56px 28px; } }

@keyframes headline-short-circuit {
  0%, 2.4% { opacity: 0; filter: brightness(2.2) blur(1px); transform: translate3d(-24px, 0, 0) scaleX(1.12); }
  4% { opacity: 0.36; filter: brightness(2); transform: translate3d(12px, 0, 0) skewX(2deg); }
  6.2% { opacity: 1; filter: brightness(1.7); transform: translate3d(-7px, 0, 0) skewX(-1deg); }
  9% { filter: brightness(1.25); transform: translate3d(3px, 0, 0); }
  12.5%, 100% { opacity: 1; filter: brightness(1); transform: translate3d(0, 0, 0); }
}

@keyframes headline-glitch-cyan {
  0%, 2.4%, 13%, 100% { opacity: 0; clip-path: inset(0 0 100% 0); transform: translate3d(0, 0, 0); }
  2.9% { opacity: 0.95; clip-path: inset(5% 0 69% 0); transform: translate3d(-42px, 0, 0) scaleX(1.18); }
  4.9% { opacity: 0.86; clip-path: inset(34% 0 40% 0); transform: translate3d(-18px, 0, 0) scaleX(1.08); }
  6.9% { opacity: 0.76; clip-path: inset(63% 0 10% 0); transform: translate3d(13px, 0, 0); }
  9.3% { opacity: 0.55; clip-path: inset(19% 0 57% 0); transform: translate3d(-8px, 0, 0); }
  11.8% { opacity: 0.22; clip-path: inset(76% 0 4% 0); transform: translate3d(-3px, 0, 0); }
}

@keyframes headline-glitch-pink {
  0%, 2.4%, 13%, 100% { opacity: 0; clip-path: inset(100% 0 0 0); transform: translate3d(0, 0, 0); }
  2.9% { opacity: 0.9; clip-path: inset(68% 0 6% 0); transform: translate3d(40px, 0, 0) scaleX(1.18); }
  4.9% { opacity: 0.82; clip-path: inset(12% 0 62% 0); transform: translate3d(17px, 0, 0) scaleX(1.08); }
  6.9% { opacity: 0.72; clip-path: inset(42% 0 31% 0); transform: translate3d(-12px, 0, 0); }
  9.3% { opacity: 0.5; clip-path: inset(72% 0 7% 0); transform: translate3d(8px, 0, 0); }
  11.8% { opacity: 0.2; clip-path: inset(27% 0 55% 0); transform: translate3d(3px, 0, 0); }
}

@keyframes headline-electric-line {
  0% { opacity: 0; transform: translate3d(-24%, 0, 0) scaleX(0.08); }
  1.6% { opacity: 0.42; transform: translate3d(-18%, 0, 0) scaleX(0.28); }
  2.9% { opacity: 1; transform: translate3d(-4%, 0, 0) scaleX(0.82); }
  4.5% { opacity: 0.94; transform: translate3d(0, 0, 0) scaleX(1); }
  6.5% { opacity: 0.56; transform: translate3d(8%, 0, 0) scaleX(0.72); }
  9.5%, 100% { opacity: 0; transform: translate3d(28%, 0, 0) scaleX(0.12); }
}

@keyframes headline-tiktok-smear-cyan {
  0%, 46%, 72%, 100% { opacity: 0.12; filter: blur(1px); transform: translate3d(-2px, 0, 0) scaleX(1); }
  58% { opacity: 0.72; filter: blur(7px); transform: translate3d(-20px, 0, 0) scaleX(1.08); }
}

@keyframes headline-tiktok-smear-pink {
  0%, 46%, 72%, 100% { opacity: 0.1; filter: blur(1px); transform: translate3d(2px, 0, 0) scaleX(1); }
  58% { opacity: 0.68; filter: blur(7px); transform: translate3d(20px, 0, 0) scaleX(1.08); }
}

@keyframes orbit-float {
  from { transform: translate3d(-20px, -12px, 0) scale(0.9); }
  to { transform: translate3d(38px, 28px, 0) scale(1.12); }
}

@keyframes ribbon-sweep {
  from { opacity: 0.08; transform: translate3d(-12vw, -3vh, 0) rotate(-18deg) scale(0.92); }
  to { opacity: 0.12; transform: translate3d(28vw, 10vh, 0) rotate(-12deg) scale(1.18); }
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
  .application-journey { margin-top: 24px; }
  .application-journey summary { display: list-item; padding: 14px 0; }
  .apply-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .apply-steps li:not(:last-child)::after { display: none; }
}

@media (max-width: 620px) {
  .apply-page { width: min(100% - 40px, 760px); padding: 26px 0 64px; }
  .radial-light-columns { top: -30px; left: -20px; width: 620px; opacity: 0.24; }
  .apply-kicker { margin-top: 14px; }
  .apply-headline { font-size: clamp(40px, 12vw, 60px); }
  .apply-page--zh .apply-headline { font-size: clamp(34px, 10.6vw, 42px); letter-spacing: -0.06em; }
  .apply-lede { font-size: 15px; }
  .apply-actions { display: grid; }
  .apply-button { width: 100%; }
  .demo-media { aspect-ratio: 1 / 1; }
  .demo-caption { padding: 20px; gap: 16px; }
  .demo-preview-toggle { right: 10px; bottom: 10px; }
  .demo-watch { width: 100%; }
  .application-section { margin-top: 82px; padding-top: 44px; }
  .application-intro h2 { font-size: 32px; }
  .apply-steps { grid-template-columns: 1fr; gap: 24px; }
  .apply-steps li:not(:last-child)::after { display: block; }
  .apply-shell__header { display: block; padding: 22px 20px; }
  .native-form { min-height: 0; padding: 22px 18px 26px; }
  .form-progress { gap: 5px; }
  .form-progress li { grid-template-columns: 1fr; gap: 5px; }
  .form-progress li > strong { font-size: 11px; }
  .form-grid { grid-template-columns: 1fr; gap: 17px; }
  .form-field--wide { grid-column: auto; }
  .event-question__heading { display: grid; }
  .event-question__heading small { text-align: left; }
  .event-options { grid-template-columns: 1fr; }
  .form-actions { justify-content: stretch; }
  .form-button { flex: 1 1 0; }
  .submission-success { min-height: 520px; padding: 56px 24px; }
  .apply-shell__footer { display: grid; padding: 16px 20px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .apply-page::after,
  .apply-orbit,
  .apply-ribbons span,
  .demo-card,
  .demo-media::after,
  .apply-headline em,
  .apply-headline em::before,
  .apply-headline em::after,
  .headline-tiktok-echo::before,
  .headline-tiktok-echo::after,
  .headline-short-circuit,
  .submission-success,
  .form-step { animation: none; }

  .apply-button,
  .demo-control,
  .demo-card,
  .form-progress li,
  .form-progress li::before,
  .form-field input,
  .form-field textarea,
  .form-field select,
  .event-option,
  .form-button { transition: none; }

  .demo-card:hover { transform: none; }
}
</style>
