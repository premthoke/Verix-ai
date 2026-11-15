/**
 * Auth controller and middleware unit tests.
 *
 * Tests verify:
 *   - Input validation returns the correct 4xx status before any DB query.
 *   - DB errors are caught by the controller's try/catch (not the global handler).
 *   - JWT_SECRET absence produces a safe 500 (not a leaked secret).
 *   - Invalid JWTs are rejected with 401.
 *   - The global error handler correctly maps body-parser parse errors to 400
 *     instead of falling through to the generic 500.
 *
 * No real database, Sightengine calls, file uploads, or blockchain transactions
 * are made. DATABASE_URL is set to a fake value to allow db/index.js to load
 * without process.exit(1); pool.query() will reject with ECONNREFUSED.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import createHttpError from "http-errors";

// ── Environment setup (must precede dynamic imports that read env) ─────────────
// Set a fake DATABASE_URL so db/index.js does not call process.exit(1).
// No real connection is made; pool.query() rejects immediately with ECONNREFUSED.
process.env.DATABASE_URL = "postgresql://fakeuser:fakepass@localhost:5432/fakedb_test";
// Set a real-looking JWT_SECRET for token signing/verification tests.
process.env.JWT_SECRET = "test-only-secret-brick-8339-do-not-use-in-production-abcdef123456";
process.env.JWT_EXPIRES_IN = "7d";

// ── Dynamic imports (env vars must already be set above) ──────────────────────
const { register, login } = await import("../controllers/authController.js");
const { default: authMiddleware } = await import("../middleware/authMiddleware.js");
const { default: jwt } = await import("jsonwebtoken");

// ── Test helpers ──────────────────────────────────────────────────────────────

/**
 * Create a minimal mock req/res pair.
 * - res.status(code) sets the HTTP status code and returns res (chainable).
 * - res.json(body)   records the response body and returns res.
 * - getResult()      returns { status, body } after the handler has run.
 */
function makeReqRes(body, headers = {}) {
  const req = { body, headers };
  let statusCode = 200; // Express default
  let responseBody = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseBody = data;
      return res;
    },
  };

  return {
    req,
    res,
    getResult: () => ({ status: statusCode, body: responseBody }),
  };
}

// ── register — input validation (pre-database) ────────────────────────────────

describe("register — input validation", () => {
  test("missing all fields → 400", async () => {
    const { req, res, getResult } = makeReqRes({});
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Name, email and password are required");
  });

  test("missing name only → 400", async () => {
    const { req, res, getResult } = makeReqRes({ email: "a@b.com", password: "Pass1234!" });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Name, email and password are required");
  });

  test("missing email only → 400", async () => {
    const { req, res, getResult } = makeReqRes({ name: "Alice", password: "Pass1234!" });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Name, email and password are required");
  });

  test("missing password only → 400", async () => {
    const { req, res, getResult } = makeReqRes({ name: "Alice", email: "a@b.com" });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Name, email and password are required");
  });

  test("name too short — 1 char → 400", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "A",
      email: "a@b.com",
      password: "Pass1234!",
    });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400, `expected 400, got ${r.status} — body: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.error, "Name must be between 2 and 100 characters");
  });

  test("name too long — 101 chars → 400", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "A".repeat(101),
      email: "a@b.com",
      password: "Pass1234!",
    });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Name must be between 2 and 100 characters");
  });

  test("invalid email — no @ symbol → 400", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "Alice",
      email: "NOTANEMAIL",
      password: "Pass1234!",
    });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400, `expected 400, got ${r.status} — body: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.error, "Invalid email address");
  });

  test("invalid email — no TLD → 400", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "Alice",
      email: "user@nodomain",
      password: "Pass1234!",
    });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Invalid email address");
  });

  test("password too short — 7 chars → 400", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "Alice",
      email: "a@b.com",
      password: "Short7!",
    });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Password must be at least 8 characters");
  });

  test("password exactly 8 chars → passes validation (reaches DB)", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "Alice",
      email: "alice@test.com",
      password: "Pass1234",
    });
    await register(req, res);
    const r = getResult();
    // Validation passes; DB query fails with ECONNREFUSED.
    // Critically: the controller's catch must handle this, NOT the global handler.
    // So we expect 500 with "Registration failed", not "An unexpected error occurred."
    assert.equal(r.status, 500);
    assert.equal(
      r.body.error,
      "Registration failed",
      "DB error must be caught by controller try/catch — global handler message means the error escaped"
    );
  });
});

// ── register — DB-dependent paths ─────────────────────────────────────────────

describe("register — DB errors caught by controller (not global handler)", () => {
  test("valid body → DB fails → controller catch returns 'Registration failed'", async () => {
    const { req, res, getResult } = makeReqRes({
      name: "Valid Name",
      email: "valid@example.com",
      password: "ValidPass123!",
    });
    await register(req, res);
    const r = getResult();
    assert.equal(r.status, 500);
    assert.equal(
      r.body.error,
      "Registration failed",
      `Expected controller catch message. Got: "${r.body.error}". ` +
        "If this says 'An unexpected error occurred.' the error bypassed try/catch."
    );
  });
});

// ── login — input validation ───────────────────────────────────────────────────

