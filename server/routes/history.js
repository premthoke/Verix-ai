import express from "express";
import { getHistory } from "../services/historyService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const history = getHistory();
  res.json(history);
});

export default router;