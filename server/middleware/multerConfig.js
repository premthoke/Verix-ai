import multer from "multer";

// ✅ MEMORY STORAGE (IMPORTANT FOR DEPLOYMENT)
const storage = multer.memoryStorage();

// ✅ EXPORT MIDDLEWARE
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // optional (5MB limit)
  }
});