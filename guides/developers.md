# Developer Guide

This guide is for developers integrating with or building on OddsZero: reading on-chain
state, submitting transactions, running the frontend, and understanding the contract ↔
frontend mapping.

## Repository layout

```
sui-predict/
├── contracts/               # Move package `oddszero`
│   ├── Move.toml
│   ├── Published.toml       # per-network published ids
│   ├── sources/             # 14 modules (see Architecture)
│   ├── tests/               # Move unit & scenario tests
│   └── examples/            # test_markets.json fixtures
└── frontend/                # Next.js 14 dApp
    ├── app/                 # routes (markets, trade, create, portfolio, admin, api/graphql)
    ├── components/          # UI + forms
    ├── hooks/               # useSuiWallet, useMarketData, useTradeExecution, ...
    ├── lib/                 # constants, types, pnl, sui-sdk, graphql-client
    └── providers/           # SuiProvider (wallet + client)
```

## Key frontend constants (`lib/constants.ts`)

| Constant | Purpose |
| --- | --- |
| `PACKAGE_ID` | `NEXT_PUBLIC_PACKAGE_ID` — published `oddszero` package |
| `REGISTRY_ID` | `NEXT_PUBLIC_REGISTRY_ID` — `MarketRegistry` shared object |
| `ADMIN_REGISTRY_ID` | `NEXT_PUBLIC_ADMIN_REGISTRY_ID` — `AdminRegistry` |
| `GOVERNANCE_ID` | `NEXT_PUBLIC_GOVERNANCE_ID` — `Governance` |
| `TREASURY_ID` | `NEXT_PUBLIC_TREASURY_ID` — `Treasury<T>` |
| `INCENTIVE_VAULT_ID` | `NEXT_PUBLIC_INCENTIVE_VAULT_ID` — `IncentiveVault<T>` |
| `USDC_TYPE` | `NEXT_PUBLIC_USDC_TYPE` — collateral coin tag |
| `MODULE` | `"prediction_market"` |
| `USDC_DECIMALS` | `6` |
| `MARKET_STATUS` | status codes mirroring `STATUS_*` |

Env is loaded from `.env.local` (see `.env.example`). The same build targets testnet or
mainnet by swapping these values.

## Reading state

The frontend reads chain state two ways:

- **Sui GraphQL** (`SUI_GRAPHQL_URL`) for object/query reads via `@mysten/sui` +
  `graphql-request`.
- **Backend indexer** (`NEXT_PUBLIC_API_URL`, a GraphQL endpoint) for derived views
  (trade ledger, positions, portfolio analytics) — see `lib/graphql-client.ts` and
  `app/api/graphql/route.ts`.

`lib/sui-sdk.ts` wraps Move call construction; `hooks/useMarketData.ts` fetches a market's
reserves, probabilities, positions, and LP supply.

## Submitting a trade (example shape)

A buy calls `prediction_market::buy_shares`:

```
target:  PACKAGE_ID::prediction_market::buy_shares
args:
  - market:   Market<T> object (shared)
  - payment:  Coin<USDC>  (from wallet)
  - outcome:  u64
  - min_shares: u64        (slippage floor)
  - treasury: Treasury<T> shared object
  - clock:   0x6           (Sui Clock)
```

The wallet adapter (`@mysten/dapp-kit`) builds and signs the PTB. `hooks/useTradeExecution.ts`
orchestrates this. Sells, liquidity, and redeem follow the same pattern with their respective
entry functions (see the [Events](reference/events.md) and module list in
[Architecture](concepts/architecture.md)).

## Replicating a quote off-chain

To show a price before a transaction, replicate `amm_pool` math:

1. Read `reserves` (via `prediction_market::reserve`) and `n`.
2. For a buy of `shares` on `outcome`: compute `set = buy_cost(...)` then
   `probability_bps = reserve[outcome]·10000 / total_reserves`.
3. For a payment `P`: use `shares_for_cost(pool, outcome, set)` where
   `set = P·10000/(10000 + protocol_fee_bps + creator_fee_bps)`.

The full formulas are in [AMM & Pricing Math](amm.md).

## Frontend scripts

```bash
cd sui-predict/frontend
cp .env.example .env.local     # fill in deployed object ids
npm install
npm run dev                    # local dev server
npm run build && npm start     # production
npm run lint
npm run typecheck
```

## Contract ↔ frontend mapping

| Frontend concern | Contract entry |
| --- | --- |
| List markets | `MarketRegistry` (`market_ids`, `by_category`) |
| Market page | `prediction_market` view fns (`reserve`, `probability_bps`, `volume`, …) |
| Trade | `buy_shares` / `sell_shares` |
| Liquidity | `add_liquidity` / `remove_liquidity` / `claim_incentives` |
| Create market | `create_market` / `create_price_market` |
| Redeem | `redeem_shares` |
| Resolve / dispute | `resolve_market` / `raise_dispute` / `finalize_resolution` |
| Portfolio PnL | `lib/pnl.ts` from indexed trades + `get_position` |

## Types

`lib/types.ts` defines `Market`, `Position`, `Trade`, `PortfolioAnalytics`,
`PositionView`, etc. These mirror the on-chain view shapes and the indexer's GraphQL schema.

## Admin console

The same app serves `/admin/*` (host-gated by `ADMIN_HOST`). Features: oracle registry,
governance params, treasury withdrawals, incentive configuration, and settings. Gated by
`app/admin/useAdminAuth.ts`.
