# Events Reference

Every on-chain event is defined in `contracts/sources/events.move` and emitted via a typed
`emit_*` wrapper (Sui requires the event struct to live in the emitting module). All event
structs have `copy, drop` abilities. `T` is the phantom collateral coin type.

## Market lifecycle events

| Event | Emitted by | Fields |
| --- | --- | --- |
| `MarketCreated<T>` | `create_market` / `create_price_market` | `market_id, creator, question, outcomes, category, ends_at, creator_fee_bps` |
| `MarketResolved<T>` | `resolve_market` / `resolve_market_price` | `market_id, winning_outcome, resolver, timestamp` |
| `DisputeRaised<T>` | `raise_dispute` | `market_id, disputant, bond, timestamp` |
| `DisputeResolved<T>` | `finalize_resolution` | `market_id, upheld, new_winning_outcome: Option<u64>` |
| `SharesRedeemed<T>` | `redeem_shares` | `market_id, redeemer, collateral` |
| `CreatorSeedRefunded<T>` | `refund_creator_seed` / `reclaim_abandoned_seed` | `market_id, creator, amount` |

## Trading events

| Event | Emitted by | Fields |
| --- | --- | --- |
| `SharesBought<T>` | `buy_shares` | `market_id, trader, outcome, shares, collateral, price` |
| `SharesSold<T>` | `sell_shares` | `market_id, trader, outcome, shares, collateral, price` |
| `LiquidityAdded<T>` | `add_liquidity` | `market_id, provider, lp_shares, collateral` |
| `LiquidityRemoved<T>` | `remove_liquidity` | `market_id, provider, lp_shares, collateral` |
| `FeesCollected<T>` | `route_fees` | `market_id, protocol_fee, creator_fee` |

## Governance / treasury events

| Event | Emitted by | Fields |
| --- | --- | --- |
| `ParamsUpdated` | `governance::set_param` | `admin, protocol_fee_bps, dispute_window_ms, dispute_bond_bps` |
| `TreasuryCreated<T>` | `treasury::create_treasury` | `creator` |
| `TreasuryWithdrawn<T>` | `treasury::withdraw` | `to, amount` |

## Order book (CLOB) events

| Event | Emitted by | Fields |
| --- | --- | --- |
| `OrderPlaced<T>` | `place_buy_order` / `place_sell_order` | `market_id, order_id, owner, is_buy, outcome, price_bps, shares` |
| `OrderFilled<T>` | `fill_pair` | `market_id, taker_id, maker_id, outcome, shares, price_bps` |
| `OrderCancelled<T>` | `cancel_order` | `market_id, order_id, owner, refund` |

## LP incentive events

| Event | Emitted by | Fields |
| --- | --- | --- |
| `IncentiveFunded<T>` | `create_vault` / `fund_vault` | `funder, amount` |
| `IncentiveWithdrawn<T>` | `withdraw_vault` | `to, amount` |
| `IncentiveClaimed<T>` | `claim` | `claimer, amount` |
| `IncentivesConfigured<T>` | `configure_incentives` | `market_id, enabled, rate_per_sec, admin` |

## Price-backed market events

| Event | Emitted by | Fields |
| --- | --- | --- |
| `PriceFeedConfigured` | `price_oracle::configure` | `market_id, feed_id, reference_price, up_index, down_index, auto_resolve` |
| `PriceResolved` | (resolution flow) | `market_id, settlement_price, reference_price, winning_outcome, publish_time` |

## Using events

Events are the primary signal for the backend indexer (`app/api/graphql`, `lib/graphql-client`)
and for the portfolio/PnL computation in `lib/pnl.ts`. Subscribe via Sui GraphQL
`events` queries filtered by `package` + `eventModule` + `eventType`.
