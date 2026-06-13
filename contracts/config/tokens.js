/**
 * Single source of truth for all Robinhood Chain Testnet token addresses
 * and reserve parameters. Used by:
 *   - contracts/scripts/init-reserves.js  (on-chain setup)
 *   - contracts/scripts/sync-deployment.js (writes web/ui-config/robinhoodDeployment.json)
 *
 * NEVER edit robinhoodDeployment.json by hand — run `npx hardhat sync-deployment` instead.
 */

export const CHAIN_ID = 46630;

export const RPC_URL = "https://rpc.testnet.chain.robinhood.com";
export const EXPLORER_URL = "https://explorer.testnet.chain.robinhood.com";

// ── Tokens ──────────────────────────────────────────────────────────────────
// Official Robinhood Chain Testnet token addresses.
// See: https://docs.robinhood.com/chain/contracts/

export const tokens = {
  USDG: {
    address: "0x7E955252E15c84f5768B83c41a71F9eba181802F",
    name: "USDG",
    symbol: "USDG",
    decimals: 6,
    category: "stablecoin",
    priceUsd: 1,
    // reserve params
    borrowingEnabled: true,
    collateralEnabled: false,
    supplyRateBps: 450,
    borrowRateBps: 620,
    ltvBps: 0,
    liquidationThresholdBps: 0,
    liquidationBonusBps: 0,
  },
  TSLA: {
    address: "0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E",
    name: "TSLA",
    symbol: "TSLA",
    decimals: 8,
    category: "collateral",
    priceUsd: 350,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7000,
    liquidationThresholdBps: 8250,
    liquidationBonusBps: 500,
  },
  AMZN: {
    address: "0x5884aD2f920c162CFBbACc88C9C51AA75eC09E02",
    name: "AMZN",
    symbol: "AMZN",
    decimals: 8,
    category: "collateral",
    priceUsd: 210,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7000,
    liquidationThresholdBps: 8250,
    liquidationBonusBps: 500,
  },
  PLTR: {
    address: "0x1FBE1a0e43594b3455993B5dE5Fd0A7A266298d0",
    name: "PLTR",
    symbol: "PLTR",
    decimals: 8,
    category: "collateral",
    priceUsd: 95,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7000,
    liquidationThresholdBps: 8250,
    liquidationBonusBps: 500,
  },
  NFLX: {
    address: "0x3b8262A63d25f0477c4DDE23F83cfe22Cb768C93",
    name: "NFLX",
    symbol: "NFLX",
    decimals: 8,
    category: "collateral",
    priceUsd: 880,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7000,
    liquidationThresholdBps: 8250,
    liquidationBonusBps: 500,
  },
  AMD: {
    address: "0x71178BAc73cBeb415514eB542a8995b82669778d",
    name: "AMD",
    symbol: "AMD",
    decimals: 8,
    category: "collateral",
    priceUsd: 165,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7000,
    liquidationThresholdBps: 8250,
    liquidationBonusBps: 500,
  },
};

export const WETH = "0x7943e237c7F95DA44E0301572D358911207852Fa";
