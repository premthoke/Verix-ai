import { ethers } from "ethers";
import fs from "fs";

const contractJSON = JSON.parse(
  fs.readFileSync(new URL("../abi/MediaVerify.json", import.meta.url))
);

const contractABI = contractJSON.abi;

const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// STORE
export const storeOnBlockchain = async (hash, result) => {
  const tx = await contract.storeMedia(hash, result);
  await tx.wait();
  console.log("Stored:", hash);
};

// VERIFY
export const verifyFromBlockchain = async (hash) => {
  return await contract.verifyMedia(hash);
};