import { verifyFromBlockchain } from "../services/blockchainService.js";
import { generateHash } from "../services/hashService.js";

export const verifyFile = async (req, res) => {
  try {
    const file = req.file;

if (!file) {
  return res.status(400).json({ message: "No file uploaded" });
}
    const hash = generateHash(file.buffer);

    const data = await verifyFromBlockchain(hash);

    

    if (!data || data === "") {
      return res.json({
        status: "Not Found",
        message: "No record on blockchain"
      });
    }

    return res.json({
      status: "Verified",
      hash,
      result: data.toString()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};