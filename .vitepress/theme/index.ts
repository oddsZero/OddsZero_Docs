import DefaultTheme from 'vitepress/theme'
import './styles/main.css'
import HomePage from './components/HomePage.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
  },
}
