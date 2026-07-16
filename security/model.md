# Security Model

This page is the threat model and invariant summary for **security researchers**. It states
what OddsZero guarantees, what it does not, and the known attack classes it defends against.

## Trust assumptions

- **Sui L1** is trusted (correct consensus, no reorgs that break finality used here).
- The **admin** (holder of `AdminCap` + registered admin address) is trusted for protocol
  parameter changes, oracle registration, treasury withdrawals, and incentive funding. If the
  admin key is compromised, protocol parameters can be changed — but **existing markets
  snapshot** fee params at creation, limiting blast radius.
- **Oracles** are trusted to propose correct outcomes, *bounded* by the dispute mechanism and
  admin escalation.
- The **price keeper** is trusted to forward a genuine Pyth reading nearest `ends_at`; the
  contract still validates feed id, freshness, and confidence on-chain.

## Core invariants

1. **1:1 backing.** `Σ_o minted[o] == n · collateral` while trading is open (complete-set
   model). At resolution, winning shares in circulation == collateral in the vault, so
   redemption is always fully collateralized.
2. **Fees never dilute backing.** Fees are taken from the trader's payment and never enter the
   collateral vault. Only the "set cost" portion backs shares.
3. **Ledger mirrors pool.** `ShareLedger` is updated in lockstep with `AMMPool` reserves via
   `apply_buy` / `apply_sell`, so global accounting stays consistent.
4. **Overflow safety.** All arithmetic uses `utils::safe_*` / `mul_div` and aborts with
   `EMathOverflow` rather than silently breaking invariants. AMM math is `u128` with explicit
   overflow guards.
5. **Bond separation.** Dispute bonds live in a separate `Balance<T>` inside `ResolutionState`,
   never mixed with the share-collateral vault.

## Defended attack classes

| Attack | Defense |
| --- | --- |
| **Dilution / under-collateralization** | Complete-set minting + fees routed out of vault; `EInvariantViolated` aborts if a burn would break backing. |
| **Self-dealing oracle** | Resolver must not be the market creator; `min_resolution_delay_ms` forces a wait after `ends_at`. |
| **Corrupt oracle + colluding dispute** | Once any dispute exists, only the **admin** may finalize; admin's choice is bounded by dispute consensus / claimed outcomes. |
| **Admin confiscates bonds** | On conflicting disputes, admin may only pick the proposed outcome or an outcome some disputant claimed. |
| **Free/cheap disputes (griefing)** | Bond must be ≥ `dispute_bond_bps` of collateral; `MAX_DISPUTES = 10` caps window re-extension. |
| **Unbacked governance voting** | `vote` requires a held `GovernanceShare` and `weight ≤ share.amount` and `≤ gov_share_supply`. |
| **Arbitrary param changes by cap holder** | `set_param` checks the **registered admin address**, not just `AdminCap` possession. |
| **Double redemption** | Winning balance is zeroed after `redeem_shares`; `EAlreadyRedeemed` on second attempt. |
| **Double bond payment** | Stored bond zeroed after each payout; payout clamped to remaining balance. |
| **Cancel filled CLOB order to reclaim paid collateral** | `cancel_order` refunds only the **unfilled** portion. |
| **LP over/underpayment (factor-n bias)** | LP math uses **real collateral**, not `total_reserves`; removal bounded by `min(collateral, min_reserve)`. |
| **Manipulated price feed** | `price_oracle` enforces feed id match, freshness drift, and confidence band. |
| **Dust buy routes everything to creator** | Buys that yield 0 shares are rejected (`EInvalidLiquidity`). |
| **Late entrants' oracle risk** | Closing-only window disallows opening new positions near expiry. |

## What is NOT guaranteed

- **Oracle correctness.** The protocol does not verify real-world truth; it verifies process
  (correct proposer, dispute window, bonds, escalation). Disputes are the economic check.
- **LP profit.** LPs carry inventory risk; yields are not guaranteed.
- **CLOB ↔ AMM reconciliation.** The order book is a separate venue; its positions are not
  auto-merged with AMM positions or resolved through the main redemption path (documented
  future work).
- **Frontend correctness.** The dApp is separate from the contracts; always verify on-chain
  state.

## Reporting

Found a vulnerability? Report it privately to the OddsZero team before any public disclosure.
Include a minimal reproduction and the affected module/function. This software is provided
as-is; smart contracts carry inherent risk — audit before mainnet use.
