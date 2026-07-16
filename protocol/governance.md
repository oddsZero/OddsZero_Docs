# Governance

OddsZero has a lightweight DAO governance layer plus an admin fast-path. All global protocol
parameters live in the `Governance` shared object.

## Parameters

| Param | Index | Default | Bound |
| --- | --- | --- | --- |
| `protocol_fee_bps` | 0 | 100 (1.00%) | ≤ 1000 (10%) |
| `max_creator_fee_bps` | 1 | 300 (3.00%) | ≤ 1000 |
| `dispute_window_ms` | 2 | 172,800,000 (48h) | 1h – 30d |
| `dispute_bond_bps` | 3 | 100 (1.00%) | ≤ 1000 |
| `min_resolution_delay_ms` | 4 | 3,600,000 (1h) | any |
| `referrals_enabled` | 5 | true | bool |
| `referral_fee_bps` | 6 | 50 (0.50%) | ≤ 500 |
| `proposal_quorum_bps` | 7 | 1000 (10%) | ≤ 10000 |
| `proposal_threshold_bps` | 8 | 5000 (50%) | ≤ 10000 |
| `closing_only_window_ms` | 9 | 3,600,000 (1h) | ≤ 30d |
| `maker_rebate_bps` | 10 | 5000 (50%) | ≤ 10000 |

## Admin fast-path (`set_param`)

The admin (holder of `AdminCap` **and** the registered admin address) may change any single
parameter immediately via `set_param`. Possession of `AdminCap` alone is **not** sufficient —
`assert_admin` checks the registered admin address. Out-of-range values are rejected.

## DAO proposal path

1. Admin mints `GovernanceShare` objects to voters via `mint_gov_shares` (voting power only
   exists once shares are minted; the DAO path stays inert until then).
2. A voter with a `GovernanceShare` calls `propose(param, value, deadline)` to open a
   `Proposal`.
3. Voters call `vote(proposal_id, support, share, weight, ...)`. Voting weight must not exceed
   the held share's `amount` **and** the `gov_share_supply` — this fixes a prior bug where
   `vote` accepted arbitrary weight from anyone.
4. After the deadline, `execute_proposal` applies the change only if:
   - `total_votes · 10000 ≥ proposal_quorum_bps · gov_share_supply` (quorum met), and
   - `yes_votes · 10000 ≥ proposal_threshold_bps · total_votes` (majority met).

## Snapshot semantics

Markets snapshot `protocol_fee_bps`, `referral_fee_bps`, `dispute_window_ms`,
`dispute_bond_bps`, and `maker_rebate_bps` **at creation**. Changing a global parameter
therefore only affects markets created afterward — existing markets keep their terms.

## Oracle & admin management (`admin` module)

- `add_oracle` / `remove_oracle` — only admin.
- `set_admin` — transfers admin to a new address (only current admin).
- `is_oracle`, `is_admin`, `oracle_count` — view helpers.

## Events

- `ParamsUpdated { admin, protocol_fee_bps, dispute_window_ms, dispute_bond_bps }`
