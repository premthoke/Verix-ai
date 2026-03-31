import { verifyFromBlockchain } from "../services/blockchainService.js";
import { generateHash } from "../services/hashService.js";

export const verifyFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const hash = generateHash(file.path);

    const data = await verifyFromBlockchain(hash);

    if (!data) {
      return res.json({
        status: "Not Found",
        hash
      });
    }

    return res.json({
      status: "Verified",
      hash,
      result: data
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
};