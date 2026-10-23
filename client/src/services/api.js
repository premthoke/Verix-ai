import axios from "axios";

// ── Base URL ──────────────────────────────────────────────────────────────────
// Read from Vite environment variable so localhost and Vercel can both work
// without hardcoded URLs. Falls back to the deployed Render backend.
//
// Normalization: strip any trailing slash, then ensure the path ends with /api
// exactly once. This means VITE_API_URL can be set as either:
//   http://localhost:5000        → resolved to http://localhost:5000/api
//   http://localhost:5000/api    → kept as-is
//   http://localhost:5000/api/   → resolved to http://localhost:5000/api
//
// Set VITE_API_URL=http://localhost:5000 (or /api) in client/.env for local dev.
function resolveBaseURL() {
  const raw = import.meta.env.VITE_API_URL || "https://verix-ai-1doz.onrender.com/api";
  // Strip trailing slash(es)
  const stripped = raw.replace(/\/+$/, "");
  // If it already ends with /api, use as-is; otherwise append /api
  return stripped.endsWith("/api") ? stripped : `${stripped}/api`;
}

const BASE_URL = resolveBaseURL();

// ── Auth helpers ──────────────────────────────────────────────────────────────
// No Authorization header — registration and login are public endpoints.

/** POST /api/auth/register */
export const registerAPI = (name, email, password) =>
  axios.post(`${BASE_URL}/auth/register`, { name, email, password });

/** POST /api/auth/login */
export const loginAPI = (email, password) =>
  axios.post(`${BASE_URL}/auth/login`, { email, password });

// ── Authenticated helpers ─────────────────────────────────────────────────────
// Each authenticated helper receives the JWT and attaches it as a Bearer token.
// The token is read from AuthContext at the call site — not from a global
// interceptor — to avoid accidentally logging tokens or intercepting
// public requests.

/**
 * POST /api/upload — multipart/form-data.
 * Do NOT set Content-Type manually; let axios derive it with the correct
 * multipart boundary from the FormData object.
 */
export const uploadAPI = (formData, token) =>
  axios.post(`${BASE_URL}/upload`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

/** GET /api/history — returns the authenticated user's verification records. */
export const historyAPI = (token) =>
  axios.get(`${BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── Public helpers ────────────────────────────────────────────────────────────
// No Authorization header required.

/** POST /api/verify — on-chain hash verification (public). */
export const verifyAPI = (formData) =>
  axios.post(`${BASE_URL}/verify`, formData);
