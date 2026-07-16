# Disputes

Disputes are OddsZero's economic-security mechanism against incorrect or malicious
resolutions. This page covers the lifecycle, bond math, consensus rules, and escalation.

## Raising a dispute (`raise_dispute`)

Anyone **except** the resolving oracle and the market creator may dispute a proposed
outcome. Requirements:

- Market status is `RESOLVING` or `DISPUTED`.
- `now <= dispute_deadline` (the window is still open).
- A bond of at least `required_bond = bond_for_collateral(collateral, dispute_bond_bps)` is
  posted. Posting 1 wei is rejected (`EInsufficientBond`).
- At most `MAX_DISPUTES = 10` disputes per market (prevents perpetual re-extension / griefing).

The bond is held in a **separate** `Balance<T>` inside `ResolutionState` (never the share
vault). Raising a dispute sets status to `DISPUTED` and re-extends `dispute_deadline` by
`dispute_window_ms`.

A dispute may optionally name a `claimed_outcome` (the outcome the disputant asserts is
correct). A generic disagreement can omit it.

## Dispute consensus

`dispute_consensus(state)` returns `Some(outcome)` only if **every** dispute that makes a
claim agrees on the same outcome. If claims conflict or no claims exist, it returns `None`.

## Finalization rules (`finalize_resolution`)

| Situation | Who may finalize | Outcome constraint |
| --- | --- | --- |
| No disputes | Oracle or admin | Any valid outcome |
| Disputes, consensus exists, non-admin finalizer | Oracle (or admin) | Must equal the consensus outcome |
| Disputes, no consensus, **admin** finalizer | **Admin only** | Must be the oracle's proposed outcome **or** an outcome some disputant claimed |
| Disputes exist at all | **Admin only** (escalation) | As above |

This escalation removes the "corrupt oracle + colluding dispute" attack: once any dispute
exists, a regular oracle cannot unilaterally lock in a result — only the highest authority
(admin) can, and even then the admin's choice is bounded so they cannot arbitrarily confiscate
every disputant's bond to the treasury.

## Bond settlement

After finalization, each dispute is settled:

- If `claimed_outcome == final_outcome` (correct) and `bond > 0`, the bond is repaid to the
  disputant (clamped to the remaining bond balance; the stored bond is zeroed after payment so
  it can never be paid twice).
- Otherwise the bond is forfeited.

Any remaining bond balance after all settlements is drained to the **treasury**.

## Economic intuition

The bond must be a meaningful fraction (`dispute_bond_bps`, default 1%) of the market's
collateral. Disputing is therefore expensive. An honest disputant who is correct recovers
their bond (and prevents a wrong payout). A frivolous disputant loses their bond. This makes
attacking resolution costly while keeping legitimate challenges viable.

## Events

- `DisputeRaised { market_id, disputant, bond, timestamp }`
- `DisputeResolved { market_id, upheld, new_winning_outcome }`
