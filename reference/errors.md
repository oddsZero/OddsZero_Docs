# Error Codes

All error codes are declared once in `contracts/sources/errors.move` and reused across
modules, so they are stable and discoverable. Codes `1–33` are currently assigned.

| Code | Name | Meaning | Common trigger |
| --- | --- | --- | --- |
| 1 | `ENotAuthorized` | Caller lacks required authority | Non-admin calls admin-only fn |
| 2 | `EMarketNotFound` | Market/object does not exist | Bad id in `ProposalRegistry` lookup |
| 3 | `EInvalidMarketState` | Market not in required status | Trade on a resolved market |
| 4 | `EInvalidOutcome` | Outcome index out of bounds | `outcome >= n` |
| 5 | `EInsufficientBalance` | Insufficient collateral/balance | Sell more than held; withdraw too much |
| 6 | `EInvariantViolated` | Share backing invariant broken | Burn would underflow a reserve |
| 7 | `EInvalidLiquidity` | Liquidity op would leave pool invalid | `lp_shares` yields 0 out; `min_lp` not met |
| 8 | `EAlreadyResolved` | Market already resolved | Re-propose/finalize |
| 9 | `ENotResolved` | Market not yet resolved | Redeem before resolution |
| 10 | `EInvalidOracleOutcome` | Oracle outcome invalid | `outcome >= n`; bad feed id in price resolve |
| 11 | `EDisputeWindowClosed` | Dispute raised after window | `now > dispute_deadline` |
| 12 | `EInsufficientBond` | Dispute bond too small | `bond < required_bond` |
| 13 | `EAlreadyRedeemed` | Double redemption attempt | Winning balance already 0 |
| 14 | `EInvalidFee` | Fee param out of bounds | `protocol_fee_bps != 75`; out-of-range `dispute_bond_bps` / `maker_rebate_bps` |
| 15 | `EMathOverflow` | Math overflow in AMM/util | Extreme reserves; divide by zero |
| 16 | `EMissingCapability` | Missing admin capability | Admin registry mismatch |
| 17 | `EZeroAmount` | Amount must be > 0 | 0 payment / 0 liquidity |
| 18 | `EInvalidTimestamp` | Clock timestamp invalid for op | `ends_at <= now`; dispute window out of range |
| 19 | `ENotOracle` | Only oracle may do this | Non-oracle calls `resolve_market` |
| 20 | `EQuorumNotMet` | Governance quorum/threshold not met | Proposal fails; bad vote weight |
| 21 | `EAlreadyDisputed` | Already disputed | Window re-extend handled in module |
| 22 | `EInvalidReferral` | Referral code invalid | Referrer argument ignored |
| 23 | `EOrderBookDisabled` | Order book disabled for market | CLOB not enabled |
| 24 | `EInvalidDisputant` | Oracle/creator self-dealing | Oracle or creator raises dispute / resolves own market |
| 25 | `EClosingOnly` | Closing-only window active | Buy would open new position near expiry |
| 26 | `EInvalidCloseOut` | Trade would open new exposure | Closing-only buy exceeds held balance |
| 27 | `EIncentivesDisabled` | LP incentives not enabled | Claim when stream disabled |
| 28 | `EIncentiveNotAccrued` | No reward accrued | Claim with 0 debt |
| 29 | `EBondTooLarge` | Dispute bond exceeds cap | `bond > required_bond × 100` |
| 30 | `EUnverifiedPrice` | Price reading not attested on-chain | `resolve_market_price` with unverified Pyth reading |
| 31 | `EPriceResolutionDisabled` | Price resolution disabled | Creating/using price market before Pyth wiring |
| 32 | `EInvalidFeedId` | Malformed / non-allowlisted Pyth feed | `feed_id` ≠ 32 bytes or not on allowlist |
| 33 | `EInvalidParam` | Wrong seed amount (must be exactly 10,000) or other bad argument | `set_param` / `propose` / `create_market` with invalid value |
| 34 | `EAlreadyVoted` | Governance share already voted on this proposal | Switching sides or double-voting |

## Helper accessors

Each code has a `public fun` returning it (e.g. `errors::not_authorized()`), used by
`assert!` sites. `errors::all_codes()` (test-only) returns the full vector for completeness
checks.
