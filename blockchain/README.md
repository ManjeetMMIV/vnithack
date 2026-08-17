# Blockchain Layer - Land Registry

This directory contains the decentralized "Trust Engine" for the hackathon project. It is responsible for storing cryptographic hashes of land records on the Polygon Amoy testnet to mathematically prove whether the centralized database has been tampered with.

## Project Structure
- `contracts/LandRegistry.sol`: The Solidity smart contract that maps Property IDs to document hashes and timestamps.
- `scripts/deploy.js`: Script to deploy the contract to a live testnet.
- `blockchainService.js`: An easy-to-use Node.js bridge using `ethers` v6. **This is the only file the backend team needs to interact with.**
- `test-bridge.js`: A standalone script to verify the bridge can write and read from the live contract.
- `test/LandRegistry.js`: Hardhat Chai/Mocha unit tests to verify the contract logic locally.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure your `.env` file is populated with your live keys:
   ```env
   PRIVATE_KEY=your_metamask_private_key
   ALCHEMY_AMOY_URL=your_alchemy_rpc_url
   CONTRACT_ADDRESS=your_deployed_contract_address
   ```

3. **Deploying the Contract:**
   *(Note: This is already deployed for the current project)*
   ```bash
   npx hardhat run scripts/deploy.js --network polygonAmoy
   ```

4. **Running Tests:**
   ```bash
   npx hardhat test
   ```

## Integration Guide for the Node.js Backend Team

The backend team can easily integrate this into their Express routes. No blockchain knowledge is required.

```javascript
import blockchainService from "./blockchainService.js";
import crypto from "crypto";

// --- Example Route: Creating a new Land Record ---
app.post('/api/records', async (req, res) => {
    const { propertyId, owner, coordinates, clerkId } = req.body;
    
    // 1. Save full data to MongoDB (Standard Backend Logic)
    // await Property.create({...})
    
    // 2. Hash the JSON payload mathematically
    const payloadString = JSON.stringify({ propertyId, owner, coordinates, clerkId });
    const hash = crypto.createHash('sha256').update(payloadString).digest('hex');
    
    // 3. Commit the hash to the Polygon testnet
    await blockchainService.storeHashOnChain(propertyId, hash);
    
    res.status(200).send("Record and cryptographic hash saved successfully.");
});

// --- Example Route: Auditing a Land Record ---
app.get('/api/audit/:propertyId', async (req, res) => {
    const { propertyId } = req.params;
    
    // 1. Fetch data from MongoDB
    // const property = await Property.findOne({ propertyId });
    
    // 2. Re-hash the data fetched from the database
    const payloadString = JSON.stringify(property);
    const dbHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    
    // 3. Fetch the immutable hash from the blockchain
    const { hash: chainHash, timestamp } = await blockchainService.verifyHashOnChain(propertyId);
    
    // 4. Compare
    if (dbHash !== chainHash) {
        return res.status(409).send("TAMPERING DETECTED! Database hash does not match blockchain.");
    }
    
    res.status(200).send("Data verified and authentic.");
});
```
