import express from "express";
import multer from "multer";
import { verifyFile } from "../controllers/verifyController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("file"), verifyFile);

export default router;