import express from "express";
import { getHistory } from "../services/historyService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/history
// authMiddleware verifies JWT and attaches req.user = { id }.
// Returns ONLY records belonging to the authenticated user.
// A user can never retrieve another user's verification history.
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await getHistory(req.user.id);
    res.json(history);
  } catch (err) {
    console.error("❌ HISTORY ERROR:", err.message);
    res.status(500).json({
      error: "Failed to fetch history"
    });
  }
});

export default router;