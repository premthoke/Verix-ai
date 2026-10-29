// ── Load environment variables ────────────────────────────────────────────────
// IMPORTANT: This must be the very first import in the entry point.
// In ES Modules, all `import` statements are hoisted and evaluated before any
// code runs. Using `import "dotenv/config"` ensures env vars are injected into
// process.env before any other module (including db/index.js) reads them.
import "dotenv/config";

import express from "express";
import cors from "cors";

import { initDB } from "./db/init.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import historyRoutes from "./routes/history.js";
import authRoutes from "./routes/auth.js";
import publicVerifyRoutes from "./routes/publicVerify.js";

// ── Database initialization ───────────────────────────────────────────────────
// Must run before the server begins accepting requests.
// If the database is unavailable, the application cannot operate correctly —
// history writes would silently fail and reads would return stale data.
// Fail fast so the problem is immediately visible in logs and deployment dashboards.
try {
  await initDB();
} catch (err) {
  console.error("❌ FATAL: Database initialization failed:", err.message);
  console.error("   Check DATABASE_URL and ensure the database is reachable.");
  process.exit(1);
}

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allowed origins:
//   1. Local development server (Vite default port)
//   2. Production Vercel deployment — exact match
//   3. Vercel preview deployments for this project only.
//      Pattern: https://verix-ai-<hash>-premthoke.vercel.app
//               https://verix-ai-git-<branch>-premthoke.vercel.app
//      The regex is anchored to the project slug ("verix-ai") and the team
//      slug ("premthoke") so previews from unrelated Vercel projects are rejected.
//      Only alphanumeric characters, hyphens, and dots are permitted between them
//      to guard against path traversal or injection.
const PREVIEW_ORIGIN_REGEX = /^https:\/\/verix-ai-[a-z0-9-]+-premthoke\.vercel\.app$/;

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (origin === "http://localhost:5173") return true;
  if (origin === "https://verix-ai.vercel.app") return true;
  if (PREVIEW_ORIGIN_REGEX.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      // origin is undefined for same-origin requests and server-to-server calls.
      // Allow those through so health checks and backend-internal routes work.
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        // Return false — cors will omit ACAO; browser blocks the response.
        // Do NOT throw here: that would send a 500 and potentially expose stack info.
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204, // IE11 chokes on 204; fine for modern browsers
  })
);

// Respond to preflight OPTIONS requests for all routes before any other handler.
// cors() sets preflightContinue: false by default (ends the request at 204).
// This explicit app.options() call ensures Express 5 also handles preflight
// for sub-router paths that do not register their own OPTIONS handler.
app.options("*", cors({
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", uploadRoutes);
app.use("/api", verifyRoutes);
app.use("/api", historyRoutes);
app.use("/api", authRoutes);
app.use("/api", publicVerifyRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Must be registered AFTER all routes. Four-argument signature is required
// by Express to recognize this as an error-handling middleware.
//
// Handles multer errors that bypass the upload controller's try/catch:
//   - UNSUPPORTED_MIME_TYPE : fileFilter rejected the file → 400
//   - LIMIT_FILE_SIZE       : file exceeded the 5 MB limit → 400
// All other errors fall through to a safe generic 500.
//
// Security: No stack traces, internal paths, or credential values are
// included in the client response under any branch.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err.code === "UNSUPPORTED_MIME_TYPE") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Maximum size is 5 MB." });
  }
  // Unexpected error — log server-side, never expose details to client.
  console.error("❌ UNHANDLED ERROR:", err.message);
  return res.status(500).json({ error: "An unexpected error occurred." });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
