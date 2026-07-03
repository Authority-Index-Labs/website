// TikTok Marketing API OAuth endpoints, bolted onto the otherwise-static AIL site.
//
// Routing: wrangler.jsonc sets `run_worker_first: ["/tiktok/*"]`, so this Worker
// ONLY executes for /tiktok/* paths. Every other request is delegated untouched
// to the static-assets binding (env.ASSETS), so the marketing site is unaffected.
//
// Flow:
//   GET /tiktok/auth     -> 302 to TikTok's consent screen (sets a state cookie)
//   GET /tiktok/callback -> TikTok redirects here with ?auth_code=...; we exchange
//                           it for a long-lived access token and show it once.
//
// Secrets required (set via `wrangler secret put`):
//   TIKTOK_APP_ID, TIKTOK_APP_SECRET
// Optional binding:
//   TIKTOK_KV (KV namespace) — if bound, the token is also stored server-side.

const TIKTOK_BASE = "https://business-api.tiktok.com";
const REDIRECT_URI = "https://authorityindexlabs.com/tiktok/callback";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/tiktok/auth") return startAuth(env);
      if (url.pathname === "/tiktok/callback") return handleCallback(request, url, env);
    } catch (err) {
      return json({ error: String((err && err.message) || err) }, 500);
    }

    // Not a TikTok route — serve the static site exactly as before.
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
