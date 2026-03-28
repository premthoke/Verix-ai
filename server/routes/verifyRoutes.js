import express from "express";
import { verifyFile } from "../controllers/verifyController.js";

const router = express.Router();

router.post("/", verifyFile);

export default router;