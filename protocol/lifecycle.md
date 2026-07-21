# Market Lifecycle

A market progresses through a fixed set of statuses. Each status gates which operations are
allowed. The status codes are stable and shared between the contract (`STATUS_*` constants)
and the frontend (`MARKET_STATUS` in `lib/constants.ts`).

## Status table

| Code | Constant | Name | Meaning | Allowed operations |
| --- | --- | --- | --- | --- |
| `0` | `STATUS_OPEN` | Open | Created, pending activation | (markets go straight to TRADING on creation) |
| `1` | `STATUS_TRADING` | Trading | Open for trading & liquidity | `buy_shares`, `sell_shares`, `add_liquidity`, `remove_liquidity`, `resolve_market*`, `create_book` |
| `2` | `STATUS_RESOLVING` | Resolving | Oracle proposed an outcome; dispute window open | `raise_dispute`, `finalize_resolution` |
| `3` | `STATUS_RESOLVED` | Resolved | Outcome finalized | `redeem_shares` |
| `4` | `STATUS_DISPUTED` | Disputed | An active dispute is pending review | `raise_dispute` (re-extends window), `finalize_resolution` |
| `5` | `STATUS_ABANDONED` | Abandoned | Never resolved past 30-day grace window | `reclaim_abandoned_seed` (any caller) |

## Lifecycle steps

### 1. Create
A market is created with `≥ 2` outcomes and an initial liquidity seed of **exactly
10,000 USDC** (`FIXED_INITIAL_LIQUIDITY`). Any other amount is rejected with
`EInvalidParam`. It is created directly in `STATUS_TRADING`. The creator may pass a
`creator_fee_bps` value, but it is **ignored** — the creator fee is fixed at 0.25% (25 bps)
— and may optionally pass a `referrer` address, which is also **ignored** (referral fees have
been removed). The seed liquidity is **ring-fenced** in `seed_vault` and becomes the creator's
own recoverable position; it is **never** usable as AMM counterparty capital.

### 2. Trade
While `TRADING`, collateral enters and complete sets are minted; the AMM prices shares.
See [AMM & Pricing Math](amm.md) and [Fees](fees.md). A **closing-only window** opens
`closing_only_window_ms` before `ends_at`: opening new positions is disallowed; only
position-reducing (close-out) trades are permitted.

### 3. Resolve
A registered oracle `resolve_market` (or `resolve_market_price` for price-backed markets)
proposes a winning outcome. This requires `now >= ends_at + min_resolution_delay_ms`, and
the resolver must not be the market creator (self-deal prevention). The market moves to
`STATUS_RESOLVING` and a dispute window (`dispute_window_ms`) opens.

### 4. Dispute (optional)
Anyone (except the oracle and the creator) may `raise_dispute` by posting a bond of at least
`bond_for_collateral(collateral, dispute_bond_bps)`. Every dispute re-extends the window.
The window cannot be re-extended indefinitely: at most `MAX_DISPUTES = 10` disputes per
market (DoS protection).

### 5. Finalize
After the window closes (`now > dispute_deadline`), `finalize_resolution` locks the winning
outcome and settles bonds. If disputes exist, only the protocol **admin** may finalize
(escalation), and the chosen outcome is constrained (see [Disputes](disputes.md)). The
market moves to `STATUS_RESOLVED`.

### 6. Redeem
Only winning shares are redeemable. Non-winning shares are worthless. Redemption is
**parimutuel pro-rata**: winners split the `win_refund_pool` (trader-staked collateral
remaining after the creator's seed is refunded) pro-rata by winning-share weight:
`payout = floor(your_shares × win_refund_pool / total_winning_shares)`. Each user's winning
balance is zeroed after redemption (double-redeem protection). On a **Push** (price-market
tie), both Up and Down holders are refunded pro-rata from `push_refund_pool`.

### 7. Abandoned-market recovery (fallback)
If a market is **never resolved** (oracle goes silent, stuck in TRADING / RESOLVING /
DISPUTED), any caller may recover the creator's full seed after `ends_at + 30 days` via
`reclaim_abandoned_seed`. The market is marked `STATUS_ABANDONED`, the seed is refunded
(idempotent via `seed_refunded`), and any residual trader collateral is swept to the
treasury. **In every case — normal close, Push, or abandoned — the creator's seed comes back
100%.**

## Timeline diagram

```
create ────────────────── ends_at ── min_resolution_delay ── propose ──┐
   │                                                              │     │ dispute window
   │  TRADING (closing-only near end)                             │     │ (re-extends per
   │                                                              │     │  dispute, max 10)
   └──────────────────────────────────────────────────────────────┘     │
                                                              RESOLVING ◄┘
                                                                  │
                                                          window closed
                                                                  │
                                                              RESOLVED ──► redeem 1:1
```

## `closing_only_at`

`closing_only_at = ends_at - closing_only_window_ms` (or `ends_at` if the window exceeds the
market's lifetime). After this timestamp:

- `buy_shares` is allowed **only** if it does **not** increase the caller's net exposure to
  that outcome (a true close-out).
- `sell_shares` is always allowed (it is inherently position-reducing).
- Close-out trades receive a **maker-rebate-discounted** protocol fee: the effective protocol
  fee is `protocol_fee_bps × (10000 − maker_rebate_bps) / 10000`. With the default
  `maker_rebate_bps = 2500 (25%)`, the effective fee is 0.5625% (56.25 bps) on close-outs.

This protects late entrants from oracle/resolution risk right before settlement.
