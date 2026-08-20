import { defineConfig } from 'vitepress'

// https://vitepress.dev/guide/i18n
export default defineConfig({
  title: 'LIVE Studio Local Data Access',
  description: 'Local real-time event access for LIVE Studio third-party clients',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
  ],
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence!

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const lang = token.info.trim().split(/\s+/)[0]

        if (lang === 'mermaid') {
          return `<Mermaid code="${encodeURIComponent(token.content.trimEnd())}"></Mermaid>\n`
        }

        return defaultFence(tokens, idx, options, env, self)
      }
    },
  },
  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },
  themeConfig: {
    logo: {
      src: '/logo.png',
      alt: 'LIVE Studio',
    },
    siteTitle: 'LIVE Studio',
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'LIVE Studio Local Data Access',
      description: 'Local real-time event access for LIVE Studio third-party clients',
      themeConfig: {
        nav: [
          { text: 'Overview', link: '/' },
          { text: 'Quick Start', link: '/guide/quick-start' },
          { text: 'Agent Skill', link: '/guide/agent-skill' },
          { text: 'Protocol', link: '/protocol/connection' },
          { text: 'Events', link: '/events/live-like' },
          { text: 'Samples', link: '/samples/javascript' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Overview', link: '/guide/overview' },
              { text: 'Quick Start', link: '/guide/quick-start' },
              { text: 'Architecture', link: '/guide/architecture' },
              { text: 'Agent Skill', link: '/guide/agent-skill' },
              { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            ],
          },
          {
            text: 'Protocol',
            items: [
              { text: 'Connection Lifecycle', link: '/protocol/connection' },
              { text: 'Authentication', link: '/protocol/auth' },
              { text: 'Event Envelope', link: '/protocol/events' },
              { text: 'Errors and Disconnects', link: '/protocol/errors' },
            ],
          },
          {
            text: 'Events',
            items: [
              { text: 'live.like', link: '/events/live-like' },
              { text: 'live.gift', link: '/events/live-gift' },
              { text: 'live.chat', link: '/events/live-chat' },
            ],
          },
          {
            text: 'Samples',
            items: [
              { text: 'JavaScript / TypeScript', link: '/samples/javascript' },
              { text: 'Unity', link: '/samples/unity' },
              { text: 'H5 Overlay', link: '/samples/h5' },
            ],
          },
        ],
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'LIVE Studio 本地数据开放',
      description: 'LIVE Studio 本地实时事件开放能力文档',
      themeConfig: {
        nav: [
          { text: '概览', link: '/zh/' },
          { text: '快速开始', link: '/zh/guide/quick-start' },
          { text: 'Agent Skill', link: '/zh/guide/agent-skill' },
          { text: '协议', link: '/zh/protocol/connection' },
          { text: '事件', link: '/zh/events/live-like' },
          { text: '示例', link: '/zh/samples/javascript' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '概览', link: '/zh/guide/overview' },
              { text: '快速开始', link: '/zh/guide/quick-start' },
              { text: '架构', link: '/zh/guide/architecture' },
              { text: 'Agent Skill', link: '/zh/guide/agent-skill' },
              { text: '排障', link: '/zh/guide/troubleshooting' },
            ],
          },
          {
            text: '协议',
            items: [
              { text: '连接生命周期', link: '/zh/protocol/connection' },
              { text: '鉴权', link: '/zh/protocol/auth' },
              { text: '事件信封', link: '/zh/protocol/events' },
              { text: '错误码与断开', link: '/zh/protocol/errors' },
            ],
          },
          {
            text: '事件',
            items: [
              { text: 'live.like', link: '/zh/events/live-like' },
              { text: 'live.gift', link: '/zh/events/live-gift' },
              { text: 'live.chat', link: '/zh/events/live-chat' },
            ],
          },
          {
            text: '示例',
            items: [
              { text: 'JavaScript / TypeScript', link: '/zh/samples/javascript' },
              { text: 'Unity', link: '/zh/samples/unity' },
              { text: 'H5 Overlay', link: '/zh/samples/h5' },
            ],
          },
        ],
        outline: { label: '本页目录' },
        lastUpdated: { text: '最后更新' },
        docFooter: { prev: '上一页', next: '下一页' },
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
      },
      markdown: {
        container: {
          tipLabel: '提示',
          warningLabel: '警告',
          dangerLabel: '危险',
          infoLabel: '说明',
          detailsLabel: '详情',
        },
        codeCopyButton: {
          tooltipText: '复制代码',
          copiedText: '已复制',
        },
      },
    },
  },
})
