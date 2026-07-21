# Auditing the Contracts

A practical map for **security researchers** auditing the `oddszero` Move package. Where to
look, what to verify, and known historical fixes baked into the code.

## File-by-file audit checklist

| File | What to verify |
| --- | --- |
| `prediction_market.move` | `compute_buy`/`compute_sell` fee math; `buy_shares` closing-only gate; `redeem_shares` parimutuel pro-rata payout; `finalize_resolution` seed refund + outcome constraints; `reclaim_abandoned_seed` 30-day gate + idempotency; dispute settlement loop. |
| `amm_pool.move` | `buy_cost`/`sell_return` quadratic root & overflow guards; `apply_buy`/`apply_sell` underflow cases (favorite buy); `add_liquidity`/`remove_liquidity` collateral vs `min_reserve` basis. |
| `share_token.move` | `apply_buy`/`apply_sell` mirror pool; `burn_winning` only post-resolution; the documented note that a ledger-only invariant check would falsely abort. |
| `coin_wrapper.move` | `deposit`/`withdraw` balance checks; no way to inflate `value`. |
| `oracle_integration.move` | `propose` timing; `raise_dispute` bond & `MAX_DISPUTES`; `finalize` consensus binding; `split_bond`/`drain_bond` balance safety. |
| `admin.move` | `is_admin`/`is_oracle` checks; `AdminCap` non-copyable/non-drop. |
| `governance.move` | `set_param` admin check; `vote` weight bound; `apply_param` bounds; proposal quorum/threshold; `price_closing_only_window_ms` / `max_settlement_delay_ms` params. |
| `treasury.move` | `withdraw` admin + balance check; fee routing. |
| `lp_incentives.move` | index accrual; `claim` vault-balance bound; underfunded remainder handling. |
| `price_oracle.move` | `derive_outcome` feed/freshness/confidence checks; `reference_price` baseline; `verified_reading` on-chain Pyth attestation; `push_threshold_bps` tie handling. |
| `order_book.move` | `cancel_order` unfilled-only refund; `fill_pair` escrow move; `crosses` price-time. |
| `errors.move` | stable codes 1–34; no reuse. |
| `utils.move` | `safe_*` / `mul_div` overflow/divide-by-zero. |

## Historical fixes to confirm are present

These are concrete bugs the code comments reference as fixed — verify they remain fixed:

1. **Unbacked governance voting** — `governance::vote` previously accepted arbitrary `weight`.
   Now requires a held `GovernanceShare` with `weight ≤ share.amount ≤ gov_share_supply`.
2. **Cap-only param changes** — `governance::set_param` previously checked only `AdminCap`
   possession. Now `assert_admin` checks the registered admin address.
3. **Phantom complete-set minting (1:1 redemption bug)** — trades previously could mint a
   phantom complete set, breaking redemption. Now `apply_buy`/`apply_sell` mirror the pool
   reserves and the trader's own shares are tracked in `Position`, with no phantom set.
4. **LP factor-n bias** — liquidity math previously used `total_reserves` (n× collateral),
   draining LPs. Now uses real `collateral` with `min(collateral, min_reserve)` basis.
5. **Corrupt-oracle + colluder-dispute** — a regular oracle could honor a single dispute to
   lock a false outcome. Now disputed markets escalate to admin, with bounded outcome choice.
6. **Unread `min_resolution_delay_ms`** — resolution previously ignored it. Now enforced in
   `resolve_market`.
7. **Frontend `:443` / dead fullnode** — `constants.ts` normalizes malformed GraphQL/fullnode
   URLs so balance reads never silently break.

## Invariant test ideas

- Buy then sell the same amount near 1:1 → vault should net ~fee only.
- Mint a complete set via `add_liquidity` then `remove_liquidity` → value-neutral round trip
  (no factor-n loss).
- After resolution, sum of winning shares across users × pool / total_winning_shares ==
  `win_refund_pool` (parimutuel payout cap).
- Seed refund: after `finalize_resolution`, creator's `seed_vault` is 0 and creator received
  full 10,000.
- Push market: both Up and Down holders receive pro-rata payout from `push_refund_pool`.
- Raise disputes with conflicting claims → admin finalize constrained; bonds settled correctly.
- Attempt `redeem_shares` twice → second aborts with `EAlreadyRedeemed`.
- Price market with a stale/wide-confidence reading → `derive_outcome` aborts.
- `reclaim_abandoned_seed` after 30 days → seed refunded, residual swept, market marked
  ABANDONED. Calling again is a no-op.

## Fuzzing surface

Entry points take user-controlled `payment`, `outcome`, `shares`, `min_shares`, `bond`,
`price_bps`, `claimed_outcome`. Boundary conditions to fuzz: `outcome == n`, `shares == 0`,
`payment` so small `set` rounds to 0, `now` exactly at `dispute_deadline`, `bond` just below
`required_bond`, `lp_shares` exceeding supply.

## Tools

- `sui move test` with `--coverage` to confirm branch coverage of guards.
- `sui move lint` for Move lint warnings.
- Manual review of `errors::all_codes()` for completeness vs. `assert!` sites.
