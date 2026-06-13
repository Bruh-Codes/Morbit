# Morbit

Morbit is a non-custodial lending and market interface for real-world assets and crypto markets, built for the Robinhood Chain Testnet and Arbitrum.

It gives users a fast way to browse markets, inspect reserves, manage positions, and move between overview and action flows in one app.

## Why Morbit

- It runs on an Arbitrum chain, which satisfies the event deployment requirement.
- It supports Robinhood Chain Testnet as a primary market, which aligns with the reserved Robinhood track.
- It ships as a real product, not a slide deck or prototype.
- It bridges traditional-style assets and DeFi lending flows in a single interface.
- It already has a connected-wallet dashboard, reserve detail pages, and working supply and borrow actions.

## What it does

- Browse the live market and reserve catalog
- View dashboard positions when a wallet is connected
- Open reserve detail pages with overview and action panels
- Track supply, borrow, collateral, and transaction flows
- Switch between light and dark themes
- Support both Robinhood and Arbitrum markets in the same codebase

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MUI
- wagmi
- viem
- ConnectKit
- Zustand
- TanStack React Query
- Lingui
- Solidity
- Hardhat 3
- OpenZeppelin upgradeable contracts

## Project Structure

- `web/` - main frontend application
- `contracts/` - smart contracts and deployment tooling
- `web/app/` - Next.js app routes
- `web/modules/` - feature-level UI modules
- `web/components/` - shared UI components
- `web/hooks/` - shared data and wallet hooks
- `web/ui-config/` - market, network, and app configuration
- `web/utils/` - shared utilities and theme setup

## Markets

| Market      | Chain ID | Type     | Collateral Assets           | Borrow Asset |
| ----------- | -------: | -------- | --------------------------- | ------------ |
| Robinhood   |    46630 | RWA      | TSLA, AMZN, PLTR, NFLX, AMD | USDG         |
| Arbitrum V3 |    42161 | Standard | Aave V3 assets              | Aave V3      |

## Getting Started

### Frontend

```bash
cd web
yarn install
cp .env.example .env.local
yarn dev
```

### Contracts

```bash
cd contracts
yarn install
cp .env.example .env
npx hardhat compile
```

## Available Scripts

### Frontend (`web/`)

- `yarn dev` - start the Next.js dev server
- `yarn build` - build the app for production
- `yarn start` - serve the production build
- `yarn lint` - run ESLint
- `yarn lint:fix` - run ESLint and auto-fix issues
- `yarn i18n` - extract and compile Lingui translations

### Contracts (`contracts/`)

- `npx hardhat compile` - compile Solidity contracts
- `npx hardhat test` - run contract tests
- `npx hardhat ignition deploy ...` - deploy via Ignition
- `npx hardhat run scripts/init-reserves.js` - initialize on-chain reserves
- `node scripts/sync-deployment.js` - sync addresses to the frontend

## Smart Contracts

### RWAPool.sol

The Robinhood market is backed by an upgradeable lending pool contract.

Supported flows include:

- Supply
- Withdraw
- Borrow
- Repay
- Liquidation

## Notes

- The Robinhood market uses a stub layer in `web/protocol/aave-compat.ts` that routes Aave-style SDK calls to the RWAPool contract.
- `web/ui-config/robinhoodDeployment.json` is the generated deployment config consumed by the frontend.
- Theme colors and global baseline styles live in `web/utils/theme.tsx`.
- The app switches between the dashboard and markets experience based on wallet connection state.

## License

See the repository license file for details.
