// TikTok Marketing API OAuth + ad-click tracking, bolted onto the otherwise-static AIL site.
//
// Routing: wrangler.jsonc sets `run_worker_first: ["/tiktok/*", "/go/*"]`, so this Worker
// ONLY executes for those paths. Every other request is delegated untouched to the
// static-assets binding (env.ASSETS), so the marketing site is unaffected.
//
// Flow:
//   GET /tiktok/auth     -> 302 to TikTok's consent screen (sets a state cookie)
//   GET /tiktok/callback -> TikTok redirects here with ?auth_code=...; we exchange
//                           it for a long-lived access token and show it once.
//   GET /go/:campaign_id -> ad-click landing link (TikTok ads point here, not straight to
//                           the store). Records the click against tessera-api, then 302s to
//                           the right store. See handleGo for the attribution design.
//
// Secrets required (set via `wrangler secret put`):
//   TIKTOK_APP_ID, TIKTOK_APP_SECRET
// Vars required (wrangler.jsonc `vars`):
//   TESSERA_API_BASE — tessera-api's Cloudflare-fronted production domain (NOT the raw
//     Railway origin — same requirement as the RevenueCat webhook, see tessera-api's
//     app/routers/webhooks.py). Missing -> /go still redirects, just without recording
//     the click (best-effort, see handleGo).
//   IOS_STORE_URL, ANDROID_STORE_URL — optional overrides; sane iOS default baked in,
//     Android has no confirmed Play Store listing yet so it falls back to the iOS URL.
// Optional binding:
//   TIKTOK_KV (KV namespace) — if bound, the OAuth token is also stored server-side.

const TIKTOK_BASE = "https://business-api.tiktok.com";
const REDIRECT_URI = "https://authorityindexlabs.com/tiktok/callback";
const DEFAULT_IOS_STORE_URL = "https://apps.apple.com/app/id6784012468";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/tiktok/auth") return startAuth(env);
      if (url.pathname === "/tiktok/callback") return handleCallback(request, url, env);
      if (url.pathname.startsWith("/go/")) return handleGo(request, url, env, ctx);
    } catch (err) {
      return json({ error: String((err && err.message) || err) }, 500);
    }

    // Not a tracked route — serve the static site exactly as before.
    return env.ASSETS.fetch(request);
  },
};

