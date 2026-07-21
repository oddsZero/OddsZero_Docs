# Order Book (CLOB)

OddsZero also ships an **optional** centralized limit-order-book (CLOB) venue,
`order_book.move`, independent of the AMM. It is a parallel, price-time priority venue for
traders who prefer limit orders over AMM swaps.

> The CLOB is intentionally separate from the AMM. Positions opened on the CLOB are **not**
> auto-reconciled with AMM positions, and resolution/redemption integration is a documented
> future extension. Use it as an independent venue.

## Mechanics

- `create_book<T>(market_id, num_outcomes)` — creates a shared `OrderBook`.
- Each `Order` stores only plain fields (id, owner, side, outcome, `price_bps`, shares,
  filled, `escrow`). All escrowed coins live in a single `escrow_vault: Balance<T>`.
- **Buy order** escrows `shares · price_bps / 10000` (max cost).
- **Sell order** escrows `shares · (10000 − price_bps) / 10000` (short cover).
- `place_buy_order` / `place_sell_order` automatically match against resting opposites
  (price-time priority) via `match_orders`.
- On a fill, collateral moves **logically** from buyer escrow to seller escrow (vault total
  unchanged); the book updates its own `long_positions` / `short_positions` ledgers and
  emits `OrderFilled`.
- `cancel_order` refunds only the **unfilled** portion of the escrow (prevents a fully-filled
  seller from reclaiming collateral the buyer already paid).

## Price-time priority

`crosses(a, b)` requires opposite sides, same outcome, remaining size > 0, and compatible
price (`buy.price_bps ≥ sell.price_bps` or vice versa). Execution price is the **maker's**
(resting order's) price.

## View helpers

- `order_count`, `volume`, `escrow_balance`.
- `best_bid(outcome)`, `best_ask(outcome)`.
- `get_long(owner, outcome)`, `get_short(owner, outcome)`.

## Events

- `OrderPlaced`, `OrderFilled`, `OrderCancelled`.

## Settlement

After the market resolves, the book must be `settle`d (once settled, no new orders).
`settle_positions` computes net P&L from long/short positions using the market's authoritative
winning outcome. For a winning short seller, the full escrow (cover + buyer's cost) is
refunded. On a Push, all positions are settled at 100% (both long and short receive their
escrow back). The book is marked `settled = true` after first settlement; no new orders may
be placed.
