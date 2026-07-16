# User Guide

This guide is for people who want to **use** OddsZero — trade shares, create markets, provide
liquidity, and collect winnings. No coding required.

## Getting started

1. Visit the OddsZero web app.
2. Connect a Sui wallet (e.g. Sui Wallet / Slush) using the in-app connect button.
3. Make sure you hold **USDC** (the collateral) on the active network. SUI is only needed for
   gas.
4. Browse markets on the home page, filter by category, or open a market to trade.

## Understanding prices

Each outcome shows a price between **$0.00** and **$1.00** (displayed as a percentage). This
price is the market's implied probability:

- A "Yes" share at **$0.65** = the market thinks Yes is 65% likely.
- If "Yes" wins, each "Yes" share pays **$1.00**. If not, it pays **$0.00**.

Your profit if correct = `(1.00 − buy_price) × shares`. Your loss if wrong = `buy_price ×
shares` (the shares become worthless).

## Trading

Open any market and use the **Trade** panel:

- **Buy** — enter a payment amount (in USDC) and pick an outcome. You'll see an estimated
  number of shares and the effective price. Set a **minimum shares** (slippage floor) to
  protect against price movement.
- **Sell** — enter the number of shares you hold of an outcome. You'll see the estimated
  payout after fees.

Fees are shown transparently: a small protocol fee + the creator's fee are deducted from each
trade (see [Fees](fees.md)). During the closing-only window, close-out trades get a discounted
protocol fee.

### Closing-only window

Near a market's end (`closing_only_window_ms` before `ends_at`), you can **only reduce**
existing positions — you cannot open new ones. This protects late traders from resolution
risk. Selling is always allowed; buying is only allowed if it reduces your net exposure.

## Providing liquidity

On a market's **Liquidity** panel you can:

- **Add liquidity** — deposit USDC into the AMM pool and receive LP shares proportional to
  your contribution. You earn a share of trading fees (via the treasury / incentive streams).
- **Remove liquidity** — withdraw your pro-rata collateral (a complete set).

LPs take **inventory risk**: as prices move, the pool accumulates more of the now-favored
outcome. If you remove liquidity after prices have shifted, you may get back more of one
outcome than another. See [AMM & Pricing Math](amm.md) for the LP math.

## Creating a market

Use the **Create Market** page:

- **Question** — clear, unambiguous wording.
- **Outcomes** — at least two (e.g. "Yes"/"No", or multiple candidates).
- **Category** — Politics, Sports, Crypto, Entertainment, Tech, Finance, Science, Other.
- **End time** — when the event resolves (`ends_at`).
- **Creator fee** — up to `max_creator_fee_bps` (3.00%); you earn this on every trade.
- **Initial liquidity** — seeds the AMM (must be > 0).
- **Referrer** (optional) — an affiliate address.

For short-expiry BTC Up/Down markets, use the price-market creator (automated resolution,
see [Price-Backed Markets](price-markets.md)).

> Markets go live immediately in `TRADING` status. Resolution opens after `ends_at +
min_resolution_delay_ms`.

## Redeeming winnings

Once a market is `RESOLVED` and your outcome won:

1. Open the market (or your **Portfolio**).
2. Click **Redeem**. Each winning share is paid **1:1** in USDC from the collateral vault.
3. Your winning balance is zeroed after redemption (you cannot redeem twice).

Non-winning shares are worthless and do not need action.

## Portfolio & PnL

The **Portfolio** page shows your positions across all markets, computed in `lib/pnl.ts`:

- `avgEntryBps` — your average entry price per outcome (basis points).
- `costBasis` — what you paid for your open shares.
- `marketValue` — current value at live probabilities.
- `realizedPnl` — locked in from sells.
- `unrealizedPnl` — open PnL at current prices.
- `netPnl`, `roiPct`, and LP position value.

## Disputing a wrong resolution

If you believe a resolved market got the wrong outcome:

1. Wait for the oracle to propose (market enters `RESOLVING`).
2. Open a dispute and post a **bond** (≥ `dispute_bond_bps` of the market's collateral).
3. If you're correct, your bond is returned; if not, it is forfeited.

See [Disputes](disputes.md) for the full rules.

## Safety tips

- Only trade markets whose resolution source you trust.
- Check the market's `ends_at` and dispute window before entering near expiry.
- Verify contracts and addresses on [suiscan.xyz](https://suiscan.xyz/testnet).
- Never share your seed phrase; OddsZero never asks for it.
