import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;

/**
 * Normalize email: trim whitespace and lowercase.
 */
const normalizeEmail = (email) => email.trim().toLowerCase();

/**
 * Build a safe user object — never includes password_hash.
 */
const safeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at,
});

/**
 * Sign a JWT for a given userId.
 * Payload is minimal — only userId.
 * Secret and expiry come from environment — never hardcoded.
 */
const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, secret, { expiresIn });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // ── Validate email format
    const normalized = normalizeEmail(email);
    if (!EMAIL_REGEX.test(normalized)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // ── Validate password minimum policy: at least 8 characters
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // ── Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: "Name must be between 2 and 100 characters" });
    }

    // ── Check for existing account (duplicate email)
    const existing = await query(
      "SELECT id FROM users WHERE email = $1",
      [normalized]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // ── Hash password — never store plaintext
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // ── Insert user
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), normalized, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user.id);

    console.log("✅ New user registered:", user.id);

    return res.status(201).json({
      token,
      user: safeUser(user),
    });

  } catch (err) {
    // Never expose DB errors, stack traces, or password hashes
    console.error("❌ REGISTER ERROR:", err.message);
    return res.status(500).json({ error: "Registration failed" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalized = normalizeEmail(email);

    // ── Look up user
    const result = await query(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
      [normalized]
    );

    // ── Always compare (prevents timing attacks from short-circuiting on missing user)
    const dummyHash = "$2a$12$invalidhashfortimingprotection000000000000000000000000";
    const storedHash = result.rows[0]?.password_hash ?? dummyHash;
    const match = await bcrypt.compare(password, storedHash);

    // ── Do NOT reveal whether email or password was wrong
    if (!result.rows[0] || !match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const token = signToken(user.id);

    console.log("✅ User logged in:", user.id);

    return res.json({
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

export const me = async (req, res) => {
  try {
    // req.user is set by authMiddleware — contains { id }
    const result = await query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: safeUser(result.rows[0]) });

  } catch (err) {
    console.error("❌ ME ERROR:", err.message);
    return res.status(500).json({ error: "Failed to load user" });
  }
};
