/**
 * CORS configuration unit tests for server/app.js
 *
 * These tests verify the isOriginAllowed() logic and both regexes without
 * starting a server, creating accounts, uploading files, or hitting
 * any live backend or external API.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ── Replicate the exact logic from app.js ─────────────────────────────────────
// Keep in sync with server/app.js if the origin policy ever changes.

// Pattern 1: project slug "verix-ai", team slug "premthoke"
const PREVIEW_ORIGIN_REGEX =
  /^https:\/\/verix-ai-[a-z0-9-]+-premthoke\.vercel\.app$/;

// Pattern 2: project slug "verix", team slug "premthokes-projects"
// (Vercel alternate team slug generated for some personal-team deployments)
const PREVIEW_ORIGIN_REGEX_ALT =
  /^https:\/\/verix-[a-z0-9]+-premthokes-projects\.vercel\.app$/;

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (origin === "http://localhost:5173") return true;
  if (origin === "https://verix-ai.vercel.app") return true;
  if (PREVIEW_ORIGIN_REGEX.test(origin)) return true;
  if (PREVIEW_ORIGIN_REGEX_ALT.test(origin)) return true;
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

    // ── PREVIEW_ORIGIN_REGEX (verix-ai / premthoke) ───────────────────────────

    test("Vercel preview with commit hash suffix is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai-abc123def-premthoke.vercel.app"));
    });

    test("Vercel preview with git-branch suffix is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai-git-verix-v2-premthoke.vercel.app"));
    });

    test("Vercel preview with alphanumeric slug is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-ai-a1b2c3-premthoke.vercel.app"));
    });

    // ── PREVIEW_ORIGIN_REGEX_ALT (verix / premthokes-projects) ───────────────

    test("current preview origin (verix-8fy2y7uig-premthokes-projects) is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-8fy2y7uig-premthokes-projects.vercel.app"));
    });

    test("other premthokes-projects deployment hash is allowed", () => {
      assert.ok(isOriginAllowed("https://verix-9zz9z9zzz-premthokes-projects.vercel.app"));
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

    test("wrong team slug on premthoke pattern is rejected", () => {
      assert.ok(!isOriginAllowed("https://verix-ai-abc123-otherteam.vercel.app"));
    });

    test("wrong team slug on premthokes-projects pattern is rejected", () => {
      assert.ok(!isOriginAllowed("https://verix-8fy2y7uig-evil-projects.vercel.app"));
    });

    test("preview URL without project slug is rejected", () => {
      assert.ok(!isOriginAllowed("https://unrelated-abc123-premthoke.vercel.app"));
    });

    test("unrelated project on premthokes-projects team is rejected", () => {
      assert.ok(!isOriginAllowed("https://other-app-8fy2y7uig-premthokes-projects.vercel.app"));
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

    test("uppercase slug rejected on premthoke pattern", () => {
      assert.ok(!isOriginAllowed("https://verix-ai-ABC123-premthoke.vercel.app"));
    });

    test("uppercase slug rejected on premthokes-projects pattern", () => {
      assert.ok(!isOriginAllowed("https://VERIX-8fy2y7uig-premthokes-projects.vercel.app"));
    });

    test("hash with hyphens rejected on premthokes-projects pattern (only [a-z0-9] allowed)", () => {
      // PREVIEW_ORIGIN_REGEX_ALT uses [a-z0-9]+ (no hyphens) for the hash segment
      // because Vercel deployment hashes are purely alphanumeric
      assert.ok(!isOriginAllowed("https://verix-with-hyphens-premthokes-projects.vercel.app"));
    });

    test("localhost on wrong port is rejected", () => {
      assert.ok(!isOriginAllowed("http://localhost:3000"));
    });

    test("localhost over https is rejected", () => {
      assert.ok(!isOriginAllowed("https://localhost:5173"));
    });
  });

});
