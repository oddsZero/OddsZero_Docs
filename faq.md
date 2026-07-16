# FAQ

**What is OddsZero?**
A fully on-chain, multi-outcome prediction market protocol on Sui. You trade shares whose
prices reflect the probability of future events, and redeem winning shares 1:1 for collateral.

**What blockchain is it on?**
Sui (Move language). Testnet package:
`0x37573a1060e150e2cbc48ea310e1a05b859dd18541344ffe1c2e304fee702916`.

**What currency do I trade with?**
USDC (6 decimals) on the active network. SUI is only used for gas.

**Is it custodial?**
No. Your shares and collateral are held in auditable smart contracts you call directly. Only
winning shares are redeemable, 1:1 against the vault.

**How are prices determined?**
By a constant-product AMM over outcome reserves. The implied probability of an outcome is
`reserve[outcome] / total_reserves`. See [AMM & Pricing Math](protocol/amm.md).

**Why are my shares always backed 1:1?**
Because every unit of collateral mints one share of *every* outcome (a complete set). At
resolution exactly one outcome wins, so winning shares in circulation always equal the
collateral in the vault. See [Core Concepts](concepts/index.md).

**What are the fees?**
A protocol fee (default 1.00%) plus a creator fee (up to 3.00%) per trade. An optional referral
fee (up to 0.50%) may apply. Close-out trades in the closing-only window get a discounted
protocol fee. Fees never dilute share backing. See [Fees](protocol/fees.md).

**Who decides the outcome?**
A registered oracle proposes the outcome after the market ends. Anyone can dispute it by
posting a bond. See [Resolution & Oracles](protocol/resolution.md) and [Disputes](protocol/disputes.md).

**What if the oracle is wrong?**
Raise a dispute during the window by posting a bond. If you're correct, your bond is returned;
if not, it is forfeited to the treasury. Disputed markets escalate to the admin for finalization.

**What are price-backed (BTC Up/Down) markets?**
Short-expiry binary markets that resolve automatically against a real Pyth price at expiry —
no human opinion. "Up" wins if the settlement price exceeds the reference price. See
[Price-Backed Markets](protocol/price-markets.md).

**Can I provide liquidity?**
Yes. Deposit USDC into the AMM pool to earn LP shares and a share of trading fees. You take
inventory risk as prices move. See [LP Incentives](protocol/incentives.md).

**When can I redeem?**
Only after a market is `RESOLVED` and your outcome won. Redeem via the market or Portfolio page.

**What is the closing-only window?**
Shortly before `ends_at`, you can only *reduce* positions (no opening new ones), protecting late
traders from resolution risk. Selling is always allowed.

**Can I create my own market?**
Yes — any wallet can create a market with ≥ 2 outcomes, a category, an end time, a creator fee,
and initial liquidity. See the [User Guide](guides/user-guide.md).

**Is there a DAO?**
There is a lightweight governance layer (`Governance`, `Proposal`, `GovernanceShare`) plus an
admin fast-path. Voting power requires minted governance shares. See [Governance](protocol/governance.md).

**Is the code audited?**
The contracts include extensive invariant protections and documented historical fixes (see
[Auditing the Contracts](security/audit.md)). Always do your own research and audit before
mainnet use. This software is provided as-is.

**Where can I see on-chain activity?**
Use [suiscan.xyz/testnet](https://suiscan.xyz/testnet) with the contract/object ids. Events are
documented in the [Events Reference](reference/events.md).

**How do I build/run it myself?**
See the [Deployment](guides/deployment.md) and [Developer Guide](guides/developers.md).

**I found a bug / vulnerability. What do I do?**
Report it privately to the OddsZero team before any public disclosure. See the
[Security Model](security/model.md).
