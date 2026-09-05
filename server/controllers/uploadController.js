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

    // AI
    const aiResult = await detectDeepfake(buffer);

    // HASH
    const hash = generateHash(buffer);

    // BLOCKCHAIN
    await storeOnBlockchain(hash, aiResult.result);

    // HISTORY — await so DB failures are caught and returned as 500
    await saveHistory({
      userId,
      hash,
      result: aiResult.result,
      confidence: aiResult.confidence,
      time: new Date().toISOString()
    });

    res.json({
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