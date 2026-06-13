import hre from "hardhat";
import { tokens } from "../config/tokens.js";

async function main() {
  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  const signers = await ethers.getSigners();
  const user = signers[0];
  console.log(`Using account: ${user.address}`);

  const erc20Abi = ["function faucet()"];

  for (const [symbol, token] of Object.entries(tokens)) {
    try {
      const contract = new ethers.Contract(token.address, erc20Abi, user);
      const tx = await contract.faucet();
      await tx.wait();
      console.log(`✓ ${symbol} faucet minted`);
    } catch (e) {
      console.log(`✗ ${symbol} faucet failed: ${e.message?.slice(0, 80)}`);
    }
  }

  await connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
