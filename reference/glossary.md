# Glossary

Plain-language definitions of terms used throughout this documentation.

- **AMM** — Automated Market Maker. A smart contract that prices trades algorithmically from
  pooled liquidity instead of an order book.
- **Basis point (bps)** — 1/100th of a percent. 100 bps = 1.00%.
- **Collateral** — The asset (USDC) backing a market's shares. Held in the `Collateral<T>`
  vault.
- **Complete set** — One share of *every* outcome. Minting a complete set is how collateral
  enters the market.
- **CLOB** — Centralized Limit Order Book. The optional `order_book` venue for limit orders.
- **Conditional Token Framework (CTF)** — The design where each outcome is a token and a
  complete set pays out 1:1 on resolution.
- **Creator fee** — Fee paid to the market creator on each trade (`creator_fee_bps`).
- **Dispute** — A bonded challenge to a proposed resolution outcome.
- **Dispute bond** — Collateral posted to raise a dispute; returned if correct, forfeited if not.
- **Dispute window** — Period after a proposal during which disputes may be raised
  (`dispute_window_ms`).
- **Escalation** — When disputes exist, only the admin may finalize (governance `admin` module).
- **Implied probability** — `reserve[outcome] / total_reserves`; the market's price for an outcome.
- **LP (Liquidity Provider)** — A user who deposits collateral into the AMM pool for LP shares.
- **LP shares** — Proportional claim on the pool's collateral and (optionally) incentive rewards.
- **Maker rebate** — Discount on the protocol fee for close-out trades in the closing-only window.
- **Min resolution delay** — Minimum wait after `ends_at` before resolution is allowed.
- **Oracle** — Registered address permitted to propose/finalize outcomes.
- **Outcome** — One possible result of a market (e.g. "Yes", "No", or a candidate).
- **Price-backed market** — Short-expiry binary market resolving automatically against a real
  price (e.g. BTC Up/Down).
- **Protocol fee** — Fee routed to the treasury on each trade (`protocol_fee_bps`).
- **Reference price** — Asset price at creation; baseline for price-backed Up/Down resolution.
- **Redemption** — Exchanging winning shares 1:1 for collateral after resolution.
- **Referral fee** — Optional fee paid to a referrer (`referral_fee_bps`).
- **Reserve** — Pooled shares of an outcome held by the AMM.
- **Share** — A claim on the collateral vault if its outcome wins.
- **Treasury** — Shared object holding protocol fees and forfeited bonds.
- **USDC** — The USDC stablecoin on Sui (6 decimals) used as collateral.
- **Vault** — The `Collateral<T>` balance backing all outstanding shares 1:1.
