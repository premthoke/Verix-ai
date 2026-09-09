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
 *  verifications.tx_hash         — Ethereum transaction hash (Brick 7)
 *  verifications.blockchain_status — write lifecycle status (Brick 7)
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
  // DEFAULT gen_random_uuid() backfills all existing rows automatically.
  await query(`
    ALTER TABLE verifications
    ADD COLUMN IF NOT EXISTS verification_id UUID UNIQUE DEFAULT gen_random_uuid();
  `);
  console.log("✅ verifications.verification_id column ready");

  // ── Brick 7a: tx_hash ───────────────────────────────────────────────────────
  // Ethereum transaction hash (0x + 64 hex chars = 66 chars max).
  // NULL for pre-Brick-7 records (they have no tx hash).
  // Populated in two steps: once when tx is submitted, kept if confirmation fails.
  await query(`
    ALTER TABLE verifications
    ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66);
  `);
  console.log("✅ verifications.tx_hash column ready");

  // ── Brick 7b: blockchain_status ─────────────────────────────────────────────
  // Values: 'legacy' | 'pending' | 'confirmed' | 'failed'
  // legacy  — records that existed before Brick 7 (no blockchain status tracking)
  // pending — INSERT done, blockchain tx submitted but not yet confirmed
  // confirmed — tx confirmed on-chain
  // failed  — blockchain write failed; verificationId and DB record still exist
  await query(`
    ALTER TABLE verifications
    ADD COLUMN IF NOT EXISTS blockchain_status VARCHAR(20);
  `);
  console.log("✅ verifications.blockchain_status column ready");

  // ── Brick 7c: backfill legacy records ───────────────────────────────────────
  // Idempotent — only updates rows that have no status yet.
  // Pre-Brick-7 records have no tx_hash and no status tracking.
  // 'legacy' distinguishes them from 'failed' (which had an attempted write).
  await query(`
    UPDATE verifications
    SET blockchain_status = 'legacy'
    WHERE blockchain_status IS NULL;
  `);
  console.log("✅ pre-Brick-7 records marked as legacy");
};
