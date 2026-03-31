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

    // AI
    const aiResult = await detectDeepfake(buffer);

    // HASH
    const hash = generateHash(buffer);

    // BLOCKCHAIN
    await storeOnBlockchain(hash, aiResult.result);

    // HISTORY
    saveHistory({
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
    console.error("UPLOAD ERROR:", error);

    res.status(500).json({
      error: "Upload failed",
      details: error.message
    });
  }
};