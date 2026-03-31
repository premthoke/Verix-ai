import express from "express";
import { verifyFile } from "../controllers/verifyController.js";
import { upload } from "../middleware/multerConfig.js";

const router = express.Router();

// ✅ VERIFY ROUTE
router.post("/verify", upload.single("file"), verifyFile);

export default router;