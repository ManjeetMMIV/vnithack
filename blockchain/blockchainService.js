import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Contract ABI (minimal needed for the bridge)
const contractABI = [
  "function commitHash(string propertyId, string documentHash) public",
  "function getHash(string propertyId) public view returns (string, uint256)",
  "event HashCommitted(string propertyId, string documentHash, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    // URL for Polygon Amoy Testnet (use Alchemy or the public RPC fallback)
    const rpcUrl = process.env.ALCHEMY_AMOY_URL || "https://rpc-amoy.polygon.technology";
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize signer if private key is provided (required for write operations)
    if (process.env.PRIVATE_KEY) {
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    } else {
      console.warn("⚠️ No PRIVATE_KEY provided in .env. Write operations will fail.");
    }

    // Initialize contract instance
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    if (this.contractAddress) {
      // Use signer if available for read/write, else use provider for read-only
      this.contract = new ethers.Contract(
        this.contractAddress, 
        contractABI, 
        this.signer || this.provider
      );
    } else {
      console.warn("⚠️ No CONTRACT_ADDRESS provided in .env. Service is not fully initialized.");
    }
  }

  /**
   * Commits a SHA-256 hash to the blockchain for a given property ID
   * @param {string} propertyId 
   * @param {string} documentHash 
   * @returns {Promise<ethers.TransactionReceipt>}
   */
  async storeHashOnChain(propertyId, documentHash) {
    if (!this.contract || !this.signer) {
        throw new Error("BlockchainService is not configured for write operations. Check PRIVATE_KEY and CONTRACT_ADDRESS in .env.");
    }
    
    console.log(`Committing hash for property ${propertyId}...`);
    const tx = await this.contract.commitHash(propertyId, documentHash);
    console.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    return receipt;
  }

  /**
   * Retrieves the stored hash and timestamp from the blockchain
   * @param {string} propertyId 
   * @returns {Promise<{hash: string, timestamp: number}>}
   */
  async verifyHashOnChain(propertyId) {
    if (!this.contract) {
        throw new Error("BlockchainService is not configured. Check CONTRACT_ADDRESS in .env.");
    }

    console.log(`Verifying hash for property ${propertyId}...`);
    const [storedHash, timestampBigInt] = await this.contract.getHash(propertyId);
    
    return {
        hash: storedHash,
        timestamp: Number(timestampBigInt)
    };
  }
}

const blockchainService = new BlockchainService();
export default blockchainService;
