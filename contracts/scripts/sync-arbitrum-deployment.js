/**
 * Syncs Hardhat Ignition deployment artifacts + Arbitrum token config into
 * web/ui-config/arbitrumDeployment.json.
 *
 * Usage (from contracts/):
 *   node scripts/sync-arbitrum-deployment.js
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tokens, CHAIN_ID, RPC_URL, EXPLORER_URL, WETH } from "../config/tokens-arbitrum.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DEPLOYMENT_PATH = join(__dirname, "../../web/ui-config/arbitrumDeployment.json");

function findLatestDeployment() {
  const deploymentsDir = join(__dirname, "../ignition/deployments");
  if (!existsSync(deploymentsDir)) return null;

  const candidates = [
    join(deploymentsDir, `chain-${CHAIN_ID}`),
    join(deploymentsDir, "arbitrumSepolia"),
  ];

  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }

  const dirs = readdirSync(deploymentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(deploymentsDir, d.name));

  if (dirs.length === 0) return null;
  dirs.sort((a, b) => {
    const aTime = readFileSync(join(a, "journal.jsonl"), "utf8").length;
    const bTime = readFileSync(join(b, "journal.jsonl"), "utf8").length;
    return bTime - aTime;
  });
  return dirs[0];
}

function readDeployedAddresses(deploymentDir) {
  const path = join(deploymentDir, "deployed_addresses.json");
  if (!existsSync(path)) {
    console.warn(`No deployed_addresses.json in ${deploymentDir}`);
    return {};
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  console.log("Syncing Arbitrum deployment...");

  const deploymentDir = findLatestDeployment();
  let poolAddress = "0x0000000000000000000000000000000000000000";

  if (deploymentDir) {
    console.log(`Found deployment dir: ${deploymentDir}`);
    const addresses = readDeployedAddresses(deploymentDir);

    const poolKey = Object.keys(addresses).find(
      (k) => k.includes("pool") && !k.includes("Impl") && !k.includes("Admin")
    );
    if (poolKey) {
      poolAddress = addresses[poolKey];
      console.log(`Pool address: ${poolAddress} (key: ${poolKey})`);
    } else {
      console.warn("Could not find pool address");
      console.warn("Available keys:", Object.keys(addresses));
    }

    // Fill in mock token addresses from deployment
    for (const [symbol, token] of Object.entries(tokens)) {
      const key = symbol.toLowerCase();
      const matchingKey = Object.keys(addresses).find(
        (k) => k === key || k.endsWith(`#${key}`) || k.endsWith(`#${symbol}`)
      );
      if (matchingKey) {
        token.address = addresses[matchingKey];
        console.log(`Token ${symbol}: ${token.address}`);
      }
    }
  } else {
    console.warn("No ignition deployment found — using zero address for pool");
  }

  const tokenAddresses = {};
  for (const [symbol, token] of Object.entries(tokens)) {
    tokenAddresses[symbol] = token.address;
  }

  const deployment = {
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    explorerUrl: EXPLORER_URL,
    pool: poolAddress,
    weth: WETH,
    tokens: tokenAddresses,
    mockRwas: true,
    deployedAt: new Date().toISOString(),
    deployer: null,
  };

  writeFileSync(WEB_DEPLOYMENT_PATH, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nWrote ${WEB_DEPLOYMENT_PATH}`);
  console.log(JSON.stringify(deployment, null, 2));
}

main();
