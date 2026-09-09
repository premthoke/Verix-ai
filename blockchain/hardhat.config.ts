import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.20",
  networks: {
    // Sepolia testnet — use for production-style testing before mainnet.
    // Hardhat 3 requires type: "http" for external RPC networks.
    // Set SEPOLIA_RPC_URL and PRIVATE_KEY in blockchain/.env (never commit .env).
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY
        ? [`0x${process.env.PRIVATE_KEY.replace(/^0x/, "")}`]
        : []
    }
  }
};