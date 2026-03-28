import express from "express";
import { verifyFile } from "../controllers/verifyController.js";
import { upload } from "../utils/fileHandler.js";

const router = express.Router();

// 🔥 ADD THIS LINE
router.post("/", upload.single("file"), verifyFile);

export default router;