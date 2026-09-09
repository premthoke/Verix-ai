/**
 * MediaVerify deployment script — Hardhat 3
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network sepolia
 *
 * Prerequisites:
 *   1. Copy blockchain/.env.example → blockchain/.env
 *   2. Fill in SEPOLIA_RPC_URL and PRIVATE_KEY (never commit .env)
 *   3. Ensure the deployer wallet has Sepolia ETH
 *      (get free at https://sepoliafaucet.com)
 *   4. npm install in blockchain/
 *   5. npx hardhat compile
 *
 * The deployer wallet becomes the contract owner.
 * The same PRIVATE_KEY must be set on Render as the backend signer.
 *
 * After deployment, update Render environment variables:
 *   CONTRACT_ADDRESS = <printed address>
 *   RPC_URL          = <your SEPOLIA_RPC_URL>
 *   PRIVATE_KEY      = <same key used here>
 */
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying MediaVerify from:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error(
      "Deployer wallet has 0 ETH. Get Sepolia ETH from https://sepoliafaucet.com"
    );
  }

  // Deploy — pass deployer as initialOwner so only this wallet can call storeMedia()
  const MediaVerify = await ethers.getContractFactory("MediaVerify");
  const contract = await MediaVerify.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅ Contract deployed to:", address);
  console.log("\nUpdate Render environment variables:");
  console.log("  CONTRACT_ADDRESS =", address);
  console.log("  RPC_URL          = <your SEPOLIA_RPC_URL>");
  console.log("  PRIVATE_KEY      = <same key used to deploy>\n");
}

main().catch((err) => {
  console.error("Deployment failed:", err.message);
  process.exitCode = 1;
});