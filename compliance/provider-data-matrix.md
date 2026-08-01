# AI provider data matrix

**The source of truth for every no-training and retention claim in our published documents.**

Built 2026-08-01 for AUT-569. Before changing any sentence in `terms.html`, `privacy.html`, or the
your-tessera.com privacy page that touches training, retention or provider handling, check it
against this table. If the claim is not supported here, either fix the claim or update this table
with new evidence first.

Not published. `compliance/` is listed in `.assetsignore`, so Cloudflare Workers Assets does not
serve it. It records internal contract status, which is not something to publish.

---

## The two findings that matter most

**1. Neither executed DPA contains a no-training commitment.** We hold signed Data Processing
Addenda with Anthropic and OpenAI. Both were read in full on 2026-08-01. They cover
sub-processors, security measures, deletion on termination, CCPA and the Standard Contractual
Clauses. Neither one says anything about model training. The only occurrences of the word
"training" in either document refer to staff security training.

So Terms section 33's claim that these providers are on "executed no-training terms" overstates
what we have. The no-training position is real for both, but it comes from their **published API
defaults**, not from anything we negotiated. That distinction has to survive into the copy.

**2. Voyage AI's terms grant them a licence to train on our users' memory, and we have not opted
out.** This is the sharpest item in the table and the one with actual exposure. Voyage receives
the *text of stored memory facts*, including health and financial values which are decrypted for
the duration of that request. See the Voyage row.

---

## Matrix

Legend for "No-training basis":

- **Negotiated** — we hold an executed agreement whose text commits them.
- **Published default** — their public API terms commit them, with no agreement of ours involved.
  Real, but unilateral, and they can change it with notice.
- **Not committed** — no commitment applies to us today.

| Provider | What we send | Executed agreement on file | No-training basis | Retention of our content | ZDR | Permitted use during retention |
| --- | --- | --- | --- | --- | --- | --- |
| **Anthropic** | Chat prompts and responses; memory extraction | **Yes** — `Data Processing Addendum _ Anthropic.pdf` (22pp, read 2026-08-01). Contains **no** training clause. | **Published default.** Commercial Terms state API content is not used to train, and retained data is never used for training without express permission. | Conversation content **not retained by default** on the Messages API. Flagged content up to **2 years**. | Available on request. **We have not requested it.** Not needed for the default path, since content is not retained anyway. | Automated trust-and-safety classification. Flagged sessions may be retained up to 2 years. |
| **OpenAI** | Chat; **moderation screening of every message**; image generation | **Yes** — two documents, both read 2026-08-01. Contain **no** training clause. | **Published default.** "As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models unless you explicitly opt in." | **Up to 30 days** abuse-monitoring logs, by default, for all API usage. | Requires **prior approval** from OpenAI. **We have not obtained it.** | Abuse monitoring. **Human review is possible**: content is excluded from human review only under ZDR, and even then not where law requires. Under Safety Retention, flagged content may be retained and human-reviewed. |
| **Google Cloud (Vertex AI)** | Gemini chat; image generation | **No** — nothing on file. Google Cloud terms apply by acceptance. | **Published default.** Google Cloud does not use customer data to train its foundation models, and states it will not train or fine-tune without prior permission or instruction. | Not established. Caching is customer-configurable. **Needs confirmation against our project's settings.** | Not established for our configuration. | Not established. |
| **xAI (Grok)** | Chat prompts and responses | **No** — nothing on file. | ⚠️ **Depends on our account tier, which is unverified.** xAI's default consumer terms treat prompts as User Content usable "to develop and improve our Service and to conduct research". No-training is a **Business/Enterprise tier** property, not a universal one. | ~30 day window reported even after deletion on consumer terms. | Advertised as available on enterprise APIs. | Not established. |
| **Voyage AI** | ⚠️ **The text of stored memory facts**, including health and financial values decrypted for the request | **No** — nothing on file. | ⚠️ **NOT COMMITTED.** Their terms grant a worldwide, irrevocable, perpetual, royalty-free licence to use customer content to train and develop the service, **including training AI models**, unless you opt out. | Indefinite absent an opt-out. | Opt-out is available in the dashboard and produces zero-day retention. **Requires a payment method on file and org Admin.** | Training, improvement and development of their service. |
| **Cartesia** | Voice transcription (**not live**) | **No** — nothing on file. | Not committed by default. Their DPA offers a Zero Data Retention setting that prohibits storage, logging and training. | Depends on the ZDR setting. | Available as a setting. | Automated and manual review of inputs and outputs is reserved. |

---

## Sources, with the date read

All read **2026-08-01** unless noted.

| Provider | Source |
| --- | --- |
| Anthropic | `C:\AIL\Tessera\compliance docs\Data Processing Addendum _ Anthropic.pdf`; https://platform.claude.com/docs/en/manage-claude/api-and-data-retention |
| OpenAI | `...\Data Processing Agreement (Authority Index Labs and OpenAI).pdf`; `...\OpenAI Data Processing Addendum _ OpenAI.pdf`; https://developers.openai.com/api/docs/guides/your-data |
| Google Cloud | https://docs.cloud.google.com/generative-ai-app-builder/docs/data-governance |
| xAI | https://x.ai/legal/terms-of-service-enterprise |
| Voyage AI | https://www.voyageai.com/tos ; https://docs.voyageai.com/docs/faq |
| Cartesia | https://www.cartesia.ai/legal/dpa |

---

## Open items for Adam

None of these are code changes, so none of them can be closed from a branch.

1. ⚠️ **Opt Voyage AI out of training.** Dashboard, Organization, Terms of Service, toggle Opted In
   to Opted Out. Needs a payment method on file and org Admin. **It is not retroactive**: their
   terms say content provided before the opt-out may continue to be used. Every memory fact
   embedded to date is already inside that licence.
2. **Confirm the xAI account tier.** If we are on standard rather than Business or Enterprise
   terms, xAI cannot appear in any no-training sentence, and it is named in the sign-up consent
   checkbox as a live provider.
3. **Decide whether to request OpenAI ZDR / Modified Abuse Monitoring.** Today every message is
   screened by OpenAI moderation, so OpenAI sees more of our traffic than any other provider,
   and the default is a 30-day log with human review possible.
4. **Confirm Google Cloud project settings** for caching and retention, so the Vertex row can be
   completed rather than left at "not established".
5. **Decide whether Anthropic ZDR is worth requesting.** Probably not: their default is already
   no retention of conversation content, which is stronger than a ZDR arrangement would add.

---

## Rules this matrix imposes on the copy

1. Never write a sentence covering "every provider" or "all providers". Voyage alone breaks it.
2. Never write that content is "done" or discarded immediately after answering. OpenAI keeps
   abuse-monitoring logs for up to 30 days.
3. "Not used to train" and "not retained" are **different promises**. Say which one applies.
4. Where a commitment is a provider's published default rather than something we negotiated, do
   not phrase it as though we negotiated it.
5. Health and financial values are decrypted before they reach Voyage. Any sentence implying
   encryption protects them from providers is wrong.
