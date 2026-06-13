import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ArbitrumDeploymentModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  // ── Deploy mock RWA tokens ──────────────────────────────────────────────
  const usdc = m.contract("contracts/mocks/MockERC20.sol:MockERC20", ["USD Coin", "USDC", 6, 0n], { id: "usdc" });
  const ousg = m.contract("contracts/mocks/MockERC20.sol:MockERC20", ["Ondo Short-Term US Gov Bond", "OUSG", 18, 0n], { id: "ousg" });
  const usdy = m.contract("contracts/mocks/MockERC20.sol:MockERC20", ["Ondo US Dollar Yield", "USDY", 18, 0n], { id: "usdy" });

  // ── Deploy RWAPool ──────────────────────────────────────────────────────
  const poolImpl = m.contract("RWAPool", [], { id: "poolImpl" });

  const initializeData = m.encodeFunctionCall(poolImpl, "initialize", []);

  const proxy = m.contract("TransparentUpgradeableProxy", [
    poolImpl,
    proxyAdminOwner,
    initializeData,
  ], { id: "poolProxy" });

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, { id: "proxyAdmin" });

  const pool = m.contractAt("RWAPool", proxy, { id: "pool" });

  return { pool, proxy, proxyAdmin, poolImpl, usdc, ousg, usdy };
});
