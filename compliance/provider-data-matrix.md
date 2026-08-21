# AI provider data matrix

**The source of truth for every no-training and retention claim in our published documents.**

Built 2026-08-01 for AUT-569. Before changing any sentence in `terms.html`, `privacy.html`, or the
your-tessera.com privacy page that touches training, retention or provider handling, check it
against this table. If the claim is not supported here, either fix the claim or update this table
with new evidence first.

Not published. `compliance/` is listed in `.assetsignore`, so Cloudflare Workers Assets does not
serve it. It records internal contract status, which is not something to publish.

---

## The finding that shapes the copy

**Neither executed DPA contains a no-training commitment.** We hold signed Data Processing
Addenda with Anthropic and OpenAI. Both were read in full on 2026-08-01. They cover
sub-processors, security measures, deletion on termination, CCPA and the Standard Contractual
Clauses. Neither one says anything about model training. The only occurrences of the word
"training" in either document refer to staff security training.

So Terms section 33's claim that these providers are on "executed no-training terms" overstates
what we have. The no-training position is real for both, but it comes from their **published API
defaults** plus, for OpenAI, an org-level setting we control. Not from anything we negotiated.
That distinction has to survive into the copy, because a published default can be changed
unilaterally with notice and a contract cannot.

## Resolved on 2026-08-01, same day

Two of the three gaps found in the first pass were closed by Adam within the hour. Recorded here
so the copy is written against the CURRENT position, not the one that prompted the ticket.

* ✅ **Voyage AI is opted out of training.** Verified in the Voyage dashboard (Organization,
  Terms of Service, toggle showing **Opted Out**). Their FAQ describes the effect as zero-day
  retention: content provided after the opt-out is deleted immediately after processing.
  ⚠️ **Not retroactive**, see the Voyage row.
* ✅ **xAI Zero Data Retention is enabled.** Verified by the `ZDR` badge on the Tessera team in
  the xAI Console, which is xAI's own documented confirmation method. This turns xAI from the
  weakest row in the table into one of the strongest, and it does so on a standard account.
* ✅ **OpenAI org-level sharing is fully disabled.** All three toggles under Data controls,
  Sharing are set to Disabled: feedback and chats, evaluation and fine-tuning data, and inputs
  and outputs. Notably the third one carries a free-token incentive to enable it, which is
  declined.

## The one caveat that survives

**The Voyage opt-out does not reach backwards.** Their terms say content provided before the
opt-out may continue to be used. Voyage receives the *text of stored memory facts*, including
health and financial values that are decrypted for the duration of that request, so every fact
embedded before 2026-08-01 sits inside the old licence.

Nothing in the published documents currently says anything about this, and nothing needs to,
since the documents describe present practice. Flagged because it is a real fact about real user
data and the decision to say nothing should be a decision rather than an oversight.

---

## Matrix

Legend for "No-training basis":

- **Negotiated**: we hold an executed agreement whose text commits them.
- **Published default**: their public API terms commit them, with no agreement of ours involved.
  Real, but unilateral, and they can change it with notice.
- **Not committed**: no commitment applies to us today.

