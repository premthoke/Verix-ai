import { detectDeepfake } from "../services/aiService.js";
import { generateHash } from "../services/hashService.js";
import { storeOnBlockchain } from "../services/blockchainService.js";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ create temp file (for AI API)
    const tempPath = `uploads/${Date.now()}.jpg`;
    fs.writeFileSync(tempPath, req.file.buffer);

    // ✅ generate hash
    const hash = generateHash(req.file.buffer);

    // ✅ AI detection
    const aiResult = await detectDeepfake(tempPath);

    console.log("AI RESULT:", aiResult);

    // ✅ store on blockchain
    await storeOnBlockchain(hash, aiResult.result);

    // cleanup temp file
    fs.unlinkSync(tempPath);

    res.json({
      message: "File processed successfully",
      hash,
      ai: aiResult,
      blockchain: "stored"
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};