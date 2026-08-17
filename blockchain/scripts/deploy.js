import hre from "hardhat";

async function main() {
  console.log("Deploying LandRegistry to Polygon Amoy...");

  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const registry = await LandRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`LandRegistry successfully deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
