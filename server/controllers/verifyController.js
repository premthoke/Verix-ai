import { generateHash } from "../services/hashService.js";
import { verifyFromBlockchain } from "../services/blockchainService.js";

export const verifyFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = file.buffer;

    const hash = generateHash(buffer);

    const result = await verifyFromBlockchain(hash);

    if (!result) {
      return res.json({
        verified: false,
        message: "No record found on blockchain"
      });
    }

    res.json({
      verified: true,
      result
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    res.status(500).json({
      error: "Verification failed",
      details: error.message
    });
  }
};