import hre from "hardhat";
import { tokens } from "../config/tokens-arbitrum.js";

async function main() {
  const poolAddress = process.env.POOL_ADDRESS;
  if (!poolAddress) {
    console.error("ERROR: set POOL_ADDRESS env var to the deployed proxy address");
    process.exit(1);
  }

  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log(`Using deployer: ${deployer.address}`);

  const rwaPoolAbi = [
    "function initReserve(address, bool, bool, uint16, uint16, uint16, uint16, uint16, uint128)",
    "function setAssetPrice(address, uint128)",
    "function getReservesList() view returns (address[])",
    "function getAllReservesData() view returns (tuple(address asset, string name, string symbol, uint8 decimals, bool borrowingEnabled, bool collateralEnabled, uint16 ltv, uint16 liquidationThreshold, uint16 liquidationBonus, uint16 supplyRateBps, uint16 borrowRateBps, uint128 priceUsd, uint256 totalSupplied, uint256 totalBorrowed, uint256 availableLiquidity)[])",
  ];
  const pool = new ethers.Contract(poolAddress, rwaPoolAbi, deployer);
  const priceUsd8 = (p) => ethers.parseUnits(p.toString(), 8);

  // Check which assets are already initialized
  let existingAssets = new Set();
  try {
    const existing = await pool.getReservesList();
    for (const addr of existing) {
      existingAssets.add(addr.toLowerCase());
    }
    console.log(`Already initialized: ${existing.length} reserves`);
  } catch {
    console.log("Could not fetch existing reserves — will attempt init");
  }

  for (const [symbol, token] of Object.entries(tokens)) {
    const addr = token.address.toLowerCase();
    if (existingAssets.has(addr)) {
      console.log(`Skipping ${symbol} (already initialized)`);
    } else {
      const tx = await pool.initReserve(
        token.address,
        token.borrowingEnabled,
        token.collateralEnabled,
        token.ltvBps,
        token.liquidationThresholdBps,
        token.liquidationBonusBps,
        token.supplyRateBps,
        token.borrowRateBps,
        priceUsd8(token.priceUsd)
      );
      await tx.wait();
      console.log(`Reserve initialized: ${symbol} @ ${token.address}`);
    }

    // Always set price (idempotent)
    const priceTx = await pool.setAssetPrice(token.address, priceUsd8(token.priceUsd));
    await priceTx.wait();
    console.log(`Price set: ${symbol} = $${token.priceUsd}`);
  }

  console.log("\nAll reserves ready.");
  await connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
