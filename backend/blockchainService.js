import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const contractABI = [
  "function commitHash(string propertyId, string documentHash) public",
  "function getHash(string propertyId) public view returns (string, uint256)",
  "event HashCommitted(string propertyId, string documentHash, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    const rpcUrl = process.env.ALCHEMY_AMOY_URL || "https://rpc-amoy.polygon.technology";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (process.env.PRIVATE_KEY) {
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    } else {
      console.warn("⚠️ No PRIVATE_KEY provided in .env. Write operations will fail.");
    }

    this.contractAddress = process.env.CONTRACT_ADDRESS;
    if (this.contractAddress) {
      this.contract = new ethers.Contract(
        this.contractAddress, 
        contractABI, 
        this.signer || this.provider
      );
    } else {
      console.warn("⚠️ No CONTRACT_ADDRESS provided in .env. Service is not fully initialized.");
    }
  }

  async storeHashOnChain(propertyId, documentHash) {
    if (!this.contract || !this.signer) {
        throw new Error("BlockchainService is not configured for write operations. Check PRIVATE_KEY and CONTRACT_ADDRESS in .env.");
    }
    
    console.log(`[Blockchain] Committing hash for property ${propertyId}...`);
    const tx = await this.contract.commitHash(propertyId, documentHash);
    await tx.wait();
    console.log(`[Blockchain] Transaction confirmed: ${tx.hash}`);
    return tx.hash;
  }

  async verifyHashOnChain(propertyId) {
    if (!this.contract) {
        throw new Error("BlockchainService is not configured. Check CONTRACT_ADDRESS in .env.");
    }

    const [storedHash, timestampBigInt] = await this.contract.getHash(propertyId);
    
    return {
        hash: storedHash,
        timestamp: Number(timestampBigInt)
    };
  }
}

const blockchainService = new BlockchainService();
export default blockchainService;
