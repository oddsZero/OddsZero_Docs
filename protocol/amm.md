# AMM & Pricing Math

This page documents the **exact** pricing math used by OddsZero's constant-product AMM. It
is the reference for traders, researchers, and anyone who wants to replicate a quote
off-chain. All formulas are taken directly from `contracts/sources/amm_pool.move` and
`prediction_market.move`.

## Model

The pool holds `reserves[o]` = shares of outcome `o` for every outcome `o ∈ [0, n)`.

When collateral enters, a **complete set** of size `c` is minted: each outcome reserve
increases by `c`. Buying `a` shares of outcome `i` mints a set of size `c`; the trader keeps
`a` of outcome `i`, and the rest stays in the pool. We solve for `c` from the
constant-product condition on the two-sided "virtual reserves": the reserve of `i`
(`v_i`) versus the sum of **all other** reserves (`v_o`). This generalizes the binary
`x*y=k` formula to N outcomes.

Let:

- `n` = number of outcomes
- `m = n - 1`
- `v_i` = reserve of the bought outcome
- `v_o = Σ_{o ≠ i} reserve[o]` = sum of all other reserves
- `a` = shares the trader wants to buy (or is selling)

## Buy cost (collateral → shares)

`buy_cost(pool, outcome, shares)` solves a quadratic for the set size `c`:

```
m·c² + (m·(v_i − a) + v_o)·c − a·v_o = 0
```

Take the **positive root** with ceiling rounding (so the protocol never loses collateral):

```
disc = b² + 4·m·a·v_o          (where b = m·(v_i − a) + v_o, sign-handled)
c = ⌈(√disc − b) / (2·m)⌉
```

Notes:

- When reserves are empty (`v_i = v_o = 0`), the cost equals `shares` (1:1 seed).
- `b` can be negative when `a > v_i` (buying more than the pool holds of the outcome); the
  code handles the sign without `i128`.
- All intermediate math is `u128` and overflow-guarded (aborts with `EMathOverflow`).

## Sell return (shares → collateral)

`sell_return(pool, outcome, shares)` solves the smaller root of:

```
m·c² − (m·(v_i + a) + v_o)·c + a·v_o = 0
```

```
disc = b² − 4·m·a·v_o          (b = m·(v_i + a) + v_o)
c = ⌊(b − √disc) / (2·m)⌋
```

This is the **gross** collateral returned before fees.

## Inverse: shares for a collateral budget

`shares_for_cost(pool, outcome, cost)` is the inverse of `buy_cost`, computed by binary
search (since `buy_cost` is monotonic increasing in `shares`). This is what the UI uses to
honor a `min_shares` slippage floor when you enter a payment amount.

## Implied probability

The marginal implied probability of an outcome in basis points (10000 = 100%) is:

```
probability_bps(outcome) = reserve[outcome] · 10000 / total_reserves
```

where `total_reserves = Σ_o reserve[o]`. This is what the UI shows as the "price"/odds.

## Worked example (binary)

Two outcomes `Yes`/`No`, each reserve = `1000` (seeded with 1000 USDC complete set). You
want to buy `100` `Yes` shares.

- `n = 2, m = 1, v_i = 1000, v_o = 1000, a = 100`
- `b = 1·(1000 − 100) + 1000 = 1900`
- `disc = 1900² + 4·1·100·1000 = 3,610,000 + 400,000 = 4,010,000`
- `√disc ≈ 2002.5`
- `c = ⌈(2002.5 − 1900) / 2⌉ = ⌈102.5 / 2⌉ = ⌈51.25⌉ = 52`

So buying 100 `Yes` shares costs **52 collateral** (the set cost), before fees. After the
trade, `Yes` reserve = `1000 + 52 − 100 = 952`, `No` reserve = `1000 + 52 = 1052`, and the
implied `Yes` probability rises from 50% to `952 / 2004 ≈ 47.5%`.

> Notice the favorite (lower reserve) costs *less* per share — the AMM charges more for the
> outcome that is already more likely, exactly as a prediction market should.

## Apply buy / apply sell (reserve updates)

After computing `set = c`:

- **Buy**: `reserve[i] += (set − shares)`; for every other outcome `o`, `reserve[o] += set`.
  When buying the favorite, `set < shares`, so the pool's holding of `i` *decreases* (the
  trader took more than the minted set added). The ledger mirrors this exactly.
- **Sell**: `reserve[i] += (shares − set)`; for every other outcome `o`, `reserve[o] −= set`.

## Liquidity math

LP shares are minted/redeemed against **real collateral**, not `total_reserves`
(which would be `n × collateral` in a complete-set pool and bias LP math by a factor of `n`).

- **Seed** (`seed_liquidity`): reserves become `amount` per outcome; `lp_supply += amount`;
  `collateral += amount`.
- **Add** (`add_liquidity`): `minted = amount · lp_supply / collateral` (0 if supply is 0).
- **Remove** (`remove_liquidity`): `out = lp_shares · base / lp_supply`, where
  `base = min(collateral, min_reserve)`. The `min_reserve` bound ensures a provider can only
  withdraw a complete set up to the scarcest tranche — this keeps every `reserve[o] ≥ out`
  and preserves the ledger/pool mirror after trades have rebalanced reserves.

## Price of a trade (UI display)

The contract emits `price = set · 10000 / shares` for a buy and `c · 10000 / shares` for a
sell — i.e. the effective per-share price in basis points of collateral.
