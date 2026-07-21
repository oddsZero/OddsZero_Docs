# Resolution & Oracles

This page explains how an ordinary (human-oracle-resolved) market gets its winning outcome,
and the automated price-backed alternative.

## Roles

- **Oracle** — an address registered in `AdminRegistry.oracles`. Oracles propose and (with
  admin) finalize outcomes.
- **Admin** — the address in `AdminRegistry.admin`, holder of `AdminCap`. The admin can
  register oracles, change governance params, and finalize disputed markets.
- **Creator** — the market's creator. May **not** resolve or dispute their own market.

## Ordinary resolution (`resolve_market`)

1. The market must be `STATUS_TRADING` and `now >= ends_at + min_resolution_delay_ms`.
2. The caller must be a registered oracle **and** must not be the market creator.
3. The oracle calls `resolve_market(market, outcome, ...)`, which runs
   `oracle_integration::propose` and sets `STATUS_RESOLVING`. A dispute window
   (`dispute_window_ms`) opens with `dispute_deadline = now + dispute_window_ms`.

`min_resolution_delay_ms` (default 1 hour) ensures real-world outcome data has time to
become final before anyone can resolve.

## Automated price-backed resolution (`resolve_market_price`)

For short-expiry binary markets (see [Price-Backed Markets](price-markets.md)), a registered
oracle (the keeper) calls `resolve_market_price(market, reading, ...)`. The winning outcome
is derived **entirely on-chain** from a real `PriceReading` compared to the market's
`reference_price`:

```
settlement_price > reference_price  → Up   (up_index)
settlement_price ≤ reference_price  → Down (down_index)
```

The reading must come from the configured feed, be fresh within `max_settlement_drift_ms` of
`ends_at`, and have a confidence band within `max_confidence_bps`. No human opinion is
involved.

## Finalization (`finalize_resolution`)

After the dispute window closes (`now > dispute_deadline`), an oracle or admin calls
`finalize_resolution(market, final_outcome, ...)`:

- If **no disputes**: any oracle/admin may finalize with any valid outcome.
- If **disputes exist**: only the **admin** may finalize (escalation). The chosen outcome is
  constrained by dispute consensus (see [Disputes](disputes.md)).
- The market moves to `STATUS_RESOLVED` and `winning_outcome` is set.
- Dispute bonds are settled (correct disputants repaid from the bond balance; frivolous
  bonds forfeited to the treasury).

## Resolution state

`ResolutionState<T>` tracks:

- `status`: 0 none, 1 proposed, 2 finalized, 3 disputed. (The `Market.status` field also
  includes `STATUS_ABANDONED = 5` for markets that were never resolved.)
- `proposed_outcome`, `final_outcome`.
- `proposed_at`, `dispute_deadline`.
- `bond_balance`: separate `Balance<T>` for dispute bonds (never mixed with the share vault).
- `disputes`: vector of `Dispute` records.

## View helpers

- `resolution_status(market)` → resolution status code.
- `winning_outcome(market)` → `Option<u64>`.
- `oracle_integration::can_finalize(state, clock)` → whether finalization is now permitted.
