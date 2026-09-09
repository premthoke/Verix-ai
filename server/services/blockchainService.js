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

  const RPC_URL         = process.env.RPC_URL;
  const PRIVATE_KEY     = process.env.PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error(
      "Blockchain not configured. Set RPC_URL, PRIVATE_KEY and CONTRACT_ADDRESS in .env"
    );
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  return contract;
};

// ── SUBMIT ────────────────────────────────────────────────────────────────────
/**
 * Submit a media verification record to the blockchain.
 *
 * Returns the transaction object IMMEDIATELY after submission — before
 * waiting for confirmation. The caller is responsible for:
 *   1. Saving tx.hash to the database
 *   2. Calling tx.wait() to wait for confirmation
 *   3. Updating blockchain_status to 'confirmed' or 'failed'
 *
 * This design means the tx hash is always available even if confirmation fails.
 *
 * Throws on failure — callers must handle errors. Does NOT silently swallow
 * errors so that the caller can correctly record 'failed' status in PostgreSQL.
 *
 * @param {string} hash   — SHA-256 hex hash of the uploaded file
 * @param {string} result — AI detection result ("Real" or "Fake")
 * @returns {Promise<ethers.TransactionResponse>} The submitted transaction
 */
export const submitToBlockchain = async (hash, result) => {
  const c = getContract();
  console.log("🚀 Submitting to blockchain:", hash.slice(0, 16) + "...", result);
  const tx = await c.storeMedia(hash, result);
  console.log("📡 Transaction submitted:", tx.hash);
  return tx;
};

// ── VERIFY ────────────────────────────────────────────────────────────────────
/**
 * Look up a stored AI result from the blockchain by file hash.
 * Used by POST /api/verify (blockchain file verification endpoint).
 *
 * Returns null on error or if no record exists — caller handles gracefully.
 *
 * @param {string} hash — SHA-256 hex hash of the file
 * @returns {Promise<string|null>} The stored result string, or null
 */
export const verifyFromBlockchain = async (hash) => {
  try {
    const c = getContract();
    const data = await c.verifyMedia(hash);

    if (!data || data === "") {
      console.log("⚠️ No blockchain record found for hash:", hash.slice(0, 16) + "...");
      return null;
    }

    console.log("✅ Blockchain record found:", data);
    return data;
  } catch (err) {
    console.log("❌ BLOCKCHAIN VERIFY ERROR:", err.message);
    return null;
  }
};