# Morbit RWA — Hackathon todo

**Architecture:** Aave's UI codebase, RWA contracts on Robinhood Chain Testnet (Arbitrum Orbit).
All the UI/state/logic exists — the protocol data layer is now wired to our RWAPool.

**Hackathon:** HackQuest Arbitrum Open House London — Robinhood Chain is Arbitrum Orbit,
so the project hits the Arbitrum-stack criteria. Verify chain RPC/chainId against the
hackathon resources / https://docs.robinhood.com/chain.

---

## Legend
- `[ ]` — not started
- `[-]` — in progress
- `[x]` — completed

---

## 1 — Robinhood network config — DONE

- [x] **Robinhood Testnet chain** in `src/ui-config/networksConfig.ts` (chainId 1140, env-overridable RPC/explorer via `NEXT_PUBLIC_ROBINHOOD_RPC_URL` / `NEXT_PUBLIC_ROBINHOOD_EXPLORER_URL`).
- [x] **Morbit RWA market** in `src/ui-config/marketsConfig.tsx` (`proto_robinhood_rwa`, listed first = default market). All addresses point at the single RWAPool deployment.
- [x] **`ChainId.robinhood_testnet`** added in `src/protocol/types.ts`.
- [x] **wagmiConfig** shows testnet chains when `NEXT_PUBLIC_ENV=staging` (or the testnets toggle).

## 2 — RWA contracts — WRITTEN, deployment pending

- [x] **`contracts/RWAPool.sol`** — Aave-V3-compatible pool (supply/withdraw/borrow/repay/setUserUseReserveAsCollateral/getUserAccountData) + built-in owner-set oracle + aggregated data-provider views (`getAllReservesData`, `getUserReservesData`). Stocks = collateral-only (70% LTV / 82.5% threshold), USDC = borrow-only (6.2% APR linear accrual).
- [x] **`contracts/MockERC20.sol`** — test USDC + mock tokenized stocks with public `faucet()`.
- [x] **`contracts/deploy.mjs`** — compiles (solc), deploys, registers reserves, seeds 1M USDC liquidity, writes `src/ui-config/robinhoodDeployment.json`.
- [ ] **Run the deployment:** set `DEPLOYER_PRIVATE_KEY` in `.env.local` (funded with Robinhood testnet ETH), then `yarn deploy:contracts`.
- [ ] (Optional) **Add `liquidationCall`** — positions can't be liquidated yet; demo flow doesn't need it but judges may ask.

## 3 — Wire aave-compat.ts — DONE

- [x] `UiPoolDataProvider` → reads RWAPool aggregated views (reserves + user reserves).
- [x] `WalletBalanceProvider` → real `balanceOf` reads for all registered reserves.
- [x] `ERC20Service` → real name/symbol/decimals/allowance + approve tx encoding.
- [x] `PoolBundle` → supply / borrow / repay / repayWithATokens tx builders (Aave V3 ABI).
- [x] `Pool` → withdraw ('-1' = max) + collateral toggle as DLP_ACTION envelopes.
- [x] `BaseDebtToken` → unlimited delegation stub so borrow flow never blocks.
- [x] `markets()` → real market snapshot (supplyReserves/borrowReserves/userState).
- [x] `gasLimitRecommendations` → safe defaults for every ProtocolAction.
- [x] New `src/protocol/rwaContracts.ts` — ABIs, providers, humanized mappers.

## 4 — On-chain app data — DONE

- [x] `formatReservesAndIncentives` — full USD/APY/ratio math from on-chain data.
- [x] `_formatUserSummaryAndIncentives` (mathUtils) — balances, LTV, available borrows, health factor.
- [x] Dashboard / Markets / Reserve Overview now read real chain data through the existing hooks (no changes needed in `useAppDataProvider`).

## 5 — Fix API routes

- [ ] `src/helpers/ServerJsonRpcProvider.ts` → calls `/api/rpc-proxy/` but route is `app/api/rpc/route.ts` (only matters if `NEXT_PUBLIC_PRIVATE_RPC_ENABLED=true`; public RPC path is used otherwise).
- [ ] `src/libs/subgraphRequest.ts` → `/api/subgraph-proxy` vs `app/api/subgraph/route.ts` (only affects History page, which is out of MVP scope).
- [ ] `src/layouts/SupportModal.tsx` → `/api/support-create-ticket` route doesn't exist.

## 6 — Wallet connection

- [ ] Set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` in `.env.local` (https://cloud.walletconnect.com).

## 7 — Brand & cleanup

- [ ] Update site title/favicon (still Aave branding in places).
- [ ] Robinhood network logo (currently reuses the Arbitrum icon).
- [ ] Fix `usd?0.svg` encoding artifact in `public/icons/tokens/`.
- [ ] (Optional) strip non-Robinhood markets from the market switcher for a cleaner demo.

## 8 — Test the full flow

```
0. yarn install && yarn deploy:contracts && yarn dev  (NEXT_PUBLIC_ENV=staging)
1. Land on site → Connect wallet on Robinhood Chain Testnet
2. Get tokens: call faucet() on mock TSLA/USDC via the explorer (open mint)
3. Markets page → see RWA stocks + USDC with prices
4. Supply TSLA → approve → supply → success
5. Dashboard → supplied balance, health factor shown
6. Borrow USDC → confirm → success; HF & available borrows update
7. Repay USDC (partial + max) → close position
8. Withdraw TSLA → remove collateral
9. Toggle "use as collateral" off/on
```

---

## Known demo limitations (be ready to explain to judges)
- No liquidations (no `liquidationCall` yet)
- Owner-set oracle prices (swap for Chainlink/Stork on mainnet)
- Supply APY is display-only; only borrow debt accrues interest
- MockERC20 has open `mint` — testnet only, zero economic security
- History page / incentives / swaps stubbed out

## Skipped for hackathon
- Swap (CoW Protocol / ParaSwap), Stake / Umbrella / GHO, limit orders / flash loans
- Multi-chain support, Analytics (Amplitude), i18n (Lingui)
