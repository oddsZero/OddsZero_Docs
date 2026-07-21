# Price-Backed Markets

OddsZero supports short-expiry binary markets (e.g. "Will BTC be UP in 15m / 30m?") that
resolve **automatically** against a real asset price at expiry — no human opinion involved.
This is implemented by `price_oracle.move` and the `create_price_market` entry point.

## How it works

1. **Creation** (`create_price_market`): the creator supplies a `feed_id` (e.g. a Pyth
   BTC/USD feed id) and the `reference_price` (asset price at creation). The three outcomes
   are fixed to `["Up", "Down", "Push"]` (index 0 = Up, index 1 = Down, index 2 = Push).
   `expiry_minutes` selects a preset:
   - `15` minutes → dispute window `120_000 ms` (2 min), max drift `60_000 ms` (1 min).
   - `30` minutes → dispute window `300_000 ms` (5 min), max drift `60_000 ms` (1 min).

   The market carries a `PriceFeedConfig` so the keeper can resolve it later. The `Push`
   outcome triggers when the settlement price is within `push_threshold_bps` (default 0.25%)
   of the reference price; the market is voided and both Up and Down holders are refunded
   pro-rata from the collateral snapshot at finalize.

2. **Expiry**: `ends_at = now + expiry_minutes · 60_000`.

3. **Resolution** (`auto_resolve_price_market`): the canonical, permissionless path. Anyone
   can invoke with a genuine `PriceInfoObject` from Pyth. The contract performs **on-chain
   attestation** via `price_oracle::verified_reading` (feed id match, freshness check,
   confidence band, non-negative price). The outcome is derived on-chain:

   ```
   |settlement_price − reference_price| > push_threshold_bps  → Up   or Down
   |settlement_price − reference_price| ≤ push_threshold_bps  → Push  (void, pro-rata refund)
   ```

   > **Deprecated:** `resolve_market_price` is kept for backward compatibility but
   `auto_resolve_price_market` is the canonical permissionless path.

## Why it matters

- **No oracle bias**: the outcome is a pure function of real price data at the exact expiry.
- **Fast settlement**: short dispute windows mean the market finalizes within minutes, not
  days.
- **Auditability**: `PriceFeedConfigured` and `PriceResolved` events record the feed,
  reference price, settlement price, and publish time for anyone to verify.

## Constraints

- Only price-backed markets may be resolved via `auto_resolve_price_market` / `resolve_market_price`
  (the market must have a `price_config`).
- The resolver must still be a registered oracle and must not be the market creator.
- The category is forced to `"Crypto"` for these markets.
- Price markets use a 2-second `max_settlement_drift_ms` and short dispute windows
  (120s for 15m / 300s for 30m presets).

## Event schemas

- `PriceFeedConfigured { market_id, feed_id, reference_price, up_index, down_index, push_index, auto_resolve }`
- `PriceResolved { market_id, settlement_price, reference_price, winning_outcome, publish_time }`
- `CreatorSeedRefunded { market_id, creator, amount }` — emitted when the creator's seed is
  refunded at finalize or via `reclaim_abandoned_seed`.
