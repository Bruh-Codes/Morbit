/**
 * Syncs Hardhat Ignition deployment artifacts + token config into
 * web/ui-config/robinhoodDeployment.json — the single file the web app reads.
 *
 * Usage (from contracts/):
 *   node scripts/sync-deployment.js
 *
 * After running, the web app picks up the new addresses on next page load.
 * NEVER edit robinhoodDeployment.json by hand.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tokens, CHAIN_ID, RPC_URL, EXPLORER_URL, WETH } from "../config/tokens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DEPLOYMENT_PATH = join(__dirname, "../../web/ui-config/robinhoodDeployment.json");

function findLatestDeployment() {
  const deploymentsDir = join(__dirname, "../ignition/deployments");
  if (!existsSync(deploymentsDir)) return null;

  // Hardhat 3 Ignition names deployment dirs: chain-<chainId> or <networkName>
  const candidates = [
    join(deploymentsDir, `chain-${CHAIN_ID}`),
    join(deploymentsDir, "robinhoodTestnet"),
  ];

  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }

  // Fallback: pick the most recently modified subdirectory
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
  console.log("Syncing deployment...");

  // 1. Find ignition deployment artifacts
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
      console.warn("Could not find pool address in deployed_addresses.json");
      console.warn("Available keys:", Object.keys(addresses));
    }
  } else {
    console.warn("No ignition deployment found — using zero address for pool");
  }

  // 2. Build token map from centralized config
  const tokenAddresses = {};
  for (const [symbol, token] of Object.entries(tokens)) {
    tokenAddresses[symbol] = token.address;
  }

  // 3. Assemble and write
  const deployment = {
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    explorerUrl: EXPLORER_URL,
    pool: poolAddress,
    weth: WETH,
    tokens: tokenAddresses,
    mockRwas: false,
    deployedAt: new Date().toISOString(),
    deployer: null,
  };

  writeFileSync(WEB_DEPLOYMENT_PATH, JSON.stringify(deployment, null, 2) + "\n");
  console.log(`\nWrote ${WEB_DEPLOYMENT_PATH}`);
  console.log(JSON.stringify(deployment, null, 2));
}

main();
