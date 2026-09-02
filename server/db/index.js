import pg from "pg";

const { Pool } = pg;

// ── Fail fast if DATABASE_URL is not configured ──────────────────────────────
// The application requires a database to function correctly.
// A missing DATABASE_URL is a configuration error — do not silently continue.
if (!process.env.DATABASE_URL) {
  console.error("❌ FATAL: DATABASE_URL environment variable is not set.");
  console.error("   Add DATABASE_URL to your .env file (see server/.env.example).");
  process.exit(1);
}

// ── Connection pool ───────────────────────────────────────────────────────────
// SSL is required for hosted providers (Neon, Supabase, Railway).
// rejectUnauthorized: false allows self-signed certs on managed platforms.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Pool-level errors (e.g. client disconnected unexpectedly).
// Log the message only — never log the connection string or credentials.
pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

/**
 * Run a parameterized SQL query.
 * Always use this helper — never interpolate values directly into SQL strings.
 *
 * @param {string} text   - SQL with $1, $2, … placeholders
 * @param {Array}  params - Values for the placeholders
 * @returns {Promise<pg.QueryResult>}
 */
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`📦 DB query (${duration}ms):`, text.trimStart().slice(0, 80));
  return res;
};

export default pool;
