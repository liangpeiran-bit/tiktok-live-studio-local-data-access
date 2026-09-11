<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  formId: string
  locale?: 'en' | 'zh'
}>()

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
        program: '开发者计划',
        requestAccess: '申请抢先体验',
        formIntro: '填写约需 3 分钟。带 * 的项目为必填项，审核结果通过邮箱通知。',
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
        informationUse: '申请通过 Formspree 提交至 LIVE Studio 团队。请勿填写密钥或观众原始数据。',
        support: '申请或接入遇到问题？',
      }
    : {
        program: 'DEVELOPER PROGRAM',
        requestAccess: 'Request early access',
        formIntro: 'About 3 minutes. Fields marked * are required. Review results are sent by email.',
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
        informationUse: 'Your application is sent through Formspree to the LIVE Studio team. Never include secrets or raw viewer data.',
        support: 'Need help with your application or integration?',
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
    applicationForm.value?.querySelector('.form-panels')?.scrollTo({ top: 0, behavior: 'instant' })
    if (window.matchMedia('(max-width: 620px), (max-height: 680px)').matches) {
      applicationForm.value?.previousElementSibling?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
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
</script>

<template>
  <main class="apply-page" :class="{ 'apply-page--zh': isZh }" :lang="isZh ? 'zh-CN' : 'en'">
    <section id="application" class="apply-shell" aria-labelledby="application-title" tabindex="-1">
      <header class="apply-shell__header">
        <div>
          <span class="eyebrow">{{ copy.program }}</span>
          <h1 id="application-title">{{ copy.requestAccess }}</h1>
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
        <h2>{{ copy.successTitle }}</h2>
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

          <div class="form-panels">
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
                  <textarea name="game_description" rows="3" required :placeholder="copy.fields.gameDescriptionPlaceholder"></textarea>
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
                  <textarea name="interaction_design" rows="3" required :placeholder="copy.fields.interactionPlaceholder"></textarea>
                </label>
                <label class="form-field form-field--wide">
                  <span>{{ copy.fields.notes }}</span>
                  <textarea name="additional_notes" rows="2" :placeholder="copy.fields.notesPlaceholder"></textarea>
                </label>
              </div>

              <label class="consent-field">
                <input name="contact_consent" type="checkbox" value="confirmed" required />
                <span class="consent-field__check" aria-hidden="true"></span>
                <span>{{ copy.fields.consent }}</span>
              </label>
            </fieldset>

            <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>

          </div>
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
      </footer>
    </section>
  </main>
</template>

<style scoped src="./developer-application.css"></style>
