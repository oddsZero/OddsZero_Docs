import { defineConfig } from 'vitepress'

const SUI = 'https://sui.io/'

export default defineConfig({
  base: '/OddsZero_Docs/',
  title: 'OddsZero',
  description: 'Fully on-chain, multi-outcome prediction market protocol built on Sui.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  // Enable the dark/light toggle. The theme defaults to dark via a small
  // inline script in Layout.vue; visitors can still switch to light.
  appearance: true,
  transformHead: ({ head }) => {
    // Make the CSS a normal stylesheet (most cache/compat-safe) instead of
    // VitePress's default "preload stylesheet" which some browsers skip.
    for (const tag of head) {
      if (tag[0] === 'link' && tag[1] && tag[1].rel === 'preload stylesheet') {
        tag[1].rel = 'stylesheet'
        delete tag[1].as
      }
    }
    head.push(['meta', { 'http-equiv': 'Cache-Control', content: 'no-cache, must-revalidate' }])
  },
  markdown: {
    lineNumbers: false,
    codeTransformers: [],
  },
  themeConfig: {
    logo: '/oddszero-64.png',
    nav: [
      { text: 'Introduction', link: '/introduction' },
      { text: 'Concepts', link: '/concepts/' },
      { text: 'Protocol', link: '/protocol/lifecycle' },
      { text: 'Guides', link: '/guides/user-guide' },
      { text: 'Security', link: '/security/model' },
      { text: 'Reference', link: '/reference/events' },
      { text: 'FAQ', link: '/faq' },
    ],
    sidebar: {
      '/concepts/': [
        {
          text: 'Core Concepts',
          items: [
            { text: 'Overview', link: '/concepts/' },
            { text: 'Architecture', link: '/concepts/architecture' },
          ],
        },
      ],
      '/protocol/': [
        {
          text: 'Protocol',
          collapsed: false,
          items: [
            { text: 'Market Lifecycle', link: '/protocol/lifecycle' },
            { text: 'AMM & Pricing Math', link: '/protocol/amm' },
            { text: 'Fees', link: '/protocol/fees' },
            { text: 'Resolution & Oracles', link: '/protocol/resolution' },
            { text: 'Disputes', link: '/protocol/disputes' },
            { text: 'Governance', link: '/protocol/governance' },
            { text: 'Treasury', link: '/protocol/treasury' },
            { text: 'LP Incentives', link: '/protocol/incentives' },
            { text: 'Price-Backed Markets', link: '/protocol/price-markets' },
            { text: 'Order Book (CLOB)', link: '/protocol/orderbook' },
          ],
        },
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'User Guide', link: '/guides/user-guide' },
            { text: 'Developer Guide', link: '/guides/developers' },
            { text: 'Deployment', link: '/guides/deployment' },
          ],
        },
      ],
      '/security/': [
        {
          text: 'Security',
          items: [
            { text: 'Security Model', link: '/security/model' },
            { text: 'Auditing the Contracts', link: '/security/audit' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Events', link: '/reference/events' },
            { text: 'Error Codes', link: '/reference/errors' },
            { text: 'Glossary', link: '/reference/glossary' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/oddsZero' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'OddsZero — Fully on-chain prediction markets on Sui.',
      copyright: 'Copyright © 2026 OddsZero',
    },
    docFooter: {
      prev: false,
      next: false,
    },
    outline: {
      label: 'On this page',
    },
    returnToTopLabel: 'Back to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Theme',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
  },
  head: [
    ['link', { rel: 'icon', href: '/oddszero-64.png' }],
    [
      'script',
      {},
      "try{var k='vitepress-theme-appearance';if(!localStorage.getItem(k)){document.documentElement.classList.add('dark')}else if(localStorage.getItem(k)==='light'){document.documentElement.classList.remove('dark')}}catch(e){}",
    ],
  ],
})
