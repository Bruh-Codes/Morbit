import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RWAPoolModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

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

  return { pool, proxy, proxyAdmin, poolImpl };
});
