# Proposal: name providers in the Privacy Policy, not in the Terms

**Status: DRAFT, not adopted, not published.** Written 2026-08-21 for attorney review.

**The problem it solves.** Every time we change which model runs a background job, the Terms have to be
re-papered, because section 28 enumerates providers by name inside the contract. Adding a name to a
contract is arguably a change to the agreement, which drags in our own 30-day notice and
re-acceptance promise. That makes a routine engineering decision expensive, and an expensive
disclosure is one that eventually does not get made.

**The shape of the fix.** Move the *permission* into the Terms and the *names* into the Privacy
Policy, where they can be maintained as a living list. This is the ordinary pattern for
sub-processor disclosure and it is what most vendors do.

⚠️ **Read the two warnings at the bottom before adopting any of this.** One is about what we can
honestly promise, and it is the reason the wording below says "require" rather than "ensure".

---

## 1. Terms, section 28 — THIRD-PARTY AI PROVIDER TERMS ACKNOWLEDGMENT

### Current

> When using Tessera, your conversations are processed by third-party AI service providers
> (currently Anthropic, OpenAI, xAI, Google Cloud Vertex AI, Cartesia for speech to text where
> offered, Voyage AI for the text embeddings used in memory retrieval, and OpenRouter for routing
> certain background tasks to the two United States hosting companies named in the Privacy
> Policy), each subject to their own terms of service. By using Tessera, you acknowledge that the
> AI provider's terms apply to your interactions in addition to these Terms. Tessera is not
> responsible for AI providers' policies, model behaviors, or content their models generate.

### Proposed

> When using Tessera, your conversations are processed by third-party AI service providers, each
> subject to their own terms of service. By using Tessera, you acknowledge that the applicable
> provider's terms apply to your interactions in addition to these Terms. Tessera is not
> responsible for AI providers' policies, model behaviors, or content their models generate.
>
> **The providers we currently use are listed in our Privacy Policy, and that list is kept current
> as providers change.** We may add, remove or substitute providers, including for automated
> background processing that supports the Service. Where we do so for background processing, we
> require providers that do not retain your content beyond what is needed to answer the request.
> A change of provider is reflected in the Privacy Policy rather than by amendment of these Terms.

### What changed, and why each part is there

| Change | Reason |
|---|---|
| The parenthetical list is gone | It is the thing that made every model change a contract change. |
| "listed in our Privacy Policy, and that list is kept current" | The disclosure survives. Removing the names entirely would leave a user unable to find out who processes their content, which is the question a person, an app store reviewer, or a business customer actually asks. |
| "add, remove or substitute" | The permission itself. This is what removes the re-papering. |
| "**we require** providers that do not retain" | See warning A. We can promise what we require. We cannot promise what a third party does. |
| "reflected in the Privacy Policy rather than by amendment of these Terms" | States plainly that a provider change is not a change to the agreement, which is what disposes of the 30-day notice question rather than leaving it ambiguous. |

---

## 2. Terms — the no-training paragraph

The existing paragraph names each provider and what each one commits to. **It should keep doing
that**, and this proposal does not touch it, for one reason: it is a statement of fact about
specific companies, not an enumeration that constrains our choices. Generalising it would convert
several precise, defensible sentences into one vague one.

The only edit needed is a closing sentence tying it to the living list:

> Where we add a provider for background processing, its position on training and retention is
> recorded in our Privacy Policy at the time it is added.

⚠️ Do **not** replace that paragraph with a blanket "no provider trains on your content". Our own
compliance matrix (rule 4) already forbids that sentence: it would go stale the moment a provider
is added, and the next person to add one will not read this file.

---

## 3. Privacy Policy — the provider list becomes explicitly living

### Current

> The specific service providers we currently use, and what each one does for us, are: [list]

### Proposed

> The specific service providers we currently use, and what each one does for us, are listed
> below. **We update this list when we add, remove or substitute a provider.** For automated
> background processing that supports the Service, we may change which provider or model performs
> a given task; when we do, we require providers that do not retain your content beyond what is
> needed to answer the request, and we update this list accordingly.
>
> [list unchanged]

### What changed

Two sentences. The list stays exactly as it is. The point is to say out loud that it is maintained,
which is what lets the Terms point at it instead of duplicating it.

---

## Warning A: "require" is not "guarantee", and the difference is load-bearing

The natural sentence to write is "we only use providers that do not retain your content". **We
cannot support that sentence.**

What we actually have, for the OpenRouter lane, is:

* our own code sends `zdr: true` and `data_collection: "deny"` on every request; and
* OpenRouter routes only to hosts **it classifies** as zero-retention.

That classification is OpenRouter's published assessment of a third party, not a term we have
negotiated with that third party. OpenRouter's own routing documentation says its provider data
policy information "is not a definitive source of third party data policies, but represents our
best knowledge."

So "we require" is true and provable from our own source code. "Your content is never retained"
would be a promise resting on someone else's opinion. The wording above is deliberate on this
point and should survive editing.

## Warning B: this is a change to what users agree to, not housekeeping

Adding a name to a list is housekeeping. **Broadening the permission a user grants is not.** Two
things follow:

1. **This wants an attorney's eyes**, unlike the 2026-08-21 change that simply added OpenRouter to
   the existing named list.
2. **The 30-day notice question applies to THIS edit**, even though the whole point of the edit is
   to stop it applying to future ones. Adopting it may itself be the notified change.

## Warning C: every location, or none

`project_legal_documents.md` lists thirteen places a policy claim lives. At minimum this edit
touches `terms.html`, `privacy.html`, and the in-app summary in
`tessera-app/src/lib/legal-content.ts` whose own comment says it is "kept in lockstep with the
pre-auth LegalGate acknowledgement and the published privacy policy". The in-app copy needs a
mobile build, so the sequencing has to be decided rather than discovered.

Also note the four version markers already disagree across surfaces (app `2026-07-20`, web
`2026-07-03`, published "July 19", in-app "June 18"). If a notified change is going out anyway,
that is the moment to reconcile them.
