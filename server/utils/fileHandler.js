import multer from "multer";

// ✅ USE MEMORY STORAGE (IMPORTANT)
const storage = multer.memoryStorage();

export const upload = multer({ storage });