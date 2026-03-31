import express from "express";
import { getHistory } from "../services/historyService.js";

const router = express.Router();

// ✅ HISTORY ROUTE
router.get("/history", (req, res) => {
  try {
    const history = getHistory();
    res.json(history);
  } catch (err) {
    console.error("HISTORY ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch history"
    });
  }
});

export default router;