import { query } from "./index.js";

/**
 * Create the verifications table if it does not already exist.
 * Idempotent — safe to call on every server startup.
 *
 * Schema:
 *   id         SERIAL PRIMARY KEY          — stable auto-increment ID (used in Brick 5)
 *   hash       VARCHAR(64)  NOT NULL       — SHA-256 hex (always 64 chars)
 *   result     VARCHAR(20)  NOT NULL       — "Real" | "Fake" | "Error" | "AI Error"
 *   confidence NUMERIC(5,4) NOT NULL       — 0.0000–1.0000
 *   timestamp  TIMESTAMPTZ  DEFAULT NOW()  — creation time with timezone
 *
 * ── Fail-fast policy ─────────────────────────────────────────────────────────
 * If this throws, the caller (app.js) is responsible for calling process.exit(1).
 * The application must NOT start in a degraded state where history writes silently
 * fail or reads return stale/empty data.
 */
export const initDB = async () => {
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
};
