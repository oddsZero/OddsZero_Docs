# Price-Backed Markets

OddsZero supports short-expiry binary markets (e.g. "Will BTC be UP in 15m / 30m?") that
resolve **automatically** against a real asset price at expiry — no human opinion involved.
This is implemented by `price_oracle.move` and the `create_price_market` entry point.

## How it works

1. **Creation** (`create_price_market`): the creator supplies a `feed_id` (e.g. a Pyth
   BTC/USD feed id) and the `reference_price` (asset price at creation). The two outcomes are
   fixed to `["Up", "Down"]` (index 0 = Up, index 1 = Down). `expiry_minutes` selects a preset:
   - `15` minutes → dispute window `120_000 ms` (2 min), max drift `60_000 ms` (1 min).
   - `30` minutes → dispute window `300_000 ms` (5 min), max drift `60_000 ms` (1 min).

   The market carries a `PriceFeedConfig` so the keeper can resolve it later.

2. **Expiry**: `ends_at = now + expiry_minutes · 60_000`.

3. **Resolution** (`resolve_market_price`): the keeper (a registered oracle) supplies a
   `PriceReading` obtained from Pyth's Hermes API for the publication nearest `ends_at`. The
   contract derives the outcome **on-chain**:

   ```
   settlement_price > reference_price  → Up   (up_index)
   settlement_price ≤ reference_price  → Down (down_index)
   ```

   The reading is validated:
   - **Feed integrity**: `reading.feed_id` must equal `config.feed_id`.
   - **Freshness**: `|reading.publish_time − ends_at| ≤ max_settlement_drift_ms`.
   - **Confidence**: `reading.conf ≤ price · max_confidence_bps / 10000`
     (`max_confidence_bps = 250`, i.e. ≤ 2.5%). Rejects illiquid/manipulated feeds.

   Because Pyth prices are signed and timestamped on-chain, the keeper cannot fabricate a
   price for the wrong time.

## Why it matters

- **No oracle bias**: the outcome is a pure function of real price data at the exact expiry.
- **Fast settlement**: short dispute windows mean the market finalizes within minutes, not
  days.
- **Auditability**: `PriceFeedConfigured` and `PriceResolved` events record the feed,
  reference price, settlement price, and publish time for anyone to verify.

## Constraints

- Only price-backed markets may be resolved via `resolve_market_price` (the market must have
  a `price_config`).
- The resolver must still be a registered oracle and must not be the market creator.
- The category is forced to `"Crypto"` and `referral_fee_bps` is 0 for these markets.

## Event schemas

- `PriceFeedConfigured { market_id, feed_id, reference_price, up_index, down_index, auto_resolve }`
- `PriceResolved { market_id, settlement_price, reference_price, winning_outcome, publish_time }`
