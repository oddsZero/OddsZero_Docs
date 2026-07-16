# OddsZero Documentation

> Fully on-chain, multi-outcome prediction market protocol built on [Sui](https://sui.io/) with the Move language.

OddsZero is a non-custodial, fully-collateralized prediction-market protocol. Anyone can
create a market, trade outcome shares against a constant-product AMM, provide liquidity,
and redeem winning positions 1:1 against collateral once a market is resolved by a
registered oracle. This documentation is meant to be useful for **everyone** — end users,
researchers and security researchers, and developers building on top of OddsZero.

---

## What is inside

| Section | Who is it for |
| --- | --- |
| [Introduction](introduction.md) | Everyone — what OddsZero is and why it exists |
| [Core Concepts](concepts/index.md) | Everyone — prediction markets, the CTF model, collateral |
| [Architecture](concepts/architecture.md) | Developers & researchers — module map & data flow |
| [Market Lifecycle](protocol/lifecycle.md) | Everyone — open → trading → resolving → resolved |
| [AMM & Pricing Math](protocol/amm.md) | Researchers & traders — exact formulas |
| [Fees](protocol/fees.md) | Everyone — protocol, creator, referral, maker rebate |
| [Resolution & Oracles](protocol/resolution.md) | Everyone — how outcomes get decided |
| [Disputes](protocol/disputes.md) | Everyone — bonded dispute window & escalation |
| [Governance](protocol/governance.md) | Everyone — DAO parameters & voting |
| [Treasury](protocol/treasury.md) | Researchers & admins — fee collection |
| [LP Incentives](protocol/incentives.md) | LPs — reward emissions |
| [Price-Backed Markets](protocol/price-markets.md) | Traders & devs — automated BTC Up/Down resolution |
| [Order Book (CLOB)](protocol/orderbook.md) | Traders & devs — optional limit-order venue |
| [User Guide](guides/user-guide.md) | Users — trading, creating markets, redeeming |
| [Developer Guide](guides/developers.md) | Developers — contracts, SDK, frontend |
| [Deployment](guides/deployment.md) | Developers — build, test, publish |
| [Security Model](security/model.md) | Security researchers — invariants & threat model |
| [Auditing the Contracts](security/audit.md) | Security researchers — where to look |
| [Events Reference](reference/events.md) | Developers — on-chain events |
| [Error Codes](reference/errors.md) | Developers — full error catalog |
| [Glossary](reference/glossary.md) | Everyone — terms |
| [FAQ](faq.md) | Everyone — common questions |

---

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
