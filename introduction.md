# Introduction

OddsZero is a **fully on-chain prediction market protocol** deployed on the Sui blockchain.
It lets people trade on the outcome of future events — elections, sports, crypto prices,
science, economics, and anything else — using shares whose prices reflect the market's
collective probability estimate.

## Why OddsZero

Most prediction markets are custodial or partially off-chain. OddsZero is different:

- **Fully on-chain.** Every market, every trade, every resolution lives in auditable
  Move smart contracts on Sui. There is no backend that can freeze your funds.
- **Non-custodial.** Your shares and collateral are held in contracts you interact with
  directly. Only the winning shares you own are ever redeemable, 1:1 against the vault.
- **Fully collateralized.** The core design guarantees that the collateral in a market's
  vault always equals the value of one complete set of shares. Redemption can never be
  underfunded.
- **Multi-outcome.** Markets support two or more outcomes (binary "Yes/No", or many
  candidates).
- **Open & permissionless.** Anyone can create a market, anyone can trade, anyone can
  provide liquidity, and anyone can raise a dispute against a wrong resolution.
- **Automated price markets.** Short-expiry binary markets (e.g. "Will BTC be UP in 15m?")
  resolve automatically against a real Pyth price reading at expiry — no human oracle needed.

## The one-paragraph version

A market holds a pool of USDC collateral. When you buy shares of an outcome, collateral
enters the vault and a **complete set** of shares is minted (one of every outcome); the
constant-product AMM prices the shares so the pool always implies a probability for each
outcome. When the event ends, a registered oracle proposes the winning outcome and a
dispute window opens. If no successful dispute occurs, the outcome is finalized and every
holder of winning shares can redeem their **parimutuel pro-rata** payout from the
trader-staked collateral. A small fee is taken on each trade and routed to the protocol
treasury and the market creator. The creator's seed is ring-fenced and **always fully
refunded** before winners are paid.

## Who should read what

- **Just want to trade?** Go to the [User Guide](guides/user-guide.md).
- **Building an app or bot?** Go to the [Developer Guide](guides/developers.md).
- **Auditing or researching security?** Go to [Security Model](security/model.md) and
  [Auditing the Contracts](security/audit.md).
- **Want the exact math?** Go to [AMM & Pricing Math](protocol/amm.md).

## A quick mental model

```
            Creator                 Trader                 Liquidity Provider
               │                      │                           │
               ▼                      ▼                           ▼
        create_market()        buy_shares() /          add_liquidity()
                                    sell_shares()             │
                                    redeem_shares()           ▼
                                        │                AMM pool (collateral)
                                        ▼                    │  ▲
                                 ┌──────────────┐            │  │
                                 │  Collateral  │◄──fees─────┘  │
                                 │    Vault     │               │
                                 └──────────────┘               │
                                        │                      │
                                 after resolution:             │
                                 redeem 1:1 ◄──────────────────┘
```

The next step is [Core Concepts](concepts/index.md).
