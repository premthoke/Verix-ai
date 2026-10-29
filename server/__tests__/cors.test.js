/**
 * CORS configuration unit tests for server/app.js
 *
 * These tests verify the isOriginAllowed() logic and the regex without
 * starting a server, creating accounts, uploading files, or hitting
 * any live backend or external API.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ── Replicate the exact logic from app.js ─────────────────────────────────────
// Keep in sync with server/app.js if the origin policy ever changes.

const PREVIEW_ORIGIN_REGEX = /^https:\/\/verix-ai-[a-z0-9-]+-premthoke\.vercel\.app$/;

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (origin === "http://localhost:5173") return true;
  if (origin === "https://verix-ai.vercel.app") return true;
  if (PREVIEW_ORIGIN_REGEX.test(origin)) return true;
  return false;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CORS origin policy", () => {

  describe("allowed origins", () => {
    test("localhost dev server is allowed", () => {
      assert.ok(isOriginAllowed("http://localhost:5173"));
    });

    test("production Vercel deployment is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai.vercel.app"));
    });

    test("Vercel preview with commit hash suffix is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai-abc123def-premthoke.vercel.app"));
    });

    test("Vercel preview with git-branch suffix is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai-git-verix-v2-premthoke.vercel.app"));
    });

    test("Vercel preview with alphanumeric slug is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai-a1b2c3-premthoke.vercel.app"));
    });
  });

  describe("rejected origins", () => {
    test("null origin is rejected", () => {
      assert.ok(!isOriginAllowed(null));
    });

    test("empty string origin is rejected", () => {
      assert.ok(!isOriginAllowed(""));
    });

    test("unrelated domain is rejected", () => {
      assert.ok(!isOriginAllowed("https://evil-site.example.com"));
    });

    test("arbitrary vercel.app subdomain is rejected", () => {
      assert.ok(!isOriginAllowed("https://other-project.vercel.app"));
    });

    test("wrong team slug is rejected", () => {
      assert.ok(!isOriginAllowed("https://verix-ai-abc123-otherteam.vercel.app"));
    });

    test("preview URL without project slug is rejected", () => {
      assert.ok(!isOriginAllowed("https://unrelated-abc123-premthoke.vercel.app"));
    });

    test("http (non-TLS) production URL is rejected", () => {
      assert.ok(!isOriginAllowed("http://verix-ai.vercel.app"));
    });

    test("production URL with extra path is rejected", () => {
      assert.ok(!isOriginAllowed("https://verix-ai.vercel.app/extra"));
    });

    test("origin containing null bytes is rejected", () => {
      assert.ok(!isOriginAllowed("https://verix-ai-\0-premthoke.vercel.app"));
    });

    test("origin with uppercase letters in slug is rejected (regex anchored to lowercase)", () => {
      // PREVIEW_ORIGIN_REGEX only allows [a-z0-9-] so uppercase slugs won't match
      assert.ok(!isOriginAllowed("https://verix-ai-ABC123-premthoke.vercel.app"));
    });

    test("localhost on wrong port is rejected", () => {
      assert.ok(!isOriginAllowed("http://localhost:3000"));
    });

    test("localhost over https is rejected", () => {
      assert.ok(!isOriginAllowed("https://localhost:5173"));
    });
  });

});
