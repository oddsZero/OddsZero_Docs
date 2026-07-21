# FAQ

<details class="oz-faq" open>
<summary>What is OddsZero?</summary>

A fully on-chain, multi-outcome prediction market protocol on Sui. You trade shares whose
prices reflect the probability of future events, and redeem winning shares 1:1 for collateral.

</details>

<details class="oz-faq">
<summary>What blockchain is it on?</summary>

Sui (Move language). Testnet package:
`0x37573a1060e150e2cbc48ea310e1a05b859dd18541344ffe1c2e304fee702916`.

</details>

<details class="oz-faq">
<summary>What currency do I trade with?</summary>

USDC (6 decimals) on the active network. SUI is only used for gas.

</details>

<details class="oz-faq">
<summary>Is it custodial?</summary>

No. Your shares and collateral are held in auditable smart contracts you call directly. Only
winning shares are redeemable, 1:1 against the vault.

</details>

<details class="oz-faq">
<summary>How are prices determined?</summary>

By a constant-product AMM over outcome reserves. The implied probability of an outcome is
`reserve[outcome] / total_reserves`. See [AMM & Pricing Math](protocol/amm.md).

</details>

<details class="oz-faq">
<summary>Why are my shares always backed?</summary>

Because every unit of collateral mints one share of *every* outcome (a complete set). At
resolution exactly one outcome wins, so winning shares in circulation always equal the
collateral available for payout. Winners are paid **parimutuel pro-rata** from the
trader-staked collateral; the creator's 10,000 seed is ring-fenced and **always fully
refunded** before winners are paid, so it can never be drawn on. See [Core Concepts](concepts/index.md).

</details>

<details class="oz-faq">
<summary>What are the fees?</summary>

A fixed protocol fee (0.75%) plus a fixed creator fee (0.25%) per trade. Close-out trades
in the closing-only window get a discounted protocol fee (25% maker rebate). Fees never
dilute share backing. Referral fees have been removed. See [Fees](protocol/fees.md).

</details>

<details class="oz-faq">
<summary>Who decides the outcome?</summary>

A registered oracle proposes the outcome after the market ends. Anyone can dispute it by
posting a bond. See [Resolution & Oracles](protocol/resolution.md) and [Disputes](protocol/disputes.md).

</details>

<details class="oz-faq">
<summary>What if the oracle is wrong?</summary>

Raise a dispute during the window by posting a bond. If you're correct, your bond is returned;
if not, it is forfeited to the treasury. Disputed markets escalate to the admin for finalization.

</details>

<details class="oz-faq">
<summary>What are price-backed (BTC Up/Down) markets?</summary>

Short-expiry binary markets that resolve automatically against a real Pyth price at expiry —
no human opinion. "Up" wins if the settlement price exceeds the reference price. See
[Price-Backed Markets](protocol/price-markets.md).

</details>

<details class="oz-faq">
<summary>Can I provide liquidity?</summary>

Yes. Deposit USDC into the AMM pool to earn LP shares and a share of trading fees. You take
inventory risk as prices move. See [LP Incentives](protocol/incentives.md).

</details>

<details class="oz-faq">
<summary>When can I redeem?</summary>

Only after a market is `RESOLVED` and your outcome won. Redeem via the market or Portfolio page.

</details>

<details class="oz-faq">
<summary>What is the closing-only window?</summary>

Shortly before `ends_at`, you can only *reduce* positions (no opening new ones), protecting late
traders from resolution risk. Selling is always allowed.

</details>

<details class="oz-faq">
<summary>Can I create my own market?</summary>

Yes — any wallet can create a market with ≥ 2 outcomes, a category, an end time, and exactly
**10,000 USDC** of initial liquidity (which is ring-fenced and always fully refunded to you).
The creator fee is fixed at 0.25%. See the [User Guide](guides/user-guide.md).

</details>

<details class="oz-faq">
<summary>Is there a DAO?</summary>

There is a lightweight governance layer (`Governance`, `Proposal`, `GovernanceShare`) plus an
admin fast-path. Voting power requires minted governance shares. See [Governance](protocol/governance.md).

</details>

<details class="oz-faq">
<summary>Is the code audited?</summary>

The contracts include extensive invariant protections and documented historical fixes (see
[Auditing the Contracts](security/audit.md)). Always do your own research and audit before
mainnet use. This software is provided as-is.

</details>

<details class="oz-faq">
<summary>Where can I see on-chain activity?</summary>

Use [suiscan.xyz/testnet](https://suiscan.xyz/testnet) with the contract/object ids. Events are
documented in the [Events Reference](reference/events.md).

</details>

<details class="oz-faq">
<summary>How do I build/run it myself?</summary>

See the [Deployment](guides/deployment.md) and [Developer Guide](guides/developers.md).

</details>

<details class="oz-faq">
<summary>I found a bug / vulnerability. What do I do?</summary>

Report it privately to the OddsZero team before any public disclosure. See the
[Security Model](security/model.md).

</details>
