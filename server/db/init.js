import { query } from "./index.js";

/**
 * Initialize all required database tables.
 * Idempotent — safe to call on every server startup.
 * Throws on failure — caller (app.js) must process.exit(1).
 *
 * Tables:
 *
 *  verifications — Brick 1: AI detection results + hashes
 *  users         — Brick 2: registered user accounts
 */
export const initDB = async () => {
  // ── Brick 1: verifications ──────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS verifications (
      id          SERIAL       PRIMARY KEY,
      hash        VARCHAR(64)  NOT NULL,
      result      VARCHAR(20)  NOT NULL,
      confidence  NUMERIC(5,4) NOT NULL DEFAULT 0,
      timestamp   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ verifications table ready");

  // ── Brick 2: users ──────────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL       PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ users table ready");
};
