---
layout: home

hero:
  name: "OddsZero"
  text: "On-chain prediction markets"
  tagline: A fully on-chain, multi-outcome prediction market protocol built on Sui with the Move language. Trade outcome shares, provide liquidity, and redeem 1:1 against collateral.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: View Protocol
      link: /protocol/lifecycle
  image:
    src: /oddszero.png
    alt: OddsZero

features:
  - icon: 🔓
    title: Fully on-chain
    details: Non-custodial and fully collateralized. Markets, AMM, resolution, and disputes all live in a single Move package on Sui.
  - icon: 📊
    title: Constant-product AMM
    details: Trade outcome shares against a CPMM. Prices reflect the market's collective probability estimate, in real time.
  - icon: 🛡️
    title: Oracle resolution
    details: Markets resolve via registered oracles with a bonded dispute window and escalation to governance.
  - icon: 💧
    title: Liquidity & incentives
    details: Provide liquidity, earn fees, and receive LP incentive emissions. Makers get a rebate.
  - icon: 🔗
    title: Built on Sui
    details: Move (edition 2024), native USDC collateral, fast finality. Explore on suiscan.xyz.
  - icon: 📚
    title: For everyone
    details: Clear docs for users, developers, and security researchers — from first trade to auditing the contracts.
---

## What's inside

| Section | Who it's for |
| --- | --- |
| [Introduction](/introduction) | Everyone — what OddsZero is and why it exists |
| [Core Concepts](/concepts/) | Everyone — prediction markets, the CTF model, collateral |
| [Architecture](/concepts/architecture) | Developers & researchers — module map & data flow |
| [Market Lifecycle](/protocol/lifecycle) | Everyone — open → trading → resolving → resolved |
| [AMM & Pricing Math](/protocol/amm) | Researchers & traders — exact formulas |
| [Fees](/protocol/fees) | Everyone — protocol, creator, referral, maker rebate |
| [Resolution & Oracles](/protocol/resolution) | Everyone — how outcomes get decided |
| [Disputes](/protocol/disputes) | Everyone — bonded dispute window & escalation |
| [Governance](/protocol/governance) | Everyone — DAO parameters & voting |
| [Treasury](/protocol/treasury) | Researchers & admins — fee collection |
| [LP Incentives](/protocol/incentives) | LPs — reward emissions |
| [Price-Backed Markets](/protocol/price-markets) | Traders & devs — automated BTC Up/Down resolution |
| [Order Book (CLOB)](/protocol/orderbook) | Traders & devs — optional limit-order venue |
| [User Guide](/guides/user-guide) | Users — trading, creating markets, redeeming |
| [Developer Guide](/guides/developers) | Developers — contracts, SDK, frontend |
| [Deployment](/guides/deployment) | Developers — build, test, publish |
| [Security Model](/security/model) | Security researchers — invariants & threat model |
| [Auditing the Contracts](/security/audit) | Security researchers — where to look |
| [Events Reference](/reference/events) | Developers — on-chain events |
| [Error Codes](/reference/errors) | Developers — full error catalog |
| [Glossary](/reference/glossary) | Everyone — terms |
| [FAQ](/faq) | Everyone — common questions |

## Networks & contract addresses

| Item | Value |
| --- | --- |
| Package name | `oddszero` |
| Language | Move (edition 2024) |
| Collateral | Native USDC (6 decimals) |
| Testnet package id | `0x37573a1060e150e2cbc48ea310e1a05b859dd18541344ffe1c2e304fee702916` |
| Toolchain | Sui CLI `1.74.1` |
| Explorer | [suiscan.xyz/testnet](https://suiscan.xyz/testnet) |

> Mainnet addresses will be published here before launch.
