import { query } from "../db/index.js";

/**
 * Save a verification record to PostgreSQL, linked to the authenticated user.
 *
 * Called by uploadController after successful AI + hash + blockchain processing.
 * The userId comes from req.user.id (verified JWT) — never from the client body.
 * Throws on failure — the caller must handle the error and return 500.
 *
 * @param {{ userId: number, hash: string, result: string, confidence: number, time: string }} entry
 */
export const saveHistory = async (entry) => {
  await query(
    `INSERT INTO verifications (user_id, hash, result, confidence, timestamp)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      entry.userId,
      entry.hash,
      entry.result,
      entry.confidence ?? 0,
      entry.time ?? new Date().toISOString()
    ]
  );
  console.log("📜 History saved to database — user:", entry.userId, "hash:", entry.hash);
};

/**
 * Retrieve verification records for a specific authenticated user, newest first.
 *
 * Returns rows shaped to match the existing frontend format:
 *   { hash, result, confidence, time }
 *
 * user_id is NOT included in the response — the client already knows who they are.
 *
 * Throws on failure — the caller (history route) must return 500. Do NOT return
 * an empty array on DB failure; that silently hides errors.
 *
 * @param {number} userId — from req.user.id (verified JWT)
 * @returns {Promise<Array<{ hash, result, confidence, time }>>}
 */
export const getHistory = async (userId) => {
  const result = await query(
    `SELECT hash, result, confidence, timestamp AS time
     FROM verifications
     WHERE user_id = $1
     ORDER BY timestamp DESC`,
    [userId]
  );
  return result.rows;
};