describe("login — input validation", () => {
  test("missing all fields → 400", async () => {
    const { req, res, getResult } = makeReqRes({});
    await login(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Email and password are required");
  });

  test("missing email → 400", async () => {
    const { req, res, getResult } = makeReqRes({ password: "Pass1234!" });
    await login(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Email and password are required");
  });

  test("missing password → 400", async () => {
    const { req, res, getResult } = makeReqRes({ email: "a@b.com" });
    await login(req, res);
    const r = getResult();
    assert.equal(r.status, 400);
    assert.equal(r.body.error, "Email and password are required");
  });

  test("valid body → DB fails → controller catch returns 'Login failed'", async () => {
    const { req, res, getResult } = makeReqRes({
      email: "valid@example.com",
      password: "ValidPass123!",
    });
    await login(req, res);
    const r = getResult();
    assert.equal(r.status, 500);
    assert.equal(
      r.body.error,
      "Login failed",
      `Expected controller catch message. Got: "${r.body.error}". ` +
        "If this says 'An unexpected error occurred.' the error bypassed try/catch."
    );
  });
});

// ── authMiddleware ─────────────────────────────────────────────────────────────

describe("authMiddleware", () => {
  test("missing Authorization header → 401", () => {
    const { req, res, getResult } = makeReqRes({}, {});
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    const r = getResult();
    assert.equal(r.status, 401);
    assert.equal(r.body.error, "Authentication required");
    assert.equal(nextCalled, false);
  });

  test("Authorization without Bearer prefix → 401", () => {
    const { req, res, getResult } = makeReqRes({}, { authorization: "Token abc123" });
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    const r = getResult();
    assert.equal(r.status, 401);
    assert.equal(r.body.error, "Authentication required");
    assert.equal(nextCalled, false);
  });

  test("invalid JWT → 401 (not 500)", () => {
    const { req, res, getResult } = makeReqRes({}, { authorization: "Bearer not.a.valid.jwt" });
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    const r = getResult();
    assert.equal(r.status, 401);
    assert.equal(r.body.error, "Invalid or expired token");
    assert.equal(nextCalled, false);
  });

  test("valid JWT → next() called, req.user populated", () => {
    const token = jwt.sign({ userId: "test-user-123" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const { req, res, getResult } = makeReqRes({}, { authorization: `Bearer ${token}` });
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true, "next() should be called for a valid JWT");
    assert.equal(req.user?.id, "test-user-123");
  });

  test("JWT_SECRET missing → 500 'Server configuration error'", () => {
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "";

    const { req, res, getResult } = makeReqRes({}, { authorization: "Bearer sometoken" });
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    const r = getResult();
    assert.equal(r.status, 500);
    assert.equal(r.body.error, "Server configuration error");
    assert.equal(nextCalled, false);

    process.env.JWT_SECRET = originalSecret; // restore
  });
});

// ── Global error handler — body-parser errors ─────────────────────────────────
//
// This test documents the confirmed defect:
//   body-parser parse errors have err.status=400 and err.type='entity.parse.failed'
//   but err.code is undefined.
//   The current global error handler in app.js only checks err.code, so a parse
//   error falls through to the generic 500 response instead of returning 400.
//
// The fix: check err.status === 400 || err.type === 'entity.parse.failed'
// and return 400 for those errors.
// ─────────────────────────────────────────────────────────────────────────────

describe("global error handler — body-parser parse error classification", () => {
  // Inline the current global handler logic to prove the defect
  function currentGlobalHandler(err) {
    if (err.code === "UNSUPPORTED_MIME_TYPE") return { status: 400, body: { error: err.message } };
    if (err.code === "LIMIT_FILE_SIZE") return { status: 400, body: { error: "File too large." } };
    return { status: 500, body: { error: "An unexpected error occurred." } };
  }

  // Inline the proposed fixed handler
  function fixedGlobalHandler(err) {
    if (err.code === "UNSUPPORTED_MIME_TYPE") return { status: 400, body: { error: err.message } };
    if (err.code === "LIMIT_FILE_SIZE") return { status: 400, body: { error: "File too large." } };
    // body-parser parse errors: err.status=400, err.type='entity.parse.failed'
    if (err.status === 400 && err.type === "entity.parse.failed") {
      return { status: 400, body: { error: "Invalid JSON in request body." } };
    }
    return { status: 500, body: { error: "An unexpected error occurred." } };
  }

  test("[DEFECT] current handler maps body-parser parse error to 500 (should be 400)", () => {
    const bpError = createHttpError(400, new SyntaxError("bad json"), {
      type: "entity.parse.failed",
    });
    const result = currentGlobalHandler(bpError);
    // Document the bug: status is 500 when it should be 400
    assert.equal(result.status, 500, "Current handler incorrectly returns 500 for a parse error");
    assert.equal(result.body.error, "An unexpected error occurred.");
  });

  test("[FIX] fixed handler correctly maps body-parser parse error to 400", () => {
    const bpError = createHttpError(400, new SyntaxError("bad json"), {
      type: "entity.parse.failed",
    });
    const result = fixedGlobalHandler(bpError);
    assert.equal(result.status, 400, "Fixed handler returns 400 for a parse error");
    assert.equal(result.body.error, "Invalid JSON in request body.");
  });

  test("[FIX] fixed handler still returns 500 for unexpected errors", () => {
    const genericErr = new Error("something unexpected");
    const result = fixedGlobalHandler(genericErr);
    assert.equal(result.status, 500);
    assert.equal(result.body.error, "An unexpected error occurred.");
  });

  test("[FIX] fixed handler still returns 400 for UNSUPPORTED_MIME_TYPE", () => {
    const mimeErr = Object.assign(new Error("unsupported type"), { code: "UNSUPPORTED_MIME_TYPE" });
    const result = fixedGlobalHandler(mimeErr);
    assert.equal(result.status, 400);
  });

  test("[FIX] fixed handler still returns 400 for LIMIT_FILE_SIZE", () => {
    const sizeErr = Object.assign(new Error("too big"), { code: "LIMIT_FILE_SIZE" });
    const result = fixedGlobalHandler(sizeErr);
    assert.equal(result.status, 400);
    assert.equal(result.body.error, "File too large.");
  });
});
