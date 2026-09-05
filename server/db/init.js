import { query } from "./index.js";

/**
 * Initialize all required database tables and run safe schema migrations.
 * Idempotent — safe to call on every server startup.
 * Throws on failure — caller (app.js) must process.exit(1).
 *
 * Tables:
 *  verifications — AI detection results + hashes (Brick 1)
 *  users         — registered user accounts (Brick 2)
 *
 * Migrations:
 *  verifications.user_id — nullable FK to users(id) (Brick 3)
 *    Nullable because 16 anonymous records from Brick 1 exist with no owner.
 *    New records always receive a user_id from the authenticated uploader.
 */
export const initDB = async () => {
  // ── Brick 1: verifications table ───────────────────────────────────────────
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

  // ── Brick 2: users table ────────────────────────────────────────────────────
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

  // ── Brick 3: add user_id FK to verifications ────────────────────────────────
  // Nullable because pre-Brick-3 records have no owner.
  // ALTER TABLE ... ADD COLUMN IF NOT EXISTS is idempotent (PostgreSQL 9.6+).
  // ON DELETE CASCADE: deleting a user also removes their verification records.
  await query(`
    ALTER TABLE verifications
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
  `);
  console.log("✅ verifications.user_id column ready");
};
