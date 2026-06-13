<img width="400" alt="Frame 2085660247" src="https://github.com/user-attachments/assets/85b0d927-08fc-44fe-a48f-8097a326785f" />

# Morbit — RWA Lending Protocol

Morbit is a non-custodial real-world asset lending protocol on **Robinhood Chain Testnet** and **Arbitrum**. Users supply tokenized stocks (TSLA, AMZN, PLTR, NFLX, AMD) as collateral and borrow USDG stablecoin.

---

## Architecture

```
contracts/               Solidity + Hardhat Ignition deployment
  ├── contracts/         RWAPool.sol (upgradeable)
  ├── ignition/          Declarative deployment modules
  ├── config/            Token addresses & reserve parameters
  └── scripts/           Init-reserves, sync-deployment

web/                     Next.js 16 frontend
  ├── protocol/          aave-compat stub layer + rwaContracts
  ├── modules/           Feature UI (markets, dashboard, history)
  ├── store/             Zustand slices (incl. local tx storage)
  └── ui-config/         Markets, networks, wagmi

indexer/                 Subgraph for The Graph
  ├── schema.graphql     Entities: Reserve, User, 5 tx types
  ├── subgraph.yaml      Manifest → RWAPool
  └── src/mapping.ts     Event handlers for all 9 events
```

---

## Markets

| Market      | Chain ID | Type     | Collateral Assets           | Borrow Asset |
| ----------- | -------: | -------- | --------------------------- | ------------ |
| Robinhood   |    46630 | RWA      | TSLA, AMZN, PLTR, NFLX, AMD | USDG         |
| Arbitrum V3 |    42161 | Standard | Aave V3 assets              | Aave V3      |

---

## Smart Contracts

### RWAPool.sol

Upgradeable lending pool (`Initializable` + `OwnableUpgradeable`) with a `TransparentUpgradeableProxy`.

| Function | Description |
|----------|-------------|
| `supply` | Deposit collateral (stocks or USDG) |
| `withdraw` | Redeem supplied collateral |
| `borrow` | Draw USDG against collateral |
| `repay` | Repay borrowed USDG |
| `liquidationCall` | Seize undercollateralized positions |
| `getAllReservesData` | Batch reserve view |
| `getUserAccountData` | User health factor, LTV, totals |

### Deployed on Robinhood Testnet (chain 46630)

| Contract | Address |
|----------|---------|
| **RWAPool** | `0xCB7460EdA8379D0eE4D2E008216E40DB782254cc` |
| RWAPool (impl) | `0x1096b29aAAC0079A3Dba4A2B370CdAc58D8A1B57` |
| ProxyAdmin | `0x23e2B6E25F65CBD21C3D798F284744391564B3B5` |
| USDG | `0x7E955252E15c84f5768B83c41a71F9eba181802F` |
| TSLA | `0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E` |
| AMZN | `0x5884aD2f920c162CFBbACc88C9C51AA75eC09E02` |
| PLTR | `0x1FBE1a0e43594b3455993B5dE5Fd0A7A266298d0` |
| NFLX | `0x3b8262A63d25f0477c4DDE23F83cfe22Cb768C93` |
| AMD | `0x71178BAc73cBeb415514eB542a8995b82669778d` |
| WETH | `0x7943e237c7F95DA44E0301572D358911207852Fa` |

---

## Getting Started

### Frontend

```bash
cd web
yarn install
cp .env.example .env.local
yarn dev
```

Required env vars: `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

### Contracts

```bash
cd contracts
yarn install
cp .env.example .env
npx hardhat compile
```

Required env vars: `DEPLOYER_PRIVATE_KEY`

### Deployment Flow

```
contracts/config/tokens.js        ← single source of truth
        ↓
contracts/ignition/deployments/   ← Hardhat Ignition artifacts
        ↓
node scripts/sync-deployment.js   ← reads artifacts + tokens.js
        ↓
