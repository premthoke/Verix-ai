import { detectDeepfake } from "../services/aiService.js";

export const uploadFile = async (req, res) => {
  try {
    const imageUrl = req.file.path;

    const aiResult = await detectDeepfake(imageUrl);

    console.log("FINAL AI RESULT:", aiResult);

    res.json({
      message: "File processed successfully",
      hash: "somehash",
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