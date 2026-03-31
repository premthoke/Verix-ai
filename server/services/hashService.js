import crypto from "crypto";

// ✅ WORKS WITH BUFFER (NOT PATH)
export const generateHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};