# Core Concepts

This page explains the ideas behind OddsZero in plain language. No code required — but
links to exact details are provided throughout.

## What is a prediction market?

A prediction market is a marketplace where people trade contracts that pay out depending on
the outcome of a future event. The price of a contract acts as the market's estimate of the
probability that the outcome happens.

- A "Yes" share trading at **$0.70** means the market thinks "Yes" has a **70%** chance.
- If "Yes" happens, each "Yes" share is worth **$1.00**. If it doesn't, it is worth **$0**.

By aggregating the beliefs of many traders, prediction markets often produce more accurate
forecasts than any individual expert.

## Outcomes and shares

Every OddsZero market has a list of **outcomes** (at least two). For each outcome the
market issues **shares**.

- Binary market: outcomes `["Yes", "No"]`.
- Multi-outcome market: `["Democrat", "Republican", "Other"]`.

A share represents a claim on the collateral vault **if its outcome wins**. Only the winning
outcome's shares are redeemable, and they are redeemed **parimutuel pro-rata** from the
trader-staked collateral.

## The Conditional Token Framework (CTF) "complete set" model

This is the heart of OddsZero's collateralization guarantee.

> For every 1 unit of collateral that enters a market, the protocol mints **exactly one
> share of every outcome**. This unit is called a **complete set**.

So if collateral in the vault is `C`, there are `n` outcomes, and total shares minted
across all outcomes is `n × C`. When the market resolves, exactly one outcome wins; each
complete set contributes exactly one winning share. Therefore:

```
winning shares in circulation  ==  collateral in the vault
```

Winners are paid **parimutuel pro-rata** from the **trader-staked collateral only**:
`payout = floor(your_shares × win_refund_pool / total_winning_shares)`. The creator's
seed is ring-fenced in a separate `seed_vault` and **always fully refunded** before winners
are paid, so it can never be drawn on. If the market is heavily one-sided, winners are paid
pro-rata out of *other traders'* stakes. Redemption is therefore always fully collateralized
and the seed is never at risk.

### Why fees never dilute backing

Fees (protocol + creator) are taken **directly from the trader's payment** and are
**never** added to the collateral vault. Referral fees have been removed. The vault only
ever grows by the "set cost" portion of a trade. This keeps the share backing invariant
intact regardless of fees.

## Collateral

OddsZero settles in a **single stablecoin per market** (USDC on Sui, 6 decimals). The
contracts are generic over the coin type `T` via a typed `Collateral<T>` wrapper, but the
production deployment uses native USDC.

- 1 share = 1 unit of collateral at resolution (1 USDC = 1,000,000 base units).
- The vault is the only source of redemption funds.
- The creator must seed the market with **exactly 10,000 USDC** (`FIXED_INITIAL_LIQUIDITY`).
  This seed is **ring-fenced** in a `seed_vault` and **always fully refunded** to the creator
  when the market closes or resolves. If a market is **never resolved** (oracle goes silent),
  anyone may recover the seed after `ends_at + 30 days` via `reclaim_abandoned_seed`.

## Constant-product AMM

Trades are priced by a **constant-product AMM** that generalizes the classic binary
`x*y=k` formula to `n` outcomes. The pool holds reserves of each outcome's shares. Buying
shares of an outcome pushes its price up; selling pushes it down. The implied probability of
an outcome is simply:

```
probability(outcome) = reserve[outcome] / total_reserves
```

See [AMM & Pricing Math](amm.md) for the exact formulas.

## Liquidity providers (LPs)

Anyone can seed or add collateral to the AMM pool and receive **LP shares** proportional to
their contribution. LPs earn a slice of trading fees (the creator fee is paid to the
creator, but the protocol fee flows to the treasury; see [Fees](fees.md)). LPs take on
"inventory risk": as prices move, the pool accumulates more of the now-favored outcome.

## Oracles and resolution

A registered **oracle** proposes the winning outcome after the market closes. This opens a
**dispute window** during which anyone can challenge the result by posting a bond. After
the window, the outcome is finalized and redemption opens. See [Resolution & Oracles](resolution.md)
and [Disputes](disputes.md).

## Price-backed markets

A special market type ("BTC Up/Down") resolves automatically against a real asset price at
expiry — no human opinion involved. See [Price-Backed Markets](price-markets.md).

---

Next: [Architecture](architecture.md) for the module map, or jump to the
[User Guide](guides/user-guide.md).
