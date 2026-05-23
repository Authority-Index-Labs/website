# Authority Index Labs — Website

Static credibility landing page for [authorityindexlabs.com](https://authorityindexlabs.com).

**Tech stack:** Plain HTML5 + Tailwind CSS via CDN. No build step. Deployed to Cloudflare Workers using the static assets feature.

---

## How to deploy

> **Important:** Git pushes do NOT auto-deploy. You must run `wrangler deploy` manually every time you want changes to go live. Do NOT use the Cloudflare dashboard "New deployment" upload — it only uploads the single file you drop in, not the full site.

**Every time you make changes:**

1. Edit the files in `C:\AIL\website`
2. Open a terminal and navigate to the repo:
   ```
   cd C:\AIL\website
   ```
3. Deploy to Cloudflare:
   ```
   wrangler deploy
   ```
4. Changes are live within seconds at [authorityindexlabs.com](https://authorityindexlabs.com)
5. Commit and push to GitHub to keep the repo in sync:
   ```
   git add -A
   git commit -m "your message"
   git push
   ```

**First time only:** If `wrangler` isn't installed, run `npm install -g wrangler` first, then authenticate with `wrangler login`.

---

## Setup and Deployment

### Verify a deployment

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers and Pages** > **website** > **Deployments**
3. Confirm the latest deployment shows **Successful**
4. Preview at: `https://website.adam-af6.workers.dev`

### Add the custom domain

1. Cloudflare dashboard > **Workers and Pages** > **website** > **Settings** > **Domains and Routes**
2. Click **Add Custom Domain**
3. Add both `authorityindexlabs.com` and `www.authorityindexlabs.com`
4. Cloudflare auto-creates DNS records (DNS must be managed on Cloudflare)

---

## Dropping in script snippets

Both snippets have placeholder comments in `<head>` of `index.html`:

**Termly cookie consent** (GDPR/CCPA compliance):
1. Log in to [Termly](https://termly.io)
2. Navigate to your policy > **Embed Code**
3. Copy the embed script and paste it in `index.html`, replacing the Termly placeholder comment

**PostHog analytics:**
1. Log in to [PostHog](https://posthog.com)
2. Navigate to your project > **Project Settings** > **Snippet**
3. Copy the snippet and paste it in `index.html`, replacing the PostHog placeholder comment

After pasting either snippet, run `wrangler deploy` from `C:\AIL\website`, then commit and push to GitHub.

---

## Adding Termly legal content

Once you have Termly policy HTML ready:

1. Open `privacy.html` — paste the Termly HTML inside `<div id="termly-privacy-content">`
2. Open `terms.html` — paste the Termly HTML inside `<div id="termly-terms-content">`
3. Both pages keep the existing AIL navigation and footer intact
4. Commit and push

---

## Image assets checklist

Place these files in `assets/images/` before launch. The site has graceful fallbacks for all missing images, so you can deploy and fill these in as they become available.

| File | Description | Status |
|---|---|---|
| `ail-logo.png` | Primary AIL logo (navy + gold) — use on white/light backgrounds | Provide |
| `ail-logo-white.png` | White version for dark footer — if missing, CSS filter fallback activates | Provide |
| `adam-headshot.jpg` | Adam's professional headshot, square crop works best | Provide |
| `tessera-logo.png` | Tessera product logo | Provide |
| `meriti-logo.png` | Meriti app icon | Provide |
| `nashville-bg.jpg` | Nashville skyline stock photo for hero — 1920x1080 minimum | Source and provide |
| `og-image.png` | 1200x630 social preview — navy background, AIL logo + tagline | Create |
| `favicon.ico` | Browser favicon — generate from AIL logo | Create |
| `apple-touch-icon.png` | 180x180 — generate from AIL logo | Create |

### Generating favicon and og-image

**favicon.ico and apple-touch-icon.png:** Use [favicon.io](https://favicon.io/favicon-converter/) — upload `ail-logo.png` and download the generated package. Drop `favicon.ico` and `apple-touch-icon.png` into `assets/images/`.

**og-image.png (1200x630):** Create in Figma, Canva, or similar:
- Navy background (`#1a3a6e`)
- AIL logo centered, approx 400px wide
- Tagline below in white Inter: "Integrity in architecture, not just policy."
- Export as PNG at 1200x630

---

## Local preview

Since this is plain HTML with a CDN-loaded Tailwind, you can preview locally by opening `index.html` directly in a browser. Anchor links and navigation work without a server. The Nashville hero background and logo images will show as broken until the actual files are placed in `assets/images/`.

For a closer-to-production preview (proper routing for `/privacy.html` and `/terms.html`), run a simple local server:

```
npx serve .
```

or with Python:

```
python -m http.server 8080
```

---

## File structure

```
website/
├── index.html              Single-page site
├── privacy.html            Privacy policy (Termly placeholder)
├── terms.html              Terms of service (Termly placeholder)
├── wrangler.jsonc          Cloudflare Workers static assets config
├── assets/
│   ├── images/             All image assets (see checklist above)
│   └── icons/              Inline SVG icons (currently embedded in HTML)
└── README.md               This file
```
