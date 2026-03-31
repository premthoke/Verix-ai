import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import fs from "fs";

// DEBUG (REMOVE LATER)
console.log("ENV PRIVATE KEY:", process.env.PRIVATE_KEY);

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// load ABI
const contractJSON = JSON.parse(
  fs.readFileSync(new URL("../abi/MediaVerify.json", import.meta.url))
);

const ABI = contractJSON.abi;

// provider + wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// STORE
export const storeOnBlockchain = async (hash, result) => {
  try {
    console.log("🚀 Storing:", hash, result);

    const tx = await contract.storeMedia(hash, result);
    await tx.wait();

    console.log("✅ Stored on blockchain");
  } catch (err) {
    console.log("❌ STORE ERROR:", err.message);
  }
};

// VERIFY
export const verifyFromBlockchain = async (hash) => {
  try {
    const data = await contract.verifyMedia(hash);

    if (!data || data === "") {
      console.log("⚠️ No record found");
      return null;
    }

    console.log("RAW BLOCKCHAIN DATA:", data);
    return data;
  } catch (err) {
    console.log("❌ VERIFY ERROR:", err.message);
    return null;
  }
};