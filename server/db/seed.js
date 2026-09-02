/**
 * One-time seed script.
 *
 * Migrates existing server/data/history.json records into the
 * PostgreSQL verifications table.
 *
 * Run ONCE from the server/ directory after provisioning the database:
 *   node db/seed.js
 *
 * Idempotency: uses INSERT ... ON CONFLICT DO NOTHING with a temporary
 * unique index on (hash, timestamp) to skip exact duplicates from the
 * JSON file. Safe to re-run without creating duplicate rows for the
 * same original JSON records.
 *
 * After seeding, this script can be deleted or left in place — it is harmless.
 */

// Must be first import — loads .env before db/index.js reads process.env
import "dotenv/config";

import fs from "fs";
import path from "path";
import { query } from "./index.js";
import { initDB } from "./init.js";

const HISTORY_FILE = path.resolve("data/history.json");

const seed = async () => {
  // Ensure table exists before inserting
  await initDB();

  if (!fs.existsSync(HISTORY_FILE)) {
    console.log("⚠️  No history.json found at:", HISTORY_FILE);
    console.log("Nothing to seed.");
    process.exit(0);
  }

  const records = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  console.log(`📄 Found ${records.length} records in history.json`);

  // Add a unique constraint for idempotent seeding.
  // This only applies to exact (hash, timestamp) pairs from the JSON file.
  // Normal uploads can still store the same hash multiple times (re-uploads).
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_seed_unique
    ON verifications (hash, timestamp);
  `);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const result = await query(
        `INSERT INTO verifications (hash, result, confidence, timestamp)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (hash, timestamp) DO NOTHING`,
        [
          record.hash,
          record.result,
          record.confidence ?? 0,
          record.time ?? new Date().toISOString()
        ]
      );
      if (result.rowCount > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error("❌ Failed to insert record:", record.hash, err.message);
      failed++;
    }
  }

  console.log(`\n✅ Seed complete: ${inserted} inserted, ${skipped} skipped (already exist), ${failed} failed`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed script crashed:", err.message);
  process.exit(1);
});
