/**
 * Token config for Arbitrum Sepolia — Ondo-style RWA assets.
 *
 * Tokens deployed via ArbitrumDeploymentModule Ignition module.
 * Addresses updated after deployment.
 */

export const CHAIN_ID = 421614;

export const RPC_URL = "https://sepolia.arbitrum.io/rpc";
export const EXPLORER_URL = "https://sepolia-explorer.arbitrum.io";

export const tokens = {
  USDC: {
    address: "0xe00da2a8Dd940482AC30d13dBd346F108BAAdab3",
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
    category: "stablecoin",
    priceUsd: 1,
    borrowingEnabled: true,
    collateralEnabled: false,
    supplyRateBps: 320,
    borrowRateBps: 500,
    ltvBps: 0,
    liquidationThresholdBps: 0,
    liquidationBonusBps: 0,
  },
  OUSG: {
    address: "0x73926de4Fa5A4F9B746AF417B0dd4F8213572950",
    name: "Ondo Short-Term US Gov Bond",
    symbol: "OUSG",
    decimals: 18,
    category: "rwa",
    priceUsd: 100_00000000,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7500,
    liquidationThresholdBps: 8000,
    liquidationBonusBps: 500,
  },
  USDY: {
    address: "0x3cD2e554acFb12126F9d1A91b599549B971680C8",
    name: "Ondo US Dollar Yield",
    symbol: "USDY",
    decimals: 18,
    category: "rwa",
    priceUsd: 105_00000000,
    borrowingEnabled: false,
    collateralEnabled: true,
    supplyRateBps: 0,
    borrowRateBps: 0,
    ltvBps: 7000,
    liquidationThresholdBps: 7500,
    liquidationBonusBps: 500,
  },
};

export const WETH = "";
