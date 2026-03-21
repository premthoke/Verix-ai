const { storeOnBlockchain, verifyFromBlockchain } = require("../services/blockchainService");
const { generateHash } = require("../services/hashService");
const { detectFake } = require("../services/aiService");

const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const hash = generateHash(file.buffer);
    const aiResult = await detectFake(file);

    await storeOnBlockchain(hash, aiResult.result);

    res.json({
      message: "File processed successfully",
      hash,
      ai: aiResult,
      blockchain: "stored"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const verifyFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const hash = generateHash(file.buffer);

    console.log("Hash:", hash);

    const data = await verifyFromBlockchain(hash);

    console.log("Blockchain Data:", data);

    if (!data || !data[0]) {
      return res.json({
        status: "Not Found",
        message: "No record on blockchain"
      });
    }

    return res.json({
      status: "Verified",
      hash,
      result: data[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile, verifyFile };