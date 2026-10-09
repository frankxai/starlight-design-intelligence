# Honor and responsibility

**Honor what you received. Take responsibility for what you pass on.**

This is the owner-authorized foundation from [execution brief #44](https://github.com/frankxai/starlight-design-intelligence/issues/44), coordinated by [programme #201](https://github.com/frankxai/agentic-ops-hub/issues/201). It gives existing brands a shared responsibility, with a different expression in each. It does not select new identities, replace typography, establish fictional canon, or certify product availability.

Honor becomes visible in the work: acknowledge sources, exercise judgment, make something useful, and leave enough context for someone else to continue. Family and ancestral gratitude can inform the author's intention without requiring personal history to become public material. A story needs authorized facts; gratitude alone supplies no biography, quotation, endorsement, or claim about an ancestor's wishes.

## Seven principles in practice

| Principle | Daily action | What an artifact preserves | Contradiction to catch |
| --- | --- | --- | --- |
| Gratitude | Name a contribution you relied on | Source, credit, rights and context | Borrowed work presented as original |
| Truth | Separate what happened from what you hope will happen | Claim, evidence, revision and uncertainty | A proposal described as a working capability |
| Craft | Inspect and improve the actual result | A finished object and relevant checks | Output volume used as quality proof |
| Care | Consider who bears the cost of a mistake | Consent, access needs and limits | A person's private story used as a conversion device |
| Agency | Give the recipient a meaningful choice | Ownership, intervention and portable work | Dependence disguised as empowerment |
| Repair | Correct the record and make recovery possible | Correction, affected outputs and recovery status | Quietly replacing an error while leaving its consequences |
| Continuity | Make the next person's work easier | Decisions, dependencies and a usable handover | A triumphant completion note with no resumable result |

## Canonical expressions

| Brand ID | Existing authority | Added copy and behavior contract | Owning application lane |
| --- | --- | --- | --- |
| `frankx` | [Brand](../brand-packs/frankx/BRAND.md), [copy](../brand-packs/frankx/COPY.md) | [Work someone else can learn from](../brand-packs/frankx/NARRATIVE.md) | `frankxai/FrankX` #266; production uses `frankxai/frankx.ai-vercel-website` |
| `sis` | [Brand modes](../brand-packs/sis/BRAND.md), [product](../brand-packs/sis/PRODUCT.md), [content](../brand-packs/sis/CONTENT.md) | [Intelligence people can direct](../brand-packs/sis/NARRATIVE.md) | `frankxai/starlightintelligence.ai` #82; kernel registry also covers SIS product repositories |
| `gencreator` | [Brand](../brand-packs/gencreator/BRAND.md), [source authority](../brand-packs/gencreator/SOURCE_AUTHORITY.md) | [An edition with an author](../brand-packs/gencreator/NARRATIVE.md) | `frankxai/gencreator.ai` #5 |
| `arcanea` | [Brand](../brand-packs/arcanea/BRAND.md), [copy](../brand-packs/arcanea/COPY.md), [source authority](../brand-packs/arcanea/SOURCE_AUTHORITY.md) | [An inheritance that asks for a choice](../brand-packs/arcanea/NARRATIVE.md) | Private creative backlog; owning canon review before promotion |
| `agentic-income` | [Brand](../brand-packs/agentic-income/BRAND.md), [design](../brand-packs/agentic-income/DESIGN.md) | [Useful work with full economics](../brand-packs/agentic-income/NARRATIVE.md) | `frankxai/agenticincome`; no new delivery scope selected by this change |

The canonical runtime packs reference these documents through their existing `sourceDocs` field. Their positioning, visual tokens, fonts and modes retain their existing authority. Consumers must read the narrative alongside the other source documents; a source pointer is not automatic adoption by an application.

## Interface contracts

These are proposed interaction requirements for owning repositories. Copy can describe a capability as available only after the stated check passes against the actual application revision.

| Principle and moment | Copy specimen | State transition | Acceptance evidence |
| --- | --- | --- | --- |
| Truth: task review | “Review the result and its evidence before accepting it.” | Submitted → under review → accepted or returned; a passing check alone never accepts the work | Reviewer can inspect the artifact, check scope and unresolved dependencies; returning it retains the submitted revision |
| Gratitude: attribution | “Built from these sources. Reviewed and changed by you.” | Source attached → credit checked → included in the edition | Credit follows the artifact into preview and export; a missing right or permission blocks public use of the affected material |
| Craft: creator export | “Download this reviewed edition with its sources.” | Draft → reviewed → export requested → exported only after file creation succeeds | Open the exported file and inspect its content, attribution and revision; failure retains the reviewed draft and offers retry |
| Agency: cancellation | “Stop new work. Keep the results already saved.” | Running → stop requested → stopped only after worker acknowledgement | Stop scheduling new actions as soon as the request is recorded. Let already-started actions settle and report their outcomes before acknowledging the stopped state; show committed actions and anything that cannot be recalled; retain actual saved outputs |
| Care: onboarding | “Choose one useful result. You can change the brief before work begins.” | Unconfigured → scoped draft → owner confirms → ready | User can revise scope, decline optional data and understand applicable limits before execution |
| Repair: correction | “Corrected. Review what changed and which editions are affected.” | Accepted → correction opened → revised → affected outputs reviewed | Preserve original and replacement revisions; identify affected outputs; do not imply distributed copies were recalled without evidence |
| Continuity: handover | “Here is the work, the decisions, and what still needs an owner.” | In progress → handover prepared → successor acknowledges → transferred | Successor can locate artifacts, reproduce relevant checks and identify dependencies; acknowledgement is recorded separately from preparation |

Use the specimen that belongs to the surface and its actual capabilities. Do not add controls solely to illustrate the principle, fabricate successful states, or impose operator language on Starlight's Horizon and Cultural modes.

## Adoption and evidence

1. Read the existing brand, design, copy and source-authority files at a recorded kernel commit. Use `surface.brand_id`; unknown brands fail rather than inheriting a convenient voice.
2. Select one real surface or artifact in its owning repository. Record the recipient, job, existing source, chosen specimen and exact changed paths. Preserve current editorial workflows and active agents' scopes.
3. Implement the smallest complete result. Keep source claims next to their evidence. For fiction, retain proposal status until the canon owner accepts it.
4. Run the owning repository's relevant checks and an independent editorial review. Rendered UI additionally requires actual desktop/mobile, accessibility and interaction evidence under the existing release gates. A document change does not supply those proofs.
5. If changing a downstream design pin, recalculate the raw-blob hashes required by `schemas/design-contract.schema.json`, validate adoption, and record the application revision. Do not mark other consumers migrated.
6. Update the owning issue with artifact paths, commit, checks actually run, independent findings and remaining dependencies. Keep release approval and deployment receipts separate from PR readiness.

**Drafted** means the proposal exists. **Integrated** means it is committed into the relevant canonical pack or owning implementation. **Adopted** means a particular consumer uses the recorded revision and has passed its applicable checks. **Released** requires the owning release process and actual deployment evidence. A PR can be ready for review while integration and adoption remain pending.

## Editorial review

Apply the existing [editorial articulation gate](../evals/editorial-articulation-gate.md). The reviewer must be able to name the reader, observation and useful next move. Swap the brand name: if the copy still makes the same promise, rewrite it around the brand's actual work. Check that credit is specific, features are evidenced, private details stay private, and a correction or handover can be acted on.

The five specimens are working standards, not finished homepage claims. Their independent review and actual application evidence belong in the PR and owning issues, not in a manufactured release certificate.
