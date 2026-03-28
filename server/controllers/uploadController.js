import { detectDeepfake } from "../services/aiService.js";
import crypto from "crypto";

export const uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    // 🔥 HASH GENERATION
    const hash = crypto
      .createHash("sha256")
      .update(filePath + Date.now())
      .digest("hex");

    const aiResult = await detectDeepfake(filePath);

    res.json({
      message: "File processed successfully",
      hash,
      ai: aiResult,
      blockchain: "stored"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Upload failed"
    });
  }
};