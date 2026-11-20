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
//   3. Vercel preview deployments — project slug "verix-ai", team slug "premthoke"
//      Pattern: https://verix-ai-<hash|branch>-premthoke.vercel.app
//      Regex anchored to both slugs; only [a-z0-9-] between them.
//   4. Vercel preview deployments — project slug "verix", team slug "premthokes-projects"
//      Pattern: https://verix-<hash>-premthokes-projects.vercel.app
//      Vercel generates a separate team slug ("premthokes-projects") for the
//      personal team on some deployment contexts.  The hash segment is [a-z0-9]+
//      (Vercel uses lowercase alphanumeric only for deployment hashes).
//      Anchored to both the project slug and the full team slug so that
//      unrelated projects or teams cannot match.
const PREVIEW_ORIGIN_REGEX =
  /^https:\/\/verix-ai-[a-z0-9-]+-premthoke\.vercel\.app$/;

const PREVIEW_ORIGIN_REGEX_ALT =
  /^https:\/\/verix-[a-z0-9]+-premthokes-projects\.vercel\.app$/;

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (origin === "http://localhost:5173") return true;
  if (origin === "https://verix-ai.vercel.app") return true;
  if (PREVIEW_ORIGIN_REGEX.test(origin)) return true;
  if (PREVIEW_ORIGIN_REGEX_ALT.test(origin)) return true;
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

// ── Preflight OPTIONS handling ────────────────────────────────────────────────
// cors() with preflightContinue: false (the default) intercepts every
// OPTIONS request inside app.use(cors({...})) above, responds with 204, and
// calls next() only for non-OPTIONS requests.  No separate app.options() route
// is needed and — as of Express 5 / path-to-regexp v8 — app.options("*", ...)
// raises a PathError because bare "*" is no longer a valid route pattern.

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
// Handles:
//   - UNSUPPORTED_MIME_TYPE : multer fileFilter rejected the file → 400
//   - LIMIT_FILE_SIZE       : file exceeded the 5 MB limit → 400
//   - entity.parse.failed   : body-parser v2 JSON parse error → 400
//     body-parser forwards parse errors via next(err) with err.status=400
//     and err.type='entity.parse.failed' but err.code=undefined, so they
//     must be detected by err.type rather than err.code.
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
  // body-parser v2 JSON parse failure — malformed request body from client.
  // err.code is undefined for these errors; detect by err.type instead.
  if (err.status === 400 && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body." });
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
