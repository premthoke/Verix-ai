import express from "express";
import { getHistory } from "../services/historyService.js";

const router = express.Router();

// GET /api/history
// getHistory() is async — must be awaited.
// On DB failure, historyService throws; we return 500 with a safe message.
// Database error details are logged server-side only — never sent to the client.
router.get("/history", async (req, res) => {
  try {
    const history = await getHistory();
    res.json(history);
  } catch (err) {
    console.error("❌ HISTORY ERROR:", err.message);
    res.status(500).json({
      error: "Failed to fetch history"
    });
  }
});

export default router;