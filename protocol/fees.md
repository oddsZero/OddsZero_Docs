# Fees

OddsZero takes fees on every trade. Fees are **never** added to the collateral vault, so
share backing is never diluted. This page covers every fee type, how it is computed, and
where it goes.

## Fee types

All fees are expressed in **basis points** (bps); `10000 bps = 100%`.

| Fee | Default (testnet) | Bound | Paid to | Snapshot |
| --- | --- | --- | --- | --- |
| `protocol_fee_bps` | 100 (1.00%) | ≤ 1000 (10%) | Treasury | At market creation |
| `creator_fee_bps` | set by creator | ≤ `max_creator_fee_bps` (300 = 3.00%) | Market creator | At market creation |
| `referral_fee_bps` | 50 (0.50%) | ≤ 500 (5%) | Referrer | At market creation |
| `dispute_bond_bps` | 100 (1.00%) | ≤ 1000 | Bond (returned/forfeited) | At market creation |
| `maker_rebate_bps` | 5000 (50%) | ≤ 10000 | (discount, not a fee) | At market creation |

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

The remaining `payment − set` is paid to the creator as their fee slice (after protocol/referral
extraction). The `set` portion is deposited into the collateral vault and priced by the AMM.

## How a sell is split

```
c            = sell_return(pool, outcome, shares)   // gross return
protocol_fee = c · protocol_fee_bps / 10000
creator_fee  = c · creator_fee_bps / 10000
payout       = c − protocol_fee − creator_fee        // returned to seller
```

## Referral fee

The protocol fee slice is further split:

```
ref_fee = protocol_fee · referral_fee_bps / 10000   // sent to referrer
remaining protocol_fee − ref_fee                      // sent to treasury
```

Referral is only active when `governance::referrals_enabled` is true **and** the creator
supplied a `referrer` that is not themselves at creation time. The frontend `constants.ts`
notes referral fees are currently disabled in the app default (`creator earns only
protocolFee + creatorFee`); the contract still supports them.

## Maker rebate (close-out discount)

During the **closing-only window** (`now >= closing_only_at`), trades that net-reduce the
outstanding float (close-outs) receive a discounted protocol fee:

```
effective_protocol_fee = protocol_fee · (10000 − maker_rebate_bps) / 10000
```

The creator fee is **never** discounted. The discount only reduces the protocol slice, so
the vault backing invariant is untouched.

## Where fees go

- **Protocol fee** (minus referral portion) → `Treasury<T>` (`deposit_fee`), withdrawable by
  admin.
- **Creator fee** → transferred directly to `market.creator` at trade time. It never touches
  the treasury.
- **Referral fee** → transferred to `market.referrer`.
- **Bond** (disputes) → held in a separate `Balance<T>` inside `ResolutionState`, settled on
  finalization (correct disputants repaid; frivolous bonds forfeited to treasury).

## Changing fees

`protocol_fee_bps`, `max_creator_fee_bps`, `referral_fee_bps`, `dispute_bond_bps`, and
`maker_rebate_bps` live in the `Governance` shared object and are updated by admin or via DAO
proposal. Because markets **snapshot** these values at creation, a global change only
affects **newly created** markets.

See [Governance](governance.md) and [Treasury](treasury.md) for the mechanics.