| Provider | What we send | Executed agreement on file | No-training basis | Retention of our content | ZDR | Permitted use during retention |
| --- | --- | --- | --- | --- | --- | --- |
| **Anthropic** | Chat prompts and responses; memory extraction | **Yes**, `Data Processing Addendum _ Anthropic.pdf` (22pp, read 2026-08-01). Contains **no** training clause. | **Published default.** Commercial Terms state API content is not used to train, and retained data is never used for training without express permission. | Conversation content **not retained by default** on the Messages API. Flagged content up to **2 years**. | Available on request. **We have not requested it.** Not needed for the default path, since content is not retained anyway. | Automated trust-and-safety classification. Flagged sessions may be retained up to 2 years. |
| **OpenAI** | Chat; **moderation screening of every message**; image generation | **Yes**, two documents, both read 2026-08-01. Contain **no** training clause. | **Published default, plus a setting we control.** "As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models unless you explicitly opt in." All three org-level sharing toggles verified **Disabled** on 2026-08-01, including the one that offers free daily tokens in exchange for enabling it. | ⚠️ **Up to 30 days** abuse-monitoring logs, by default, for all API usage. **This is the only retention window left in the table.** | Requires **prior approval** from OpenAI. Not obtained. Adam's decision 2026-08-01: accept the default and describe it honestly. | Abuse monitoring. **Human review is possible**: content is excluded from human review only under ZDR, and even then not where law requires. Under Safety Retention, flagged content may be retained and human-reviewed. |
| **Google Cloud (Vertex AI)** | Gemini chat; image generation | **No**, nothing on file. Google Cloud terms apply by acceptance. | **Published default.** Google Cloud does not use customer data to train its foundation models, and states it will not train or fine-tune without prior permission or instruction. | Not established. Caching is customer-configurable. **Needs confirmation against our project's settings.** | Not established for our configuration. | Not established. |
| **xAI (Grok)** | Chat prompts and responses | **No**, nothing on file. Standard (non-Business) account. | ✅ **Covered by ZDR**, which is a setting we control rather than a tier we pay for. xAI's docs state that under ZDR, prompts, completions and associated metadata are not stored, logged, or used for any purpose **including model training, abuse monitoring, and product improvement**, beyond the immediate API call. | **None.** xAI's documented 30-day audit retention does not apply to ZDR-enabled teams. | ✅ **ENABLED 2026-08-01.** Verified by the `ZDR` badge on the Tessera team in the Console, xAI's own documented confirmation method. | Nothing beyond serving the request. |
| **Voyage AI** | ⚠️ **The text of stored memory facts**, including health and financial values decrypted for the request | **No**, nothing on file. | ✅ **Opted out 2026-08-01.** Their default terms grant a worldwide, irrevocable, perpetual, royalty-free licence to use customer content to train AI models **unless you opt out**. We have opted out. | Zero-day going forward: content is deleted immediately after processing. ⚠️ **Content sent BEFORE the opt-out remains inside the original licence.** | Opt-out toggle, Organization, Terms of Service. Verified showing **Opted Out**. | Nothing, going forward. |
| **Cartesia** | Voice transcription (**not live**) | **No**, nothing on file. | Not committed by default. Their DPA offers a Zero Data Retention setting that prohibits storage, logging and training. | Depends on the ZDR setting. | Available as a setting. | Automated and manual review of inputs and outputs is reserved. |
| **OpenRouter** (a routing layer, not a model provider) | ⚠️ **Nothing yet.** The wiring merged 2026-08-20 but the lane is switched off (`OPENROUTER_ENABLED=false`) and no model is enabled, so no user content has reached them. Planned: background memory jobs, starting with the follow-up query rewriter and later extraction, which carry **decrypted memory facts including health and financial values**. | **No**, nothing on file. A DPA is available **on request** and has not been requested. Liability is capped at the greater of 12 months of fees or **$100**, and they disclaim warranties for regulated and customer-facing use. | **Published default.** "OpenRouter does not use your Inputs or Outputs for model training." Read 2026-08-20. | **Prompt and response text not stored.** Input and Output Logging is off by default and verified off 2026-08-20. Request **metadata is** retained: model, host, token counts, latency, cost. ⚠️ Turning logging on stores prompts and responses for a **minimum of 3 months** and, per their Terms, grants rights to "license or sell your User Content in anonymized form". It carries a **1% usage discount**, so it must stay off and be re-verified. | ✅ **Account-level Zero Data Retention enabled 2026-08-20**, every row including frontier, verified in Settings, Privacy. Our code also sends `zdr: true` and `data_collection: "deny"` on every request. The per-request setting ORs with the account setting and can only tighten, never loosen. | Routing only. They are not the party running the model. |
| **CoreWeave and Venice** (the companies that actually run DeepSeek V4 Flash, reached through OpenRouter) | Same as the OpenRouter row. Nothing yet. | **No**, and there will not be one. We have no direct relationship with either; they are reachable only through OpenRouter. | ⚠️ **OpenRouter's classification, not their own terms read by us.** Both sit in OpenRouter's "retains nothing" group, and OpenRouter reports `canPublish: false` for all 30 companies serving this model. **Neither company's own terms have been read.** See open item 10. | Stated as none by that classification. Not independently verified. | ✅ Enforced per request by our own code, not by any contract. ⚠️ **The host pin is agreed but NOT yet implemented** (AUT-811). Until it ships, a request can reach any of the 30 companies serving this model, including DeepSeek's own service in China, which trains on inputs and retains them. | Serving the request. |

---

## A structural difference in the two OpenRouter rows

Every other row in this table names one company that receives content under one policy. The
OpenRouter rows do not work that way, and the copy has to respect the difference.

1. **The counterparty is not the processor.** Our agreement, such as it is, would be with
   OpenRouter. The company that actually sees the conversation is whoever is running the model
   that day. Measured 2026-08-20: four identical requests reached three different companies.
2. **The control is code, not a console toggle and not a contract.** Rule 6 below already warns
   that three claims rest on settings that can be un-set. This one is weaker still: it rests on a
   block of JSON our services attach to every request. A refactor that drops it makes the
   published copy false with no console change, no deploy failure and no error.
3. **DeepSeek the company is not in the path, by design.** DeepSeek V4 Flash is open weights.
   DeepSeek publishes it; 30 other companies run it, and DeepSeek's own endpoint is among the
   most expensive on the list. Pinned to CoreWeave and Venice, DeepSeek receives nothing.
   Unpinned, it can receive everything, and it is the one host on that list that trains on inputs.

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
| OpenRouter | https://openrouter.ai/privacy ; https://openrouter.ai/terms ; https://openrouter.ai/docs/guides/features/input-output-logging ; https://openrouter.ai/docs/features/provider-routing ; the account's Settings, Privacy page. All read **2026-08-20**. |
| DeepSeek V4 Flash hosts | https://openrouter.ai/api/v1/providers ; https://openrouter.ai/api/v1/models/deepseek/deepseek-v4-flash/endpoints ; live routing tests through our own client. All read **2026-08-20**. |

