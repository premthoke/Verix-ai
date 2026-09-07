import { Router } from "express";
import { query } from "../db/index.js";

const router = new Router();

// UUID format validation — basic check before hitting the database
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/verify/:verificationId
 *
 * Public endpoint — no authentication required.
 * Anyone with a verificationId can look up the verification record.
 *
 * Returns a safe public response:
 *   { verificationId, hash, result, confidence, verifiedAt }
 *
 * Never returns: user_id, user name, user email, password_hash,
 *   internal database id, JWT, or any server credentials.
 *
 * 400 — verificationId is not a valid UUID format
 * 404 — no record found with that verificationId
 * 500 — database error (safe message only)
 */
router.get("/verify/:verificationId", async (req, res) => {
  const { verificationId } = req.params;

  // Reject obviously malformed IDs before touching the database
  if (!UUID_REGEX.test(verificationId)) {
    return res.status(400).json({ error: "Invalid verification ID format" });
  }

  try {
    const result = await query(
      `SELECT verification_id, hash, result, confidence, timestamp
       FROM verifications
       WHERE verification_id = $1`,
      [verificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Verification record not found" });
    }

    const row = result.rows[0];

    // Return safe public fields only — no user_id, no internal id, no personal data
    return res.json({
      verificationId: row.verification_id,
      hash: row.hash,
      result: row.result,
      confidence: parseFloat(row.confidence),
      verifiedAt: row.timestamp
    });

  } catch (err) {
    console.error("❌ PUBLIC VERIFY ERROR:", err.message);
    return res.status(500).json({ error: "Verification lookup failed" });
  }
});

export default router;
