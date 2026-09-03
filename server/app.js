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

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://verix-ai.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  })
);
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", uploadRoutes);
app.use("/api", verifyRoutes);
app.use("/api", historyRoutes);
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});