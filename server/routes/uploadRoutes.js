import express from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { upload } from "../utils/fileHandler.js";

const router = express.Router();

// POST /api/upload
router.post("/", upload.single("file"), uploadFile);

export default router;