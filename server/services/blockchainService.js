import { ethers } from "ethers";
import fs from "fs";

// Load ABI once at module level (reading a local file is safe at import time)
const contractJSON = JSON.parse(
  fs.readFileSync(new URL("../abi/MediaVerify.json", import.meta.url))
);
const ABI = contractJSON.abi;

// ── Lazy initialisation ───────────────────────────────────────────────────────
// Provider, wallet and contract are created on first use, not at import time.
// This prevents the module from crashing during server startup when blockchain
// env vars (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS) are not yet configured.
let contract = null;

const getContract = () => {
  if (contract) return contract;

  const RPC_URL = process.env.RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error(
      "Blockchain not configured. Set RPC_URL, PRIVATE_KEY and CONTRACT_ADDRESS in .env"
    );
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  return contract;
};

// ── STORE ─────────────────────────────────────────────────────────────────────
export const storeOnBlockchain = async (hash, result) => {
  try {
    const c = getContract();
    console.log("🚀 Storing on blockchain:", hash, result);
    const tx = await c.storeMedia(hash, result);
    await tx.wait();
    console.log("✅ Stored on blockchain");
  } catch (err) {
    console.log("❌ BLOCKCHAIN STORE ERROR:", err.message);
    // Non-fatal for now — blockchain errors don't prevent the upload response.
    // In production this should be queued for retry (Brick 8).
  }
};

// ── VERIFY ────────────────────────────────────────────────────────────────────
export const verifyFromBlockchain = async (hash) => {
  try {
    const c = getContract();
    const data = await c.verifyMedia(hash);

    if (!data || data === "") {
      console.log("⚠️ No blockchain record found for hash:", hash);
      return null;
    }

    console.log("✅ Blockchain record found:", data);
    return data;
  } catch (err) {
    console.log("❌ BLOCKCHAIN VERIFY ERROR:", err.message);
    return null;
  }
};