// ── Step 1: send the advertiser to TikTok's consent screen ──
function startAuth(env) {
  if (!env.TIKTOK_APP_ID) return json({ error: "TIKTOK_APP_ID secret not set" }, 500);

  const state = crypto.randomUUID(); // ties this request to the callback (CSRF guard)
  const auth = new URL(TIKTOK_BASE + "/portal/auth");
  auth.searchParams.set("app_id", env.TIKTOK_APP_ID);
  auth.searchParams.set("state", state);
  auth.searchParams.set("redirect_uri", REDIRECT_URI);

  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      // Path scoped to /tiktok so the callback can read it; 10-min lifetime.
      "Set-Cookie": `tt_state=${state}; Path=/tiktok; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

// ── Step 2: TikTok redirects back with ?auth_code=...&state=... ──
async function handleCallback(request, url, env) {
  const authCode = url.searchParams.get("auth_code") || url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (!authCode) {
    return htmlPage("No auth_code received", `<p>Query string was: <code>${escapeHtml(url.search)}</code></p>`, 400);
  }
  if (!env.TIKTOK_APP_ID || !env.TIKTOK_APP_SECRET) {
    return json({ error: "TIKTOK_APP_ID / TIKTOK_APP_SECRET secrets not set" }, 500);
  }

  // CSRF guard: if we set a state cookie (i.e. the user came via /tiktok/auth),
  // it must match. If there's no cookie (e.g. flow started from TikTok's own UI),
  // we skip the check rather than block a legitimate authorization.
  const cookieState = readCookie(request, "tt_state");
  if (cookieState && returnedState && cookieState !== returnedState) {
    return htmlPage("State mismatch", "<p>The <code>state</code> did not match. Aborting for safety.</p>", 400);
  }

  const resp = await fetch(TIKTOK_BASE + "/open_api/v1.3/oauth2/access_token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: env.TIKTOK_APP_ID,
      secret: env.TIKTOK_APP_SECRET,
      auth_code: authCode,
    }),
  });

  const data = await resp.json();
  if (data.code !== 0) {
    return htmlPage("Token exchange failed", `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`, 502);
  }

  const token = data.data?.access_token || "";
  const advertiserIds = data.data?.advertiser_ids || [];
  const scope = data.data?.scope || [];

  // If a KV namespace is bound, persist server-side so you don't have to copy by hand.
  let persisted = false;
  if (env.TIKTOK_KV) {
    await env.TIKTOK_KV.put("access_token", token);
    await env.TIKTOK_KV.put("advertiser_ids", JSON.stringify(advertiserIds));
    persisted = true;
  }

  return htmlPage(
    "✅ TikTok authorized",
    `<p><strong>Copy these now and store them in a secrets manager.</strong> This access token can spend on your ad account — treat it like a password.</p>
     <h3>Access token</h3>
     <pre class="break">${escapeHtml(token)}</pre>
     <h3>Advertiser IDs</h3>
     <pre>${escapeHtml(JSON.stringify(advertiserIds, null, 2))}</pre>
     <h3>Scopes granted</h3>
     <pre>${escapeHtml(JSON.stringify(scope, null, 2))}</pre>
     <p>${persisted ? "Also saved to KV (keys: <code>access_token</code>, <code>advertiser_ids</code>)." : "<em>Not persisted — no KV bound. Copy the token now; this page won't show it again.</em>"}</p>`
  );
}

// ── Ad-click landing link: TikTok ads point here instead of the store directly ──
// GET /go/:campaign_id?ad_id=...  (ttclid is TikTok's own auto-appended click id, present
// when "URL parameters" tracking is enabled on the ad — read here, not relied upon).
//
// Records the click against tessera-api with the REAL visitor's IP (read from THIS request's
// own CF-Connecting-IP header) — never inferred by tessera-api itself, which would otherwise
// see this Worker's egress IP, not the person who clicked. Fire-and-forget via ctx.waitUntil:
// the ad spend already happened, so losing the install to a slow/down attribution call would
// be worse than losing the attribution record — the redirect must never block on it.
//
// Store destination:
//   - Android: builds the Play Store's own `referrer` query param ourselves, carrying
//     campaign_id/ad_id verbatim. The app reads this via the Play Install Referrer API on
//     first launch for an EXACT match — no IP guessing needed (see tessera-api's
//     POST /v1/attribution/claim).
//   - iOS: Apple has no equivalent passthrough (see the attribution plan's iOS caveat), so
//     the destination is just the plain App Store URL; the app falls back to an approximate
//     IP + time-window match server-side.
function handleGo(request, url, env, ctx) {
  const campaignId = url.pathname.slice("/go/".length).split("/")[0];
  if (!campaignId) return new Response("Missing campaign id", { status: 400 });

  const adId = url.searchParams.get("ad_id") || null;
  const ttclid = url.searchParams.get("ttclid") || null;
  const userAgent = request.headers.get("User-Agent") || "";
  const clientIp = request.headers.get("CF-Connecting-IP") || "";
  const platform = detectPlatform(userAgent);

  if (env.TESSERA_API_BASE) {
    ctx.waitUntil(
      fetch(`${env.TESSERA_API_BASE}/v1/attribution/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          ad_id: adId,
          ttclid,
          client_ip: clientIp,
          user_agent: userAgent,
          platform,
        }),
      }).catch(() => {}) // best-effort — a failed attribution call must never surface to the visitor
    );
  }

  return new Response(null, {
    status: 302,
    headers: { Location: storeUrl(platform, campaignId, adId, env) },
  });
}

function detectPlatform(userAgent) {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "unknown";
}

function storeUrl(platform, campaignId, adId, env) {
  if (platform === "android" && env.ANDROID_STORE_URL) {
    const playUrl = new URL(env.ANDROID_STORE_URL);
    const referrerParams = new URLSearchParams({ campaign_id: campaignId });
    if (adId) referrerParams.set("ad_id", adId);
    playUrl.searchParams.set("referrer", referrerParams.toString());
    return playUrl.toString();
  }
  // iOS, unknown UA, or Android with no confirmed Play Store URL yet -> the App Store.
  // No query-param passthrough is possible through Apple's install flow either way.
  return env.IOS_STORE_URL || DEFAULT_IOS_STORE_URL;
}

// ── helpers ──
function readCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function htmlPage(title, bodyHtml, status = 200) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">
     <title>${escapeHtml(title)}</title>
     <style>body{font:16px/1.5 system-ui,sans-serif;max-width:760px;margin:3rem auto;padding:0 1rem;color:#1a3a6e}
     pre{background:#f4f6fb;padding:1rem;border-radius:8px;overflow:auto}.break{white-space:pre-wrap;word-break:break-all}</style>
     <h1>${escapeHtml(title)}</h1>${bodyHtml}`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
