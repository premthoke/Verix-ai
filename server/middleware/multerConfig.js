import multer from "multer";

// ✅ MEMORY STORAGE (IMPORTANT FOR DEPLOYMENT)
const storage = multer.memoryStorage();

// Supported MIME types — must match aiService.js SUPPORTED_MIME_TYPES.
// Multer fileFilter is the first gate; aiService validates again defensively.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/tiff",
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass an error — multer will reject the upload and forward to Express
    // error handling. Do not call cb(null, false) silently.
    cb(
      Object.assign(
        new Error(
          `Unsupported file type: ${file.mimetype}. ` +
          `Accepted: ${[...ALLOWED_MIME_TYPES].join(", ")}`
        ),
        { code: "UNSUPPORTED_MIME_TYPE", status: 400 }
      )
    );
  }
};

// ✅ EXPORT MIDDLEWARE
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});