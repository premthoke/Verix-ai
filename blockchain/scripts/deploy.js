import { network } from "hardhat";

async function main() {
  // Hardhat 3: ethers is provided by the network connection.
  const { ethers } = await network.create();

  const [deployer] = await ethers.getSigners();

  console.log("Deploying MediaVerify...");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(
    "Deployer balance:",
    ethers.formatEther(balance),
    "SepoliaETH"
  );

  if (balance === 0n) {
    throw new Error(
      "Deployer wallet has no SepoliaETH."
    );
  }

  const MediaVerify = await ethers.getContractFactory("MediaVerify");

  const mediaVerify = await MediaVerify.deploy(deployer.address);

  console.log("Waiting for deployment confirmation...");

  await mediaVerify.waitForDeployment();

  const contractAddress = await mediaVerify.getAddress();

  console.log("");
  console.log("========================================");
  console.log("MediaVerify deployed successfully!");
  console.log("========================================");
  console.log("Contract address:", contractAddress);

  const deploymentTx = mediaVerify.deploymentTransaction();

  if (deploymentTx) {
    console.log("Transaction hash:", deploymentTx.hash);
  }

  console.log("");
  console.log(
    `Set CONTRACT_ADDRESS=${contractAddress} in the server environment.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});