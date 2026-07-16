<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomePage from './components/HomePage.vue'
import './styles/main.css'

const { Layout } = DefaultTheme
const { frontmatter, page } = useData()
</script>

<template>
  <HomePage v-if="frontmatter.layout === 'home'" />
  <Layout v-else>
    <template #layout-top>
      <div class="oz-aurora oz-aurora--subtle" aria-hidden="true">
        <span class="oz-blob oz-blob-1"></span>
        <span class="oz-blob oz-blob-2"></span>
        <span class="oz-grid"></span>
      </div>
    </template>
  </Layout>
</template>
