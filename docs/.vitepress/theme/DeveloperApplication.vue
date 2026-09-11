<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  formId: string
  locale?: 'en' | 'zh'
}>()

const demoVideo = ref<HTMLVideoElement | null>(null)
const previewPlaying = ref(false)
const journeyOpen = ref(false)
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
        pausePreview: '暂停预览',
        playPreview: '播放预览',
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
        pausePreview: 'Pause preview',
        playPreview: 'Play preview',
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

onMounted(() => {
  const compactLayout = window.matchMedia('(max-width: 1100px)')
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
          <video
            ref="demoVideo"
            muted
            loop
            playsinline
            preload="metadata"
            poster="/media/interactive-tower-defense-demo.webp"
            role="button"
            tabindex="0"
            :aria-label="`${copy.demoAria} — ${previewPlaying ? copy.pausePreview : copy.playPreview}`"
            @click="togglePreview"
            @keydown.space.prevent="togglePreview"
            @keydown.enter.prevent="togglePreview"
            @play="previewPlaying = true"
            @pause="previewPlaying = false"
          >
            <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="demo-caption">
          <div class="demo-story">
            <span>{{ copy.demoEvent }}</span>
            <h2 id="demo-title">{{ copy.demoTitle }}</h2>
            <p>{{ copy.demoDescription }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="application-section">
      <div class="application-intro">
        <span class="section-index">{{ copy.sectionIndex }}</span>
        <h2>{{ copy.applicationTitle }}</h2>
        <p>{{ copy.applicationDescription }}</p>

        <details class="application-journey" :open="journeyOpen">
          <summary>{{ copy.journeySummary }}</summary>
        <ol class="apply-steps" :aria-label="copy.stepsAria">
          <li v-for="(step, index) in copy.steps" :key="step.title">
            <div class="step-marker" aria-hidden="true">{{ index + 1 }}</div>
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
          <p>{{ copy.support }} <a href="mailto:TikTok_LIVE_Studio_Office@bytedance.com">TikTok_LIVE_Studio_Office@bytedance.com</a></p>
          <span v-for="item in copy.footer" :key="item">{{ item }}</span>
        </footer>
      </section>
    </section>
  </main>
</template>

<style scoped src="./developer-application.css"></style>
