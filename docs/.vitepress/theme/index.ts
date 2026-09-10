import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { h } from 'vue'
import DeveloperApplication from './DeveloperApplication.vue'
import DemoShowcase from './DemoShowcase.vue'
import GiftCatalog from './GiftCatalog.vue'
import LlmDocsEntry from './LlmDocsEntry.vue'
import LlmSiteFooter from './LlmSiteFooter.vue'
import Mermaid from './Mermaid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-bottom': () => h(LlmSiteFooter),
  }),
  enhanceApp({ app }) {
    app.component('DeveloperApplication', DeveloperApplication)
    app.component('DemoShowcase', DemoShowcase)
    app.component('GiftCatalog', GiftCatalog)
    app.component('LlmDocsEntry', LlmDocsEntry)
    app.component('Mermaid', Mermaid)
  },
} satisfies Theme
