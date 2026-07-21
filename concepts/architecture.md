# Architecture

The OddsZero protocol is a single Move package named `oddszero` deployed on Sui. It is
composed of small, single-responsibility modules that compose into the core
`prediction_market` module. This page is the map for developers and researchers.

## Module map

| Module | Responsibility | Key objects |
| --- | --- | --- |
| `prediction_market` | Core market object, trading entry points, lifecycle orchestration | `Market<T>`, `MarketRegistry`, `PositionInner` |
| `amm_pool` | Constant-product AMM pricing and liquidity reserves for N outcomes | `AMMPool<T>` |
| `share_token` | CTF-style complete-set share ledger and mint/redeem accounting | `ShareLedger<T>` |
| `coin_wrapper` | Typed `Collateral<T>` wrapper and USDC integration helpers | `Collateral<T>` |
| `oracle_integration` | Oracle propose / dispute / finalize resolution lifecycle | `ResolutionState<T>`, `Dispute` |
| `order_book` | Optional centralized limit-order-book (CLOB) trading venue | `OrderBook<T>`, `Order<T>` |
| `treasury` | Protocol fee collection and distribution per collateral type | `Treasury<T>` |
| `governance` | Global protocol parameters and on-chain DAO voting | `Governance`, `Proposal`, `GovernanceShare` |
| `admin` | Capability-based access control | `AdminCap`, `AdminRegistry` |
| `lp_incentives` | Optional LP reward emissions | `IncentiveVault<T>`, `IncentiveStream<T>` |
| `price_oracle` | Automated price-backed resolution for short-expiry binary markets | `PriceFeedConfig`, `PriceReading` |
| `mock_usdc` | Deployable mock USDC (testnet only) so the publisher can mint test collateral | `Treasury` |
| `events` | Canonical event schemas and typed emit wrappers | (all `*Event` structs) |
| `errors` | Centralized, stable error-code catalog | (error codes 1–33) |
| `utils` | Overflow-safe math and shared helpers | — |

## The `Market<T>` object

Each market is a single **shared object** (type `Market<T>`). It nests everything the market
needs:

- `collateral: Collateral<T>` — the USDC vault (source of all redemption funds).
- `ledger: ShareLedger<T>` — global per-outcome minted totals (mirrors pool reserves).
- `pool: AMMPool<T>` — the AMM reserves and LP supply.
- `resolution: ResolutionState<T>` — oracle proposal, disputes, bonds.
- `positions: Table<address, PositionInner>` — each user's per-outcome share balances.
- `lp_balances: Table<address, u64>` — each LP's LP share balance.
- `incentive_stream: IncentiveStream<T>` — optional LP reward stream.
- `price_config: Option<PriceFeedConfig>` — present only for price-backed markets.
- `price_proposal_reading: Option<PriceReading>` — on-chain Pyth reading captured at
  proposal time for price-market finalization.
- `seed_refunded: bool` — idempotency guard for the creator's seed refund.
- `win_refund_pool: u64` — trader-staked collateral snapshot for parimutuel winner payout.
- `win_refund_shares: u64` — total winning shares snapshot at finalize.
- `push_refund_pool: u64` — collateral snapshot for Push (tie) refunds.
- `push_refund_shares: u64` — total Up+Down shares for Push pro-rata refund.
- `status` can also be `STATUS_ABANDONED = 5` when a market is never resolved and the
  30-day grace window passes; `reclaim_abandoned_seed` marks it abandoned and recovers the
  creator's seed plus sweeps residual collateral to treasury.

Fee parameters (`protocol_fee_bps` [fixed at 75], `creator_fee_bps` [fixed at 25],
`dispute_window_ms`, `dispute_bond_bps`, `maker_rebate_bps`, `closing_only_at`) are
**snapshotted at creation time**, so changing global governance parameters only affects
newly created markets. (Referral fees have been removed; `referrals_enabled` /
`referral_fee_bps` remain in `Governance` but are unused. Additional price-market params
`price_closing_only_window_ms` and `max_settlement_delay_ms` are also snapshotted.)

## Shared protocol objects

These are created once at publish and shared:

- `MarketRegistry` — enumerates all markets (`market_ids`, `by_id`, `by_category`).
- `Governance` — global fee/dispute/governance parameters.
- `ProposalRegistry` — live DAO proposals.
- `AdminRegistry` — admin address + registered oracle list.
- `Treasury<T>` — accumulated protocol fees per collateral type.
- `IncentiveVault<T>` — LP reward tokens per collateral type.

The `AdminCap` is a **non-copyable, non-drop** object transferred to the publisher at init.
Whoever holds it controls the protocol.

## Data flow: a buy

```
user --buy_shares(payment)--> prediction_market
  1. compute_buy(): split payment into set cost + fees
  2. deposit(set) -> Collateral vault
  3. apply_buy() -> AMMPool reserves + ShareLedger
   4. route_fees() -> Treasury (protocol) + creator
  5. credit_position() -> user's PositionInner balances
  6. emit SharesBought
```

## Data flow: resolution and redemption

```
oracle --resolve_market(outcome)--> STATUS_RESOLVING (dispute window opens)
anyone --raise_dispute(bond)------> STATUS_DISPUTED (window re-extends)
oracle/admin --finalize_resolution(outcome)--> STATUS_RESOLVED
   1. refund_creator_seed() ------> full 10,000 seed returned to creator (idempotent)
   2. snapshot_winner_pool() -----> win_refund_pool / win_refund_shares captured
user --redeem_shares()------------> parimutuel pro-rata payout from win_refund_pool
```

## Frontend

The `frontend/` app is a Next.js 14 (App Router) + TypeScript dApp:

- Reads on-chain state via Sui GraphQL and a backend GraphQL indexer.
- Trading via `@mysten/dapp-kit` wallet adapter.
- Portfolio/PnL computed in `lib/pnl.ts` from the indexed trade ledger.
- An `/admin/*` console (host-gated) for oracle, treasury, governance, and settings.

See the [Developer Guide](guides/developers.md) for the full contract ↔ frontend mapping.
