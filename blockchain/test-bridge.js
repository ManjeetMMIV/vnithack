// Standalone script to test the blockchain service bridge locally
import dotenv from "dotenv";
dotenv.config();
import blockchainService from "./blockchainService.js";

async function runTest() {
  if (!process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      console.error("❌ Please set PRIVATE_KEY and CONTRACT_ADDRESS in your .env file before running this test.");
      return;
  }

  try {
    const propertyId = "PROP-" + Math.floor(Math.random() * 10000);
    // Dummy SHA-256 hash for testing
    const testHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; 

    console.log("--- Testing storeHashOnChain ---");
    await blockchainService.storeHashOnChain(propertyId, testHash);

    console.log("\n--- Testing verifyHashOnChain ---");
    const result = await blockchainService.verifyHashOnChain(propertyId);
    
    console.log("Retrieved Result:", result);
    
    if (result.hash === testHash) {
        console.log("✅ SUCCESS: The retrieved hash matches the submitted hash!");
        console.log(`Timestamp recorded: ${new Date(result.timestamp * 1000).toLocaleString()}`);
    } else {
        console.error("❌ FAILURE: The retrieved hash does not match!");
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
}

runTest();
