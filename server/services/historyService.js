import { randomUUID } from "crypto";
import { query } from "../db/index.js";

/**
 * Save a verification record to PostgreSQL, linked to the authenticated user.
 *
 * The verificationId is generated server-side using crypto.randomUUID() (Node 18+,
 * no external dependencies). The client never supplies or controls this value.
 *
 * Returns the generated verificationId so the controller can include it in the
 * HTTP response.
 *
 * @param {{ userId: number, hash: string, result: string, confidence: number, time: string }} entry
 * @returns {Promise<string>} The UUID verification ID of the saved record
 */
export const saveHistory = async (entry) => {
  const verificationId = randomUUID();

  await query(
    `INSERT INTO verifications (verification_id, user_id, hash, result, confidence, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      verificationId,
      entry.userId,
      entry.hash,
      entry.result,
      entry.confidence ?? 0,
      entry.time ?? new Date().toISOString()
    ]
  );

  console.log("📜 History saved — user:", entry.userId, "verificationId:", verificationId);
  return verificationId;
};

/**
 * Retrieve verification records for a specific authenticated user, newest first.
 *
 * Returns rows shaped to match the existing frontend format, plus verificationId:
 *   { verificationId, hash, result, confidence, time }
 *
 * user_id is NOT included — the client already knows who they are.
 * password_hash, JWT internals, and credentials are never included.
 *
 * @param {number} userId — from req.user.id (verified JWT)
 * @returns {Promise<Array<{ verificationId, hash, result, confidence, time }>>}
 */
export const getHistory = async (userId) => {
  const result = await query(
    `SELECT verification_id AS "verificationId", hash, result, confidence, timestamp AS time
     FROM verifications
     WHERE user_id = $1
     ORDER BY timestamp DESC`,
    [userId]
  );
  return result.rows;
};