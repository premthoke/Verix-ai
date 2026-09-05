import { detectDeepfake } from "../services/aiService.js";
import { generateHash } from "../services/hashService.js";
import { storeOnBlockchain } from "../services/blockchainService.js";
import { saveHistory } from "../services/historyService.js";

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

    // AI detection
    const aiResult = await detectDeepfake(buffer);

    // SHA-256 hash — unchanged, still sent to blockchain
    const hash = generateHash(buffer);

    // Blockchain — continues to receive hash + result (unchanged)
    await storeOnBlockchain(hash, aiResult.result);

    // Persist to DB — saveHistory returns the generated verificationId
    const verificationId = await saveHistory({
      userId,
      hash,
      result: aiResult.result,
      confidence: aiResult.confidence,
      time: new Date().toISOString()
    });

    // Response includes verificationId alongside existing ai and hash fields
    res.json({
      verificationId,
      ai: aiResult,
      hash
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error.message);

    res.status(500).json({
      error: "Upload failed",
      details: error.message
    });
  }
};