import express from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { upload } from "../middleware/multerConfig.js";

const router = express.Router();

// ✅ IMPORTANT: use multer middleware here
router.post("/upload", upload.single("file"), uploadFile);

export default router;