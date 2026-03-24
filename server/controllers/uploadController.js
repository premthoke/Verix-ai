const { generateHash } = require("../services/hashService");
const { detectDeepfake } = require("../services/aiService");

const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔥 AI Detection
    const aiResult = await detectDeepfake(file);

    // 🔐 Hash
    const hash = generateHash(file.buffer);

    res.json({
      message: "File processed successfully",
      hash: hash,
      result: aiResult.result,
      confidence: aiResult.confidence
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile };