# Blockchain Utility Integration Guide

Welcome to the Blockchain module of the Land Registry project. This guide explains how the blockchain is used in our architecture and how other microservices (like the backend) can interact with it.

## The Architecture
We use a **Hybrid Architecture**:
1. **Centralized Database (MongoDB)**: Stores the raw, heavy JSON data (Owner names, coordinates, clerk IDs).
2. **Decentralized Vault (Polygon Amoy)**: Stores only a mathematical proof (SHA-256 Hash) of the data. 

By storing just the hash on the blockchain, we keep transaction costs near zero and maintain data privacy, while still inheriting the immutability of the blockchain.

## The Smart Contract
The smart contract `LandRegistry.sol` is deployed on the Polygon Amoy Testnet.
It has two main functions:
- `commitHash(string propertyId, string documentHash)`: Saves the hash to the blockchain.
- `getHash(string propertyId)`: Retrieves the hash and timestamp.

## How to use the `blockchainService.js` Bridge

We have written a Node.js utility wrapper (`blockchainService.js`) using `ethers.js` so that backend developers don't have to write any complex blockchain code.

### 1. Environment Setup
Your service needs an `.env` file with three variables:
```env
PRIVATE_KEY=your_metamask_private_key
ALCHEMY_AMOY_URL=https://polygon-amoy.g.alchemy.com/v2/your_api_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

### 2. Importing and Using the Service
```javascript
import blockchainService from "./blockchainService.js";
import crypto from "crypto";

// 1. Hash your payload
const payloadString = JSON.stringify({ owner: "John Doe", propertyId: "PROP-123" });
const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

// 2. Storing a new hash when a record is created
const txHash = await blockchainService.storeHashOnChain("PROP-123", hash);
console.log("Saved to Polygon in transaction:", txHash);

// 3. Verifying a hash during an audit
const chainData = await blockchainService.verifyHashOnChain("PROP-123");
console.log("Expected Hash on Blockchain:", chainData.hash);
```

## Security Workflow (The Hackathon Pitch)
1. **Create**: User submits data -> Backend saves to DB -> Backend calculates Hash -> Backend sends Hash to Polygon via `storeHashOnChain()`.
2. **Audit**: User requests audit -> Backend fetches DB record -> Backend recalculates Hash -> Backend fetches Blockchain Hash via `verifyHashOnChain()` -> Compares the two.
3. **The Hack**: If a corrupt database admin alters the MongoDB data, the DB Hash changes. When the Audit runs, the new DB Hash will **NOT** match the immutable Polygon Hash, triggering a red alert!
