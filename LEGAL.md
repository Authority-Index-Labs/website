# The legal recipe card

**One document changes, this many places change with it.** This file exists because on
2026-08-01 an audit found four version markers holding four different values for the same set of
documents, and two material Terms changes that shipped with no version bump on any surface.

Written for AUT-573. If you change a policy and do not follow this, the version markers will
drift again, and the next person will find out from a regulator rather than from a test.

---

## The one fact

**There is exactly one version, and it is the day the published documents last changed.**

It is written two ways, and they are the same fact in two formats:

| Format | Where | Example |
| --- | --- | --- |
| Human date | the `Last updated` line in the published HTML | `August 1, 2026` |
| ISO date | `LEGAL_VERSION` in both clients | `2026-08-01` |

If those two ever describe different days, something is wrong. Do not "fix" it by picking one.
Find out which change was published and which was not.

**Current value: `2026-08-01`.**

---

## A. Every location

Grep before trusting this table. It was accurate on 2026-08-01 and tables rot.

### The binding documents (repo: `website`, MANUAL deploy)

| File | Holds |
| --- | --- |
| `terms.html` | the contract, including section 6 trial, section 7 refunds, section 39 referral program |
| `privacy.html` | the privacy notice |
| `cookies.html` | the cookie policy |
| `security.html` | the vulnerability disclosure program. Terms section 8's probing carve-out points here, so deleting this page silently makes that clause inert again. |
| `.well-known/security.txt` | RFC 9116 security contact |
| `compliance/provider-data-matrix.md` | internal, NOT published. The evidence behind every no-training and retention claim above. Check claims against it before writing them. |

⚠️ **`security.txt` expires.** RFC 9116 makes `Expires` mandatory and scanners treat an expired
file as invalid, so it silently stops working rather than failing loudly. **The current value is
`2027-08-01`. Renew it before then**, and keep the window under a year.

⚠️ **This site does not deploy on merge.** Publishing is a manual `wrangler` run from a working
directory. Merging to `main` changes nothing that a user can see. See "Publishing" below, and
note the near-miss on 2026-08-01 where a clean tree on a stale branch would have reverted live
legal copy.

### The mobile client (repo: `tessera-app`)

| File | Holds |
| --- | --- |
| `src/lib/profile-api.ts` | `LEGAL_VERSION`, the value recorded as the user's consent |
| `src/lib/legal-content.ts` | the in-app **summary** screens and `LEGAL_SUMMARY_REVISED` |
| `src/lib/legal-links.ts` | `TERMS_URL`, `PRIVACY_URL`, `REFUND_URL` (`#returnno`), `REFERRAL_TERMS_URL` (`#addclausel`) |
| `src/components/onboarding/LegalGate.tsx` | the sign-up checkbox copy and what it opens |
| `src/components/legal/ReConsentGate.tsx` | the re-consent prompt |
| `src/context/ReConsentContext.tsx` | decides who is re-prompted, by comparing the stored version to `LEGAL_VERSION` |
| `__tests__/legal.test.tsx` | the guard. It asserts the summary does not contradict the published documents. |

⚠️ The in-app screens are a **summary**, not the agreement, and they say so. The sign-up gate
opens the published Terms in a browser, not the summary. That was fixed in AUT-567; do not
route consent back to the summary.

### The web client (repo: `tessera-web`)

| File | Holds |
| --- | --- |
| `src/lib/legal/consent.ts` | `LEGAL_VERSION`, gate copy, all four URLs |
| `src/lib/legal/consent.test.ts` | the parity pin |
| `src/lib/legal/profile-api.ts` | posts the consent record, reads gate-complete |
| `src/lib/legal/gate-cookie.ts` | the 180-day "already gated" cookie |
| `src/app/legal-gate/page.tsx` | the gate itself |

⚠️ **The web client has no re-consent path at all.** Its gate-complete check is
`flags.age_verified_18 === true`, a boolean that never changes, so bumping `LEGAL_VERSION`
re-prompts nobody on web. `gate-cookie.ts` says re-consent is "enforced server-side"; nothing
server-side looks at `legal_version`. Tracked as AUT-591. **Until that lands, a re-consent
cycle only reaches mobile users.**

### The marketing site (repo: `tessera-website`, CI deploy)

Claim-bearing copy, no version marker of its own. `privacy.html`, `pricing.html`, `faq.html`,
`index.html`, `compare.html`, `about.html`, `guides/*`, `for/*`, `llms.txt`, `404.html`.

