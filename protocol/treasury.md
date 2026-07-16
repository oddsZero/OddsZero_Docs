# Treasury

The `Treasury<T>` holds accumulated **protocol fees** (and forfeited dispute bonds) per
collateral type. It is a shared object created once per coin type by the admin.

## What goes in

- The protocol-fee slice of every trade (`route_fees` → `treasury.deposit_fee`).
- Forfeited dispute bonds after finalization (`oracle_integration::drain_bond` →
  `treasury.deposit_fee`).

## What does NOT go in

- **Creator fees** are paid directly to the market creator at trade time.
- **Referral fees** are paid to the referrer.
- **Collateral vault** funds (share backing) are never touched by the treasury.
- **LP incentive rewards** live in a separate `IncentiveVault<T>`.

## Operations

- `create_treasury<T>(registry)` — admin-only, creates the shared treasury.
- `deposit_fee(fee)` — called internally by trading functions.
- `withdraw<T>(amount, registry, cap)` — admin-only; transfers `amount` to the admin.
- View helpers: `balance`, `total_collected`, `total_withdrawn`.

## Analytics

The treasury tracks `total_collected` and `total_withdrawn` so the community can audit how
much protocol revenue has been earned and swept.
