import { expect } from "chai";
import hre from "hardhat";

describe("LandRegistry Smart Contract", function () {
  let landRegistry;

  // Deploy a fresh contract before running tests
  before(async function () {
    const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();
  });

  it("Should commit a hash and emit the HashCommitted event", async function () {
    const propertyId = "PROP-12345";
    const docHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const tx = await landRegistry.commitHash(propertyId, docHash);
    const receipt = await tx.wait();

    // Get block timestamp to verify the event argument
    const block = await hre.ethers.provider.getBlock(receipt.blockNumber);

    await expect(tx)
      .to.emit(landRegistry, "HashCommitted")
      .withArgs(propertyId, docHash, block.timestamp);
  });

  it("Should correctly retrieve the committed hash", async function () {
    const propertyId = "PROP-12345";
    const expectedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const [storedHash, timestamp] = await landRegistry.getHash(propertyId);
    
    expect(storedHash).to.equal(expectedHash);
    expect(timestamp).to.be.greaterThan(0);
  });

  it("Should return empty values for non-existent properties", async function () {
    const [storedHash, timestamp] = await landRegistry.getHash("PROP-UNKNOWN");
    
    expect(storedHash).to.equal("");
    expect(timestamp).to.equal(0n); // Smart contract returns uint256 as BigInt 0n
  });

  it("Should update the hash if committed again for the same property", async function () {
    const propertyId = "PROP-12345";
    const newDocHash = "new-hash-value-123";

    await landRegistry.commitHash(propertyId, newDocHash);

    const [storedHash, timestamp] = await landRegistry.getHash(propertyId);
    
    expect(storedHash).to.equal(newDocHash);
  });
});