A 2026-07 audit found the same claim repeated in seven homepage places and seven privacy places
plus `llms.txt`, `faq.html`, `pricing.html`, `compare.html`, two guides and a phone mockup
image. **Grep the whole repo for the sentence, not the page you remember.** `scripts/check-site.mjs`
runs in CI and checks links, canonicals and sitemap coverage, but it cannot check whether a
claim is true.

### The server (repo: `tessera-api`)

`POST /v1/profile/legal` stores whatever `legal_version` the client sends, with no validation.
`GET /v1/profile/flags` is what both clients read to decide whether the gate is done.

### Outside the repos, and only Adam can change these

* **App Store Connect** — privacy nutrition label, EULA link, app description. Note that on the
  standard Apple EULA the Terms link in the description must be Apple's `stdeula` URL, not ours.
* **Google Play Console** — Data Safety form.

---

## B. When a policy changes

1. **Edit the published document** in `website`. That is the origin. Everything else describes it.
2. **Set the `Last updated` line** in every document you touched. All three currently carry the
   same date; if you change only one, they will disagree and that is a finding, not a detail.
3. **Update the in-app summary** in `tessera-app/src/lib/legal-content.ts` if the change touches
   anything the summary says, and set `LEGAL_SUMMARY_REVISED` to the same day.
4. **Bump `LEGAL_VERSION`** to the ISO form of that day, in **both** clients:
   * `tessera-app/src/lib/profile-api.ts`
   * `tessera-web/src/lib/legal/consent.ts`
   Update the pinned value in each repo's test in the same commit. The pin is there so that
   bumping one repo and forgetting the other fails a build rather than passing quietly.
5. **Grep `tessera-website`** for any marketing claim the change makes false.
6. **Decide, in writing, whether this is a material change.** See below.
7. **Publish**, in this order.

## Publishing, in order

The order matters. Do not bump a client to a version whose document is not live yet, or you will
ask users to accept something they cannot read.

1. `website` — **manual.** Confirm the branch is `main` and the tree is clean, then deploy.
   Publishing pushes the **working directory**, not the commit, so a stale branch with a clean
   tree will silently revert live legal copy.
2. `tessera-website` — CI on merge. **Read the build status.** A dead build token looks exactly
   like "no CI" (AUT-558).
3. `tessera-web` — CI on merge to `main`. `NEXT_PUBLIC_*` is inlined at build time.
4. `tessera-app` — needs an EAS build and a store release. This is the slow one, so plan the
   re-consent timing around it.

---

## C. Material changes, re-consent, and the 30-day notice

Our own Terms, under "AGREEMENT TO OUR LEGAL TERMS", commit us to **at least 30 days' notice by
email and re-acceptance for material changes.**

A change is material if it alters what someone agreed to, rather than describing more clearly
what was already true. Use this test:

| Material, needs notice and re-consent | Not material |
| --- | --- |
| a new category of data collected | a clearer description of data already collected |
| a new third party receiving data | naming a sub-processor already covered by a category |
| a change to fees, billing, trial or refunds | a typo, a formatting change, a working link |
| a change to arbitration, class waiver, governing law or liability | reordering sections |
| a new obligation on the user | an example added to an existing obligation |

If it is material:

* Say so in the ticket, explicitly.
* Bump `LEGAL_VERSION`, which re-prompts mobile users on their next app launch after the release.
* **Hand the email step to Adam.** Nothing in the codebase sends this. Do not assume it happened.
* Remember the 30 days runs from the notice, not from the merge.

---

## D. Known drift found on 2026-08-01

Recorded so the same four values are not "discovered" again.

| Location | Was | Now |
| --- | --- | --- |
| `website/terms.html`, `privacy.html`, `cookies.html` | July 19, 2026 | August 1, 2026 |
| `tessera-app` `LEGAL_VERSION` | 2026-07-20 | 2026-08-01 |
| `tessera-web` `LEGAL_VERSION` | 2026-07-03 | 2026-08-01 |
| `tessera-app` `LEGAL_SUMMARY_REVISED` | June 18, 2026 | August 1, 2026 |

Two material Terms changes had shipped with no bump on any surface: the referral net-revenue
basis (`fea972f`, 2026-07-31) and the refund policy (`9adba07`, 2026-07-22). There is no
evidence the 30-day notice ran for either.

`tessera-web/src/lib/legal/consent.ts` claimed in its own header that every string and the
version were "mirrored VERBATIM from the mobile app." The version had been wrong by seventeen
days. A comment asserting parity is not parity; the pinned test is.
