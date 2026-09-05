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
 *  verifications.user_id         — nullable FK to users(id) (Brick 3)
 *  verifications.verification_id — UUID unique identifier (Brick 4)
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

  // ── Brick 3: user_id FK ─────────────────────────────────────────────────────
  // Nullable: pre-Brick-3 anonymous records have no owner.
  await query(`
    ALTER TABLE verifications
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
  `);
  console.log("✅ verifications.user_id column ready");

  // ── Brick 4: verification_id UUID ───────────────────────────────────────────
  // DEFAULT gen_random_uuid() backfills all existing rows automatically in one
  // atomic operation. gen_random_uuid() is available on Neon without extension.
  // UNIQUE constraint ensures no two verifications share an ID.
  // Nullable=YES for historical records already had gen_random_uuid() applied;
  // new INSERTs always provide an explicit UUID from server-side crypto.randomUUID().
  await query(`
    ALTER TABLE verifications
    ADD COLUMN IF NOT EXISTS verification_id UUID UNIQUE DEFAULT gen_random_uuid();
  `);
  console.log("✅ verifications.verification_id column ready");
};
