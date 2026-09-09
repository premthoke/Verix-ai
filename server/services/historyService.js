import { randomUUID } from "crypto";
import { query } from "../db/index.js";

/**
 * Save a new verification record to PostgreSQL with blockchain_status = 'pending'.
 *
 * The verificationId is generated server-side via crypto.randomUUID().
 * The userId comes from req.user.id (verified JWT) — never from the client.
 * blockchain_status starts as 'pending' — uploadController updates it to
 * 'confirmed' or 'failed' after the blockchain transaction resolves.
 *
 * Returns the verificationId so the controller can reference this record
 * for all subsequent blockchain status updates.
 *
 * @param {{ userId: number, hash: string, result: string, confidence: number, time: string }} entry
 * @returns {Promise<string>} The UUID verification ID of the saved record
 */
export const saveHistory = async (entry) => {
  const verificationId = randomUUID();

  await query(
    `INSERT INTO verifications
       (verification_id, user_id, hash, result, confidence, timestamp, blockchain_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
    [
      verificationId,
      entry.userId,
      entry.hash,
      entry.result,
      entry.confidence ?? 0,
      entry.time ?? new Date().toISOString()
    ]
  );

  console.log("📜 Verification record created — id:", verificationId, "status: pending");
  return verificationId;
};

/**
 * Update the blockchain write status for a specific verification record.
 *
 * Called by uploadController in three situations:
 *   1. After tx is submitted (before tx.wait): txHash known, status='pending'
 *   2. After tx.wait() confirms: status='confirmed'
 *   3. After any blockchain error: status='failed', txHash may be null
 *
 * Safe to call in a catch block — errors are logged but not re-thrown so
 * the upload response is not blocked by a secondary DB failure.
 *
 * @param {string} verificationId — UUID of the record to update
 * @param {string|null} txHash    — Ethereum tx hash (0x...) or null if tx failed to submit
 * @param {string} status         — 'pending' | 'confirmed' | 'failed'
 */
export const updateBlockchainStatus = async (verificationId, txHash, status) => {
  await query(
    `UPDATE verifications
     SET tx_hash = $1, blockchain_status = $2
     WHERE verification_id = $3`,
    [txHash, status, verificationId]
  );
  console.log(`🔗 Blockchain status → ${status}${txHash ? ` tx:${txHash.slice(0, 12)}...` : ""}`);
};

/**
 * Retrieve verification records for a specific authenticated user, newest first.
 *
 * Returns rows shaped to match the existing frontend format, plus Brick 4/7 fields:
 *   { verificationId, hash, result, confidence, time, txHash, blockchainStatus }
 *
 * user_id and internal id are NOT included — the client already knows who they are.
 * password_hash, JWT internals, and credentials are never included.
 *
 * @param {number} userId — from req.user.id (verified JWT)
 * @returns {Promise<Array>}
 */
export const getHistory = async (userId) => {
  const result = await query(
    `SELECT
       verification_id   AS "verificationId",
       hash,
       result,
       confidence,
       timestamp         AS time,
       tx_hash           AS "txHash",
       blockchain_status AS "blockchainStatus"
     FROM verifications
     WHERE user_id = $1
     ORDER BY timestamp DESC`,
    [userId]
  );
  return result.rows;
};