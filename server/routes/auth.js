import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = new Router();

// POST /api/auth/register
router.post("/auth/register", register);

// POST /api/auth/login
router.post("/auth/login", login);

// GET /api/auth/me  (protected — requires valid JWT)
router.get("/auth/me", authMiddleware, me);

export default router;
