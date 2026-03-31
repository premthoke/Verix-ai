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

    const filePath = file.path;

    const aiResult = await detectDeepfake(filePath);
    console.log("AI RESULT:", aiResult);

    const hash = generateHash(filePath);
    console.log("HASH:", hash);

    await storeOnBlockchain(hash, aiResult.result);

    // 🔥 SAVE HISTORY
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
    console.error("UPLOAD ERROR:", error.message);

    res.status(500).json({
      error: "Upload failed",
      details: error.message
    });
  }
};