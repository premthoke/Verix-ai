import express from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { upload } from "../middleware/multerConfig.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/upload
// authMiddleware runs first: verifies JWT, attaches req.user.id
// upload.single("file"): parses the multipart file
// uploadFile: performs AI detection, hash, blockchain, and saves to DB with user_id
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);

export default router;