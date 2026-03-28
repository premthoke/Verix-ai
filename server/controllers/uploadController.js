import { detectDeepfake } from "../services/aiService.js";

export const uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    const aiResult = await detectDeepfake(filePath);

    res.json({
      message: "File processed successfully",
      hash: "demo_hash_" + Date.now(),
      ai: aiResult,
      blockchain: "stored"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};