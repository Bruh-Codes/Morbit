import hre from "hardhat";
import { tokens } from "../config/tokens.js";

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

  const pool = await ethers.getContractAt("RWAPool", poolAddress);
  const priceUsd8 = (p) => ethers.parseUnits(p.toString(), 8);

  for (const [symbol, token] of Object.entries(tokens)) {
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
    console.log(`Reserve initialized: ${symbol} @ ${token.address} ($${token.priceUsd})`);
  }

  console.log("\nAll reserves initialized.");
  await connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