web/ui-config/robinhoodDeployment.json  ← consumed by UI
```

No env var overrides for pool or token addresses.

---

## Transaction History

Transactions submitted during a session are stored in the local Zustand store and appear immediately in the History page — no subgraph needed for the demo.

### Option A: Out of the box (local only)
Just works. Every supply, borrow, repay, withdraw you submit gets recorded and displayed.

### Option B: Persistent history via The Graph

A subgraph is scaffolded in `indexer/` for Robinhood Testnet. To deploy:

```bash
cd indexer
yarn install
npx graph codegen
npx graph build
```

You'll need a self-hosted Graph Node (Robinhood isn't in Graph Studio's default networks). Create a `docker-compose.yml` with:

```
graph-node → Postgres + IPFS
```

Then:

```bash
npx graph create --node http://localhost:8020 morbit/morbit-rwa
npx graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 morbit/morbit-rwa
```

Once live, update `aave-compat.ts`'s `useUserTransactionHistory` stub to query your Graph Node endpoint.

---

## Available Scripts

### Frontend (`web/`)

| Script | Description |
|--------|-------------|
| `yarn dev` | Next.js dev server (Turbopack) |
| `yarn build` | Production build |
| `yarn start` | Serve production build |
| `yarn lint` | ESLint |
| `yarn lint:fix` | ESLint auto-fix |
| `yarn i18n` | Extract & compile Lingui translations |

### Contracts (`contracts/`)

| Script | Description |
|--------|-------------|
| `npx hardhat compile` | Compile Solidity |
| `npx hardhat test` | Run tests |
| `npx hardhat ignition deploy ...` | Deploy via Ignition |
| `npx hardhat run scripts/init-reserves.js` | Initialize on-chain reserves |
| `node scripts/sync-deployment.js` | Sync addresses to frontend |

### Indexer (`indexer/`)

| Script | Description |
|--------|-------------|
| `npx graph codegen` | Generate TypeScript types |
| `npx graph build` | Compile mappings to WASM |
| `npx graph deploy ...` | Deploy to Graph Node |

---

## Key Files

| File | Purpose |
|------|---------|
| `contracts/contracts/RWAPool.sol` | Upgradeable lending pool |
| `contracts/ignition/modules/RWAPoolModule.ts` | Ignition deployment module |
| `contracts/config/tokens.js` | Token addresses & reserve params |
| `contracts/scripts/init-reserves.js` | On-chain reserve setup |
| `contracts/scripts/sync-deployment.js` | Sync addresses to frontend |
| `web/protocol/aave-compat.ts` | Stub layer routing Aave SDK calls → RWAPool |
| `web/protocol/rwaContracts.ts` | On-chain glue (ABI, providers, fetchers) |
| `web/protocol/rwaTokens.ts` | Token UI metadata |
| `web/store/transactionsSlice.ts` | Local transaction storage (Zustand) |
| `web/hooks/useTransactionHistory.tsx` | History merge (local + SDK + CowSwap) |
| `web/ui-config/robinhoodDeployment.json` | Auto-generated UI config |
| `indexer/subgraph.yaml` | Subgraph manifest |
| `indexer/src/mapping.ts` | Event handler mappings |

---

## Faucets

| Asset | Faucet |
|-------|--------|
| USDG | https://faucet.paxos.com/?network=robinhood |
| ETH + Stock Tokens | https://faucet.testnet.chain.robinhood.com/ |

---

## Notes

- The Robinhood market uses a stub layer in `web/protocol/aave-compat.ts` that routes all `@aave/*` SDK calls to the RWAPool contract via ethers.
- APY history charts use mock data generators — no subgraph dependency.
- `ENABLE_TESTNET = true` is hardcoded so Robinhood Testnet always appears.
- Body background is set via inline `<script>` before React hydrates to prevent white flash on dark mode.
- The Swap module is excluded from TypeScript type-checking via `tsconfig.json`.

---

## License

See the repository license file for details.
