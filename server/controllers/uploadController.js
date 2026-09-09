import { detectDeepfake }       from "../services/aiService.js";
import { generateHash }          from "../services/hashService.js";
import { submitToBlockchain }    from "../services/blockchainService.js";
import {
  saveHistory,
  updateBlockchainStatus
}                                from "../services/historyService.js";

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("FILE RECEIVED:", file.originalname);

    const buffer = file.buffer;

    // userId comes exclusively from the verified JWT via authMiddleware.
    // NEVER read from req.body, req.query, or any client-supplied source.
    const userId = req.user.id;

    // ── Step 1: AI detection ─────────────────────────────────────────────────
    const aiResult = await detectDeepfake(buffer);

    // ── Step 2: SHA-256 hash — unchanged, still sent to blockchain ───────────
    const hash = generateHash(buffer);

    // ── Step 3: PostgreSQL INSERT — status = 'pending' ───────────────────────
    // Record is created in DB BEFORE the blockchain write.
    // This guarantees the verificationId exists even if blockchain fails.
    const verificationId = await saveHistory({
      userId,
      hash,
      result:     aiResult.result,
      confidence: aiResult.confidence,
      time:       new Date().toISOString()
    });

    // ── Step 4: Blockchain write with status tracking ─────────────────────────
    // Ordered flow:
    //   a. Submit tx → get tx.hash immediately (before confirmation)
    //   b. Save tx.hash to DB (still 'pending')
    //   c. await tx.wait() → block until Sepolia confirms
    //   d. Update DB to 'confirmed'
    //   On any error → update DB to 'failed' (tx.hash stored if submission succeeded)
    let txHash          = null;
    let blockchainStatus = "failed"; // default — overwritten on success

    try {
      // a. Submit — throws if RPC unavailable or contract call reverts
      const tx = await submitToBlockchain(hash, aiResult.result);
      txHash = tx.hash;

      // b. tx.hash is now known — save it while still pending
      await updateBlockchainStatus(verificationId, txHash, "pending");

      // c. Wait for on-chain confirmation (synchronous for Brick 7)
      await tx.wait();

      // d. Confirmed
      blockchainStatus = "confirmed";
      await updateBlockchainStatus(verificationId, txHash, "confirmed");

    } catch (blockchainErr) {
      // Blockchain error must NOT block the upload response.
      // The verificationId and DB record are permanent regardless.
      console.error("❌ BLOCKCHAIN ERROR:", blockchainErr.message);

      // Update status to 'failed' — preserve txHash if tx was submitted before error
      await updateBlockchainStatus(verificationId, txHash, "failed").catch((dbErr) => {
        console.error("❌ Failed to update blockchain status:", dbErr.message);
      });
    }

    // ── Step 5: Response ──────────────────────────────────────────────────────
    res.json({
      verificationId,
      ai:               aiResult,
      hash,
      txHash,
      blockchainStatus
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error.message);

    res.status(500).json({
      error:   "Upload failed",
      details: error.message
    });
  }
};