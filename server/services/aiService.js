import FormData from "form-data";
import fetch from "node-fetch";

// ── Supported MIME types (Sightengine documented support) ─────────────────────
// Source: https://sightengine.com/docs/image-formats
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/tiff",
]);

// Map MIME type → filename extension for the multipart upload field.
// Sightengine uses the filename extension to assist format detection.
const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "image/avif": "avif",
  "image/bmp":  "bmp",
  "image/tiff": "tiff",
};

// ── Confidence contract ────────────────────────────────────────────────────────
// `confidence` stored in the DB and returned in API responses is the raw
// Sightengine `type.ai_generated` score: a float in [0.0, 1.0] representing
// the probability that the image is AI-generated.
//   score → 1.0  : almost certainly AI-generated  → classified as "Fake"
//   score → 0.0  : almost certainly real/authentic → classified as "Real"
// Threshold: score > 0.5 → "Fake", else "Real".
// This contract is preserved from the original implementation.

/**
 * Detect whether a media buffer is AI-generated using Sightengine.
 *
 * @param {Buffer} fileBuffer  - Raw file bytes (from multer memoryStorage).
 * @param {string} mimeType    - Actual MIME type of the uploaded file.
 * @returns {{ result: "Real"|"Fake", confidence: number }}
 * @throws  {Error}  On any infrastructure or provider error. The caller is
 *                   responsible for converting this into an HTTP response.
 */
export const detectDeepfake = async (fileBuffer, mimeType) => {
  // ── 1. Validate MIME type before touching the network ──────────────────────
  if (!mimeType || !SUPPORTED_MIME_TYPES.has(mimeType)) {
    const err = new Error(
      `Unsupported file type: ${mimeType || "(none)"}. ` +
      `Accepted types: ${[...SUPPORTED_MIME_TYPES].join(", ")}`
    );
    err.code = "UNSUPPORTED_MIME_TYPE";
    throw err;
  }

  // ── 2. Validate credentials are present (fail fast, no network round-trip) ─
  if (!process.env.SIGHTENGINE_USER || !process.env.SIGHTENGINE_SECRET) {
    const err = new Error("AI service credentials are not configured");
    err.code = "MISSING_CREDENTIALS";
    throw err;
  }

  const ext = MIME_TO_EXT[mimeType];
  const formData = new FormData();

  formData.append("media", fileBuffer, {
    filename:    `upload.${ext}`,
    contentType: mimeType,
  });
  formData.append("models",     "genai");
  formData.append("api_user",   process.env.SIGHTENGINE_USER);
  formData.append("api_secret", process.env.SIGHTENGINE_SECRET);

  // ── 3. HTTP request with timeout ──────────────────────────────────────────
  // AbortController is available globally in Node.js 15+. No import needed.
  // The timeout is set to 15 seconds — long enough for Sightengine on a slow
  // connection, short enough to avoid hanging Render's free dyno indefinitely.
  const TIMEOUT_MS = 15_000;
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method:  "POST",
      body:    formData,
      headers: formData.getHeaders(),
      signal:  controller.signal,
    });
  } catch (networkErr) {
    // AbortError is thrown when the signal fires (timeout) or is aborted
    // externally. Distinguish it from real network failures (DNS, TCP reset).
    if (networkErr.name === "AbortError") {
      const err = new Error(
        `AI service request timed out after ${TIMEOUT_MS / 1000}s`
      );
      err.code = "TIMEOUT";
      throw err;
    }
    // DNS failure, refused connection, TCP reset, etc.
    const err = new Error(`AI service network error: ${networkErr.message}`);
    err.code = "NETWORK_ERROR";
    throw err;
  } finally {
    // Always clear the timer, whether the request succeeded, failed, or timed
    // out — prevents the Node.js event loop from being held open by a dangling
    // timer after the request has already resolved.
    clearTimeout(timeoutId);
  }

  // ── 4. HTTP status check ───────────────────────────────────────────────────
  if (!response.ok) {
    const err = new Error(
      `AI service returned HTTP ${response.status} ${response.statusText}`
    );
    err.code   = "HTTP_ERROR";
    err.status = response.status;
    throw err;
  }

  // ── 5. Parse JSON ──────────────────────────────────────────────────────────
  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    const err = new Error("AI service returned malformed JSON");
    err.code = "PARSE_ERROR";
    throw err;
  }

  // ── 6. Provider-level status check ────────────────────────────────────────
  // Sightengine returns { status: "failure", error: { type, code, message } }
  // for credential errors, quota exhaustion, unsupported formats, etc.
  if (data.status !== "success") {
    const providerMsg = data.error?.message || data.status || "unknown error";
    const providerCode = data.error?.code ?? null;
    // Log only the error category and code — never the raw payload.
    console.error(
      `❌ AI provider error [code=${providerCode}]: ${providerMsg}`
    );
    const err = new Error(`AI provider error: ${providerMsg}`);
    err.code = "PROVIDER_ERROR";
    throw err;
  }

  // ── 7. Validate the score field ────────────────────────────────────────────
  // `data.type.ai_generated` must exist and be a finite number in [0, 1].
  // A legitimate score of 0.0 is valid (authentic real image). We do NOT
  // use `|| 0` which would conflate a missing field with a zero score.
  const score = data.type?.ai_generated;

  if (score === undefined || score === null) {
    const err = new Error(
      "AI provider response missing expected score field (type.ai_generated)"
    );
    err.code = "MISSING_SCORE";
    throw err;
  }

  if (typeof score !== "number" || !Number.isFinite(score)) {
    const err = new Error(
      `AI provider returned non-finite score: ${score}`
    );
    err.code = "INVALID_SCORE";
    throw err;
  }

  if (score < 0 || score > 1) {
    const err = new Error(
      `AI provider returned out-of-range score: ${score}`
    );
    err.code = "INVALID_SCORE";
    throw err;
  }

  // ── 8. Classify ───────────────────────────────────────────────────────────
  // Threshold preserved from original: score > 0.5 → "Fake", else "Real".
  console.log(`✅ AI inference complete: score=${score}`);

  return {
    result:     score > 0.5 ? "Fake" : "Real",
    confidence: score,
  };
};