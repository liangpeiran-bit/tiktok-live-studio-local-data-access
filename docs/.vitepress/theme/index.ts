import type { Theme } from 'vitepress'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { defineComponent, h } from 'vue'
import DeveloperApplication from './DeveloperApplication.vue'
import DemoShowcase from './DemoShowcase.vue'
import GiftCatalog from './GiftCatalog.vue'
import HomeHeroInfo from './HomeHeroInfo.vue'
import HomeLiveDemo from './HomeLiveDemo.vue'
import LlmDocsEntry from './LlmDocsEntry.vue'
import LlmSiteFooter from './LlmSiteFooter.vue'
import Mermaid from './Mermaid.vue'
import './custom.css'
import './home.css'
import './headline-motion.css'
import './docs.css'

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    setup() {
      const { frontmatter, page } = useData()
      return () => h(DefaultTheme.Layout, {
        class: {
          'docs-layout': !page.value.isNotFound && (!frontmatter.value.layout || frontmatter.value.layout === 'doc'),
        },
      }, {
        'home-hero-info': () => h(HomeHeroInfo),
        'home-hero-image': () => h(HomeLiveDemo),
        'layout-bottom': () => h(LlmSiteFooter),
      })
    },
  }),
  enhanceApp({ app }) {
    app.component('DeveloperApplication', DeveloperApplication)
    app.component('DemoShowcase', DemoShowcase)
    app.component('GiftCatalog', GiftCatalog)
    app.component('LlmDocsEntry', LlmDocsEntry)
    app.component('Mermaid', Mermaid)
  },
} satisfies Theme
