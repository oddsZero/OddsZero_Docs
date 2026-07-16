# Deployment

How to build, test, and publish the OddsZero Move contracts, and how the frontend is
configured for a network.

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) toolchain
  `1.74.1` or compatible.
- An active Sui environment and a funded address.
- Node.js 18+ for the frontend.

## Build & test

```bash
cd sui-predict/contracts

# Build the package
sui move build

# Run the full test suite
sui move test

# Coverage
sui move test --coverage
sui move coverage report

# Lint
sui move lint
```

The test suite (`contracts/tests/`) covers market creation, trading (AMM), resolution,
disputes, the new features, and the order book.

## Publish

```bash
# Point at the target network
sui client switch --env testnet

# Publish (gas budget example)
sui client publish --gas-budget 100000000
```

The current testnet deployment:

```
published-at = 0x37573a1060e150e2cbc48ea310e1a05b859dd18541344ffe1c2e304fee702916
```

Record the new `published-at` in `Published.toml`. After publishing, the protocol shared
objects must be initialized once (admin): `create_treasury`, `create_vault` (incentives),
and treasury funded. Capture their object ids.

## Configure the frontend

Copy `.env.example` to `.env.local` and set:

```
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_REGISTRY_ID=0x...
NEXT_PUBLIC_ADMIN_REGISTRY_ID=0x...
NEXT_PUBLIC_GOVERNANCE_ID=0x...
NEXT_PUBLIC_TREASURY_ID=0x...
NEXT_PUBLIC_INCENTIVE_VAULT_ID=0x...
NEXT_PUBLIC_USDC_TYPE=0x...::usdc::USDC
NEXT_PUBLIC_SUI_GRAPHQL_URL=https://sui-testnet.mystenlabs.com/graphql
NEXT_PUBLIC_API_URL=https://your-indexer/graphql
NEXT_PUBLIC_ADMIN_HOST=admin.oddzero.com
```

Then `npm install && npm run build && npm start` (see [Developer Guide](developers.md)).

## Upgrade notes

The package uses Sui's standard upgrade capability (`Published.toml` records it). On upgrade,
shared object ids are stable; only the package id changes for new calls. Re-point
`NEXT_PUBLIC_PACKAGE_ID` after an upgrade.

## Example fixtures

`contracts/examples/test_markets.json` contains sample markets (FOMC rate cut, BTC year-end,
US election, championship final, box-office gross) with `creator_fee_bps`,
`initial_liquidity`, and `ends_at_offset_ms` — useful for seeding a test deployment.