---

## Open items

1. ✅ ~~Opt Voyage AI out of training.~~ Done 2026-08-01.
2. ✅ ~~Confirm the xAI account tier.~~ Standard account, but ZDR enabled 2026-08-01, which is the
   stronger control and does not require a Business tier.
3. ✅ ~~Decide on OpenAI ZDR.~~ Adam's call 2026-08-01: **accept the default** and describe the
   30-day abuse-monitoring window honestly. It needs OpenAI's approval, it takes time, and an
   accurate sentence about it is not damaging. Revisit if a customer asks.
4. ✅ ~~Decide on Anthropic ZDR.~~ Adam's call 2026-08-01: leave it. Their default is already no
   retention of conversation content, which is stronger than ZDR would add.
5. **Confirm the OpenAI Data retention tab.** The Sharing tab was verified; the adjacent
   **Data retention** tab under Data controls was not. If it shows a retention control we have
   not set, the OpenAI row's "up to 30 days" may be adjustable. Low stakes, but it is the last
   unread setting.
6. **Confirm Google Cloud project settings** for caching and retention, so the Vertex row can be
   completed rather than left at "not established".
7. **Possible follow-up, not a gap:** xAI returns an `x-zero-data-retention` response header on
   every call. We could assert on it and alert if it ever comes back false, which would turn a
   silently-reverted console setting into a visible failure. Worth a ticket if the connector work
   ever touches that adapter.
8. **Request OpenRouter's DPA** (AUT-801). It is available on request and we have not asked.
   This is the only row in the table where a background job would send decrypted memory facts to
   a company we hold nothing with. Blocking before any user content moves.
9. ✅ ~~**Ship the host pin** (AUT-811).~~ **DONE 2026-08-20.** `only: ["coreweave", "venice"]`
   plus `allow_fallbacks: false` rides on every request, in BOTH services, from a single shared
   definition per service. Each repo pins the exact dict in a test, so changing one alone fails
   there rather than drifting. The background path also compares the host OpenRouter reports back
   against the pinned set and logs `openrouter_host_outside_pin` at WARNING — a request served by
   an unpinned company would otherwise make this table false while every response still looked
   perfectly healthy.
10. **Read CoreWeave's and Venice's own terms.** That row currently rests entirely on OpenRouter's
   classification of them, and OpenRouter's own routing docs say their provider policy data "is
   not a definitive source of third party data policies, but represents our best knowledge."
   That is thinner evidence than anything else in this table.
11. **Re-verify the OpenRouter logging toggle on a schedule.** It pays a 1% discount to turn on,
   which is the same shape as the OpenAI free-token incentive we already decline. An incentive to
   weaken a claim is a reason to re-check the claim, not a reason to trust it once.

---

## Rules this matrix imposes on the copy

1. **Never write that content is "done" or discarded immediately after answering.** OpenAI keeps
   abuse-monitoring logs for up to 30 days, and OpenAI screens every message. This is the single
   rule most likely to be broken by well-meaning marketing copy.
2. **"Not used to train" and "not retained" are different promises.** Say which one applies. As
   of 2026-08-01 we can say both for xAI and Voyage, no-training-plus-no-default-retention for
   Anthropic, and no-training-with-a-30-day-window for OpenAI.
3. **Where a commitment is a provider's published default, or a console setting we chose, do not
   phrase it as though we negotiated it.** We have executed DPAs with two providers and neither
   mentions training.
4. **A blanket "every provider" sentence is now technically supportable on no-training, and still
   should not be written.** It would go stale the moment a provider is added, and the next person
   to add one will not read this file. Name the providers.
5. **Health and financial values are decrypted before they reach the embedding provider.** Any
   sentence implying encryption protects them from providers is wrong.
6. **Settings can be un-set.** Three of the strongest claims in this table now rest on console
   toggles rather than contracts: xAI ZDR, the Voyage opt-out, and OpenAI's sharing switches. If
   any of them is reverted, the copy becomes false with no code change and no deploy. That is an
   argument for periodic re-verification, not for weaker copy.
7. **Never name DeepSeek as a company we send data to.** Under the pinned configuration it
   receives nothing: it publishes the weights, other companies run them. Naming it would be wrong
   in both directions at once, implying a relationship we do not have while hiding the companies
   that actually see the content. Name the host, CoreWeave or Venice.
8. **The OpenRouter guarantee lives in our source code.** A stronger version of rule 6. A console
   toggle that gets reverted is at least visible in a console. A dropped JSON block is visible
   nowhere, and the request still succeeds. Copy resting on it should be re-checked whenever the
   provider adapter changes, and the served host should be recorded per call so the claim can be
   audited after the fact rather than asserted.
