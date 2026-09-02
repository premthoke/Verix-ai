import { query } from "../db/index.js";

/**
 * Save a verification record to PostgreSQL.
 *
 * Called by uploadController after successful AI + hash + blockchain processing.
 * Throws on failure — the caller must handle the error and return an appropriate
 * HTTP response. Do NOT silently swallow this error.
 *
 * @param {{ hash: string, result: string, confidence: number, time: string }} entry
 */
export const saveHistory = async (entry) => {
  await query(
    `INSERT INTO verifications (hash, result, confidence, timestamp)
     VALUES ($1, $2, $3, $4)`,
    [
      entry.hash,
      entry.result,
      entry.confidence ?? 0,
      entry.time ?? new Date().toISOString()
    ]
  );
  console.log("📜 History saved to database:", entry.hash);
};

/**
 * Retrieve all verification records, newest first.
 *
 * Returns rows shaped to match the original JSON-file format so the frontend
 * requires no changes:
 *   { hash, result, confidence, time }
 *
 * Throws on failure — the caller (history route) must handle the error and
 * return a 500 response. Do NOT return an empty array on DB failure.
 *
 * @returns {Promise<Array<{ hash, result, confidence, time }>>}
 */
export const getHistory = async () => {
  const result = await query(
    `SELECT hash, result, confidence, timestamp AS time
     FROM verifications
     ORDER BY timestamp DESC`
  );
  return result.rows;
};