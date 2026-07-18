# Fees

OddsZero takes fees on every trade. Fees are **never** added to the collateral vault, so
share backing is never diluted. This page covers every fee type, how it is computed, and
where it goes.

## Fee types

All fees are expressed in **basis points** (bps); `10000 bps = 100%`.

| Fee | Default (testnet) | Bound | Paid to | Snapshot |
| --- | --- | --- | --- | --- |
| `protocol_fee_bps` | **75 (0.75%) — fixed** | only `75` accepted | Treasury | At market creation |
| `creator_fee_bps` | **25 (0.25%) — fixed** | only `25` accepted | Market creator | At market creation |
| `dispute_bond_bps` | 100 (1.00%) | ≤ 1000 | Bond (returned/forfeited) | At market creation |
| `maker_rebate_bps` | 2500 (25%) | ≤ 10000 | (discount, not a fee) | At market creation |

> **Fees are now fixed.** The protocol fee is locked at **0.75% (75 bps)** and the creator
> fee at **0.25% (25 bps)**. Neither can be changed at market creation or via governance — the
> `creator_fee_bps`/`protocol_fee_bps` arguments supplied to the create-market entry points are
> **ignored** and always stored as these constants (`FIXED_PROTOCOL_FEE_BPS`,
> `FIXED_CREATOR_FEE_BPS`). This prevents an admin or creator from raising fees to
> rent-extract from traders.

> **Referral fees removed.** Referral fees have been removed entirely. The `referrals_enabled`
> and `referral_fee_bps` fields still exist in the `Governance` object for backward
> compatibility but are **unused** — no referrer is ever paid. The `referrer` argument on
> `create_market` is accepted but ignored.

## How a buy is split

For a buy of `payment` collateral, `compute_buy` first removes the fee portion from the
set cost:

```
fee_bps   = protocol_fee_bps + creator_fee_bps
denom     = 10000 + fee_bps
set       = payment · 10000 / denom          // set cost that enters the vault
protocol_fee = set · protocol_fee_bps / 10000
creator_fee  = set · creator_fee_bps / 10000
shares    = shares_for_cost(pool, outcome, set)
```

The remaining `payment − set − protocol_fee − creator_fee` is routed to the treasury as a
residual rounding remainder (the creator never receives dust that should belong to the
protocol). The `set` portion is deposited into the collateral vault and priced by the AMM.

## How a sell is split

```
c            = sell_return(pool, outcome, shares)   // gross return
protocol_fee = c · protocol_fee_bps / 10000
creator_fee  = c · creator_fee_bps / 10000
payout       = c − protocol_fee − creator_fee        // returned to seller
```

## Maker rebate (close-out discount)

During the **closing-only window** (`now >= closing_only_at`), trades that net-reduce the
outstanding float (close-outs) receive a discounted protocol fee:

```
effective_protocol_fee = protocol_fee · (10000 − maker_rebate_bps) / 10000
```

The default `maker_rebate_bps` is **2500 (25%)**, so the effective protocol fee on close-outs
is 0.75% × (1 − 0.25) = **0.5625%**. The creator fee is **never** discounted. The discount
only reduces the protocol slice, so the vault backing invariant is untouched.

## Where fees go

- **Protocol fee** → `Treasury<T>` (`deposit_fee`), withdrawable by admin.
- **Creator fee** → transferred directly to `market.creator` at trade time. It never touches
  the treasury.
- **Bond** (disputes) → held in a separate `Balance<T>` inside `ResolutionState`, settled on
  finalization (correct disputants repaid; frivolous bonds forfeited to treasury).

## Changing fees

`protocol_fee_bps`, `creator_fee_bps`, `dispute_bond_bps`, and `maker_rebate_bps` live in
the `Governance` shared object. The protocol and creator fees are **fixed** (only `75` and
`25` are accepted respectively) and cannot be changed. `dispute_bond_bps` and
`maker_rebate_bps` remain admin-adjustable via `set_param` or a DAO proposal. Because markets
**snapshot** these values at creation, a global change only affects **newly created** markets.

See [Governance](governance.md) and [Treasury](treasury.md) for the mechanics.
