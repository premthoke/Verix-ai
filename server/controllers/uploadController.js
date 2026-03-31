import { detectDeepfake } from "../services/aiService.js";
import { generateHash } from "../services/hashService.js";
import { storeOnBlockchain } from "../services/blockchainService.js";
import { saveHistory } from "../services/historyService.js";

export const uploadFile = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("FILE RECEIVED:", file.originalname);
    console.log("FILE SIZE:", file.buffer.length);

    // ✅ USE BUFFER
    const aiResult = await detectDeepfake(file.buffer);
    console.log("AI RESULT:", aiResult);

    // hash
    const hash = generateHash(file.buffer);
    console.log("HASH:", hash);

    // blockchain (optional in production)
    await storeOnBlockchain(hash, aiResult.result);

    // history
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