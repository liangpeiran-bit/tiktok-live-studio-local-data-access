import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import DeveloperApplication from './DeveloperApplication.vue'
import GiftCatalog from './GiftCatalog.vue'
import Mermaid from './Mermaid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DeveloperApplication', DeveloperApplication)
    app.component('GiftCatalog', GiftCatalog)
    app.component('Mermaid', Mermaid)
  },
} satisfies Theme
