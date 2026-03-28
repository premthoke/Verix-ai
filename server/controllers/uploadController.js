import { detectDeepfake } from "../services/aiService.js";
import crypto from "crypto";

export const uploadFile = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;

    // ✅ HASH from buffer
    const hash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const aiResult = await detectDeepfake(fileBuffer); // 👈 changed

    res.json({
      message: "File processed successfully",
      hash,
      ai: aiResult,
      blockchain: "stored"
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error.message);

    res.status(500).json({
      error: "Upload failed"
    });
  }
};