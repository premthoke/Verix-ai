const crypto = require("crypto");

const generateHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

module.exports = { generateHash };