# LP Incentives

OddsZero optionally rewards liquidity providers with continuous token emissions in the same
collateral `T`. This is implemented by `lp_incentives.move` and is **disabled by default**
per market.

## Components

- `IncentiveVault<T>` — a shared object holding reward tokens, funded by admin. Separate from
  the market collateral vault, so rewards never affect the 1:1 share-backing invariant.
- `IncentiveStream<T>` — a per-market stream stored inside `Market<T>` (has `store`).

## Accrual model (index-based)

The stream maintains a cumulative `index` = reward tokens per 1 LP share (fixed-point with
`SCALE = 1e9`). On every liquidity change for an LP, their `debt` is settled:

```
debt += lp_balance · (index − last_index) / SCALE
last_index = index
```

A scheduled emission advances the index by:

```
index += rate_per_sec · elapsed_ms · SCALE / total_lp_shares
```

`claim` transfers `debt` (bounded by the vault balance) to the LP and resets it to 0 (or to
the unpayable remainder if the vault is underfunded). The vault simply underpays rather than
overflowing user debt.

## Operations

- `create_vault<T>(registry)` — admin creates the shared reward vault.
- `fund_vault<T>(vault, reward, registry)` — admin funds rewards.
- `withdraw_vault<T>(vault, registry, cap, amount)` — admin withdraws unclaimed rewards.
- `configure_incentives(market, registry, cap, enabled, rate_per_sec, clock)` — admin (or
  market admin) enables/reconfigures a market's stream.
- `claim_incentives(market, vault, clock)` — any LP claims accrued rewards.
- `add_liquidity` / `remove_liquidity` automatically accrue the caller's position before
  changing their LP balance (so no emission is lost or double-counted).

## View helpers

- `incentives_enabled(market)`, `incentives_claimable(market, owner)`.
- `lp_incentives::vault_balance`, `total_funded`, `total_claimed`.

## Note for LPs

The treasury (protocol fees) and the incentive vault (LP rewards) are **separate** sources of
return. LP yield comes from incentive emissions here; protocol trading fees flow to the
treasury, not directly to LPs.
