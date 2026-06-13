import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  console.log("connection type:", typeof connection);
  console.log("connection keys:", Object.keys(connection));
  console.log("connection constructor:", connection.constructor?.name);

  // Check for ethers-like methods
  if (connection.getSigners) console.log("has getSigners");
  if (connection.getProvider) console.log("has getProvider");
  if (connection.provider) console.log("has provider");

  // Print all methods
  const proto = Object.getPrototypeOf(connection);
  console.log("proto methods:", Object.getOwnPropertyNames(proto));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
