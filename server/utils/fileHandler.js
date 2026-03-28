import multer from "multer";

// ✅ Use MEMORY storage (BEST for cloud)
export const upload = multer({
  storage: multer.memoryStorage()
});