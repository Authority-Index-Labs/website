// Routing tests for the tracked paths. `node --test src/worker.test.mjs`, no dependencies —
// same stance as tessera-website's scripts/worker.test.mjs, and for the same reason: these
// are money paths that no page links to, so a static link checker cannot catch a break here.
//
// The case this file exists for: /go used to send every desktop visitor to an iPhone App
// Store page, which is both a dead end on a laptop and an unattributable click. That was
// invisible because nothing exercised the desktop branch.

import { test } from "node:test";
import assert from "node:assert/strict";

import worker from "./worker.js";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36";

/** Run the worker against one URL, capturing any attribution POST it makes. */
async function run(path, { ua = DESKTOP_UA, env = {}, ip = "203.0.113.7" } = {}) {
  const recorded = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    recorded.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response("{}", { status: 200 });
  };

  const waited = [];
  const ctx = { waitUntil: (p) => waited.push(p) };
  const request = new Request(`https://authorityindexlabs.com${path}`, {
    headers: { "User-Agent": ua, "CF-Connecting-IP": ip },
  });

  try {
    const response = await worker.fetch(request, env, ctx);
    await Promise.all(waited);
    return { response, recorded };
  } finally {
    globalThis.fetch = realFetch;
  }
}

const API_ENV = { TESSERA_API_BASE: "https://api.example.test" };

test("/go sends a desktop visitor to web signup carrying the campaign", async () => {
  const { response } = await run("/go/meta-carousel-4?ad_id=12345");
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("Location"));
  assert.equal(location.origin + location.pathname, "https://app.your-tessera.com/signup");
  assert.equal(location.searchParams.get("campaign_id"), "meta-carousel-4");
  assert.equal(location.searchParams.get("ad_id"), "12345");
  // A UA-dependent redirect must never be cached and replayed to a different device.
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("/go still sends iPhone visitors to the App Store", async () => {
  const { response } = await run("/go/meta-carousel-4", { ua: IOS_UA });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("Location"), /apps\.apple\.com/);
});

test("/go builds the Play install referrer when a Play URL is configured", async () => {
  const { response } = await run("/go/tiktok-carousel-4?ad_id=99", {
    ua: ANDROID_UA,
    env: { ANDROID_STORE_URL: "https://play.google.com/store/apps/details?id=com.tessera" },
  });
  const referrer = new URL(response.headers.get("Location")).searchParams.get("referrer");
  const parsed = new URLSearchParams(referrer);
  assert.equal(parsed.get("campaign_id"), "tiktok-carousel-4");
  assert.equal(parsed.get("ad_id"), "99");
});

test("/go records the click with both platforms' click ids and the real visitor IP", async () => {
  const { recorded } = await run("/go/meta-carousel-4?fbclid=FB123&ttclid=TT456", {
    env: API_ENV,
  });
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0].url, "https://api.example.test/v1/attribution/click");
  assert.equal(recorded[0].body.campaign_id, "meta-carousel-4");
  assert.equal(recorded[0].body.fbclid, "FB123");
  assert.equal(recorded[0].body.ttclid, "TT456");
  // Never the Worker's own egress IP — the whole iOS match depends on this being the clicker.
  assert.equal(recorded[0].body.client_ip, "203.0.113.7");
});

test("/go refuses a campaign id that is not ours to mint", async () => {
  // This value reaches a redirect Location on another origin, so it is validated rather
  // than forwarded. Before the desktop branch existed there was nothing to protect.
  // Note on what is NOT in this list: "../evil" never reaches handleGo, because the URL
  // parser normalizes the path away from /go/ before we see it. Asserting a 400 there would
  // be testing the platform, and it fails for an unrelated reason (no ASSETS binding).
  for (const bad of ["a b", "x".repeat(65), "%zz", "a%2Fb"]) {
    const { response } = await run(`/go/${bad}`);
    assert.equal(response.status, 400, `expected 400 for ${bad}`);
  }
});

test("/go drops a malformed ad_id rather than forwarding it", async () => {
  const { response } = await run("/go/meta-carousel-4?ad_id=%3Cscript%3E");
  const location = new URL(response.headers.get("Location"));
  assert.equal(location.searchParams.get("ad_id"), null);
});

test("/go still redirects when the attribution call fails", async () => {
  // The ad spend already happened. Losing the record is bad; losing the visitor is worse.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("api down");
  };
  try {
    const waited = [];
    const request = new Request("https://authorityindexlabs.com/go/meta-carousel-4", {
      headers: { "User-Agent": DESKTOP_UA },
    });
    const response = await worker.fetch(request, API_ENV, {
      waitUntil: (p) => waited.push(p),
    });
    await Promise.all(waited);
    assert.equal(response.status, 302);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("/r still forwards a valid referral code, unchanged", async () => {
  const { response } = await run("/r/ABCD23");
  assert.equal(response.status, 302);
  assert.match(response.headers.get("Location"), /apps\.apple\.com|app\.your-tessera\.com/);
});
