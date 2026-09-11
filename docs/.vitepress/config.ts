import { defineConfig } from 'vitepress'

// https://vitepress.dev/guide/i18n
export default defineConfig({
  title: 'LIVE Studio Local Data Access',
  description: 'Local real-time event access for LIVE Studio third-party clients',
  appearance: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'preload', href: '/fonts/tiktok-sans-latin-variable.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
  ],
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      const defaultTableOpen = md.renderer.rules.table_open
      const defaultTableClose = md.renderer.rules.table_close

      // Keep wide reference tables scrollable without widening the document on mobile.
      md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
        const label = env.relativePath?.startsWith('zh/') ? '表格，可横向滚动' : 'Table, scroll horizontally'
        const table = defaultTableOpen?.(tokens, idx, options, env, self) ?? self.renderToken(tokens, idx, options)
        return `<div class="docs-table-scroll" role="region" aria-label="${label}" tabindex="0">${table}`
      }
      md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
        const table = defaultTableClose?.(tokens, idx, options, env, self) ?? self.renderToken(tokens, idx, options)
        return `${table}</div>\n`
      }

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
          { text: 'Home', link: '/' },
          { text: 'Demos', link: '/demos/' },
          {
            text: 'Documentation',
            activeMatch: '^/(guide|protocol|events|reference|samples)/',
            items: [
              { text: 'Quick Start', link: '/guide/quick-start' },
              { text: 'Agent Skill', link: '/guide/agent-skill' },
              { text: 'Protocol', link: '/protocol/connection' },
              { text: 'Events', link: '/events/' },
              { text: 'Gift Catalog', link: '/reference/gift-catalog' },
              { text: 'Samples', link: '/samples/javascript' },
            ],
          },
          { text: 'Apply', link: '/apply' },
        ],
        sidebar: [
          {
            "text": "Start building",
            "items": [
              {
                "text": "Quick Start",
                "link": "/guide/quick-start"
              },
              {
                "text": "Build with AI",
                "link": "/guide/agent-skill"
              },
              {
                "text": "Capability & boundaries",
                "link": "/guide/overview"
              }
            ]
          },
          {
            "text": "Events & gifts",
            "items": [
              {
                "text": "Choose an event",
                "link": "/events/"
              },
              {
                "text": "live.like",
                "link": "/events/live-like"
              },
              {
                "text": "live.gift",
                "link": "/events/live-gift"
              },
              {
                "text": "Gift Catalog",
                "link": "/reference/gift-catalog"
              },
              {
                "text": "live.chat",
                "link": "/events/live-chat"
              }
            ]
          },
          {
            "text": "API reference",
            "items": [
              {
                "text": "Architecture",
                "link": "/guide/architecture"
              },
              {
                "text": "Connection lifecycle",
                "link": "/protocol/connection"
              },
              {
                "text": "Authentication",
                "link": "/protocol/auth"
              },
              {
                "text": "Event envelope",
                "link": "/protocol/events"
              },
              {
                "text": "Errors & disconnects",
                "link": "/protocol/errors"
              }
            ]
          },
          {
            "text": "Samples & help",
            "items": [
              {
                "text": "H5: runnable starter",
                "link": "/samples/h5"
              },
              {
                "text": "JavaScript / TypeScript",
                "link": "/samples/javascript"
              },
              {
                "text": "Unity integration guide",
                "link": "/samples/unity"
              },
              {
                "text": "Demos & video",
                "link": "/demos/"
              },
              {
                "text": "Troubleshooting & support",
                "link": "/guide/troubleshooting"
              }
            ]
          }
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
          { text: '首页', link: '/zh/' },
          { text: 'Demo', link: '/zh/demos/' },
          {
            text: '开发文档',
            activeMatch: '^/zh/(guide|protocol|events|reference|samples)/',
            items: [
              { text: '快速开始', link: '/zh/guide/quick-start' },
              { text: 'Agent Skill', link: '/zh/guide/agent-skill' },
              { text: '协议', link: '/zh/protocol/connection' },
              { text: '事件', link: '/zh/events/' },
              { text: '礼物目录', link: '/zh/reference/gift-catalog' },
              { text: '示例', link: '/zh/samples/javascript' },
            ],
          },
          { text: '申请接入', link: '/zh/apply' },
        ],
        sidebar: [
          {
            "text": "开始接入",
            "items": [
              {
                "text": "快速开始",
                "link": "/zh/guide/quick-start"
              },
              {
                "text": "使用 AI 接入",
                "link": "/zh/guide/agent-skill"
              },
              {
                "text": "能力与边界",
                "link": "/zh/guide/overview"
              }
            ]
          },
          {
            "text": "事件与礼物",
            "items": [
              {
                "text": "选择事件",
                "link": "/zh/events/"
              },
              {
                "text": "live.like",
                "link": "/zh/events/live-like"
              },
              {
                "text": "live.gift",
                "link": "/zh/events/live-gift"
              },
              {
                "text": "礼物目录",
                "link": "/zh/reference/gift-catalog"
              },
              {
                "text": "live.chat",
                "link": "/zh/events/live-chat"
              }
            ]
          },
          {
            "text": "API 参考",
            "items": [
              {
                "text": "架构",
                "link": "/zh/guide/architecture"
              },
              {
                "text": "连接生命周期",
                "link": "/zh/protocol/connection"
              },
              {
                "text": "鉴权",
                "link": "/zh/protocol/auth"
              },
              {
                "text": "事件信封",
                "link": "/zh/protocol/events"
              },
              {
                "text": "错误码与断开",
                "link": "/zh/protocol/errors"
              }
            ]
          },
          {
            "text": "示例与排障",
            "items": [
              {
                "text": "H5：可运行示例",
                "link": "/zh/samples/h5"
              },
              {
                "text": "JavaScript / TypeScript",
                "link": "/zh/samples/javascript"
              },
              {
                "text": "Unity 接入指南",
                "link": "/zh/samples/unity"
              },
              {
                "text": "Demo 与视频",
                "link": "/zh/demos/"
              },
              {
                "text": "排障与支持",
                "link": "/zh/guide/troubleshooting"
              }
            ]
          }
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
