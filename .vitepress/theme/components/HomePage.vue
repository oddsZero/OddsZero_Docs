<script setup lang="ts">
import { withBase } from 'vitepress'

const logo = withBase('/oddszero-64.png')

const stats = [
  { value: '100%', label: 'On-chain' },
  { value: 'CPMM', label: 'Pricing engine' },
  { value: 'USDC', label: 'Collateral' },
  { value: 'Move', label: 'On Sui' },
]

const sections = [
  {
    icon: '◈',
    title: 'Core Concepts',
    desc: 'Prediction markets, the conditional-token model, and collateral — explained for everyone.',
    href: '/concepts/',
    tag: 'Start here',
  },
  {
    icon: '⚙',
    title: 'Protocol',
    desc: 'Market lifecycle, AMM math, fees, resolution, disputes, governance, treasury and more.',
    href: '/protocol/lifecycle',
    tag: 'Deep dive',
  },
  {
    icon: '✦',
    title: 'Guides',
    desc: 'Trade, create markets, build on the SDK, and deploy the contracts yourself.',
    href: '/guides/user-guide',
    tag: 'Hands-on',
  },
  {
    icon: '⛨',
    title: 'Security',
    desc: 'Invariants, threat model, and exactly where to look when auditing the Move contracts.',
    href: '/security/model',
    tag: 'For researchers',
  },
  {
    icon: '⌘',
    title: 'Reference',
    desc: 'On-chain events, the full error catalog, and a glossary of terms.',
    href: '/reference/events',
    tag: 'Lookup',
  },
  {
    icon: '?',
    title: 'FAQ',
    desc: 'Common questions about markets, fees, resolution, and redemption.',
    href: '/faq',
    tag: 'Quick answers',
  },
]
</script>

<template>
  <div class="oz-home">
    <header class="oz-topbar">
      <a class="oz-brand" href="/">
        <img :src="logo" alt="OddsZero" class="oz-brand-logo" />
        <span>OddsZero</span>
      </a>
      <nav class="oz-topnav">
        <a href="/introduction">Introduction</a>
        <a href="/concepts/">Concepts</a>
        <a href="/protocol/lifecycle">Protocol</a>
        <a href="/guides/user-guide">Guides</a>
        <a href="/security/model">Security</a>
        <a href="/faq">FAQ</a>
      </nav>
      <a class="oz-ghost-btn" href="https://github.com/oddsZero" target="_blank" rel="noreferrer">GitHub ↗</a>
    </header>

    <section class="oz-hero">
      <span class="oz-eyebrow">Fully on-chain · Built on Sui</span>
      <h1 class="oz-title">
        Prediction markets,<br />
        <span class="oz-gradient">priced by the crowd.</span>
      </h1>
      <p class="oz-sub">
        OddsZero is a non-custodial, fully-collateralized prediction-market protocol.
        Trade outcome shares against a constant-product AMM, provide liquidity, and
        redeem winning positions 1:1 — all settled on-chain.
      </p>
      <div class="oz-cta">
        <a class="oz-primary-btn" href="/introduction">Read the docs →</a>
        <a class="oz-secondary-btn" href="/protocol/lifecycle">Explore the protocol</a>
      </div>
      <div class="oz-stats">
        <div v-for="s in stats" :key="s.label" class="oz-stat">
          <span class="oz-stat-value">{{ s.value }}</span>
          <span class="oz-stat-label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <section class="oz-sections">
      <a v-for="(s, i) in sections" :key="s.title" :href="s.href" class="oz-card" :style="{ '--i': i }">
        <span class="oz-card-icon">{{ s.icon }}</span>
        <span class="oz-card-tag">{{ s.tag }}</span>
        <h3>{{ s.title }}</h3>
        <p>{{ s.desc }}</p>
        <span class="oz-card-arrow">→</span>
      </a>
    </section>

    <footer class="oz-footer">
      <span>© 2026 OddsZero</span>
      <span>Fully on-chain prediction markets on Sui.</span>
    </footer>
  </div>
</template>
