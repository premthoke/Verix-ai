const { ethers } = require("ethers");

// 🔥 Replace with your deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ABI (only required functions)
const abi = [
  "function storeMedia(string _hash, string _result)",
  "function verifyMedia(string _hash) view returns (string, uint)"
];

// Hardhat local node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 🔥 Replace with your private key (from hardhat node)
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const wallet = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(contractAddress, abi, wallet);

// 🔥 Store data on blockchain
const storeOnBlockchain = async (hash, result) => {
  const tx = await contract.storeMedia(hash, result);
  await tx.wait();
};

// 🔥 Verify data
const verifyFromBlockchain = async (hash) => {
  const data = await contract.verifyMedia(hash);
  return data;
};

module.exports = { storeOnBlockchain, verifyFromBlockchain };