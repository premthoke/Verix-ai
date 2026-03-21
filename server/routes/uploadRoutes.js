const express = require("express");
const router = express.Router();

const upload = require("../utils/fileHandler");
const { uploadFile, verifyFile } = require("../controllers/uploadController");

router.post("/upload", upload.single("file"), uploadFile);
router.post("/verify", upload.single("file"), verifyFile); 

module.exports = router;