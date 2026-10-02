# Estate interface excellence rollout

Founder direction: 3 October 2026. Status: adoption plan. The existing release kernel is implemented here; enforcement in each product and harness requires separate evidence. This document does not approve a site redesign or a production release.

## Outcome

Every interface should help a person complete a valuable job with clear language, recognizable identity, responsive controls and reliable recovery. Upgrade complete journeys: discover the value, try real work, edit, save, resume and deliver the result. A handsome entrance followed by an unusable workspace fails acceptance.

Keep the accepted products, unfinished implementations and brand decisions. Review existing branches before replacement. Shared quality requirements can span brands; composition, imagery, type and voice should retain each brand's character.

## Reuse the current kernel

The canonical sources are:

- [Product outcomes](../evals/product-outcome-release-standard.md), which separates availability, function, usefulness, distinction and sustainability.
- [Web release gate](../evals/web-release-gate.md) and [evidence schema](../schemas/web-release-evidence.schema.json).
- [Portfolio coverage](../portfolio/core-surfaces.json), canonical brand packs and downstream `.starlight/design-contract.json`.
- [Adoption validator](../scripts/validate-adoption.mjs), [release validator](../scripts/validate-release-evidence.mjs) and the pinned reusable [design workflow](../.github/workflows/design-contract.yml).

The adoption validator checks ownership, pinned kernel/workflow revisions, declared surfaces, local contracts and brand-pack digests. The release validator checks content-addressed evidence and Git/deployment relationships. These checks establish their own scope. Independent inspection establishes design judgment; user acceptance establishes usefulness. Downstream adoption and required branch rules remain unverified until inspected.

Root `runtime/` is a moved path. The active brand runtime is `brand-image-system/runtime/`. Do not create another design runtime or substitute a source scanner's CSS score for release evidence.

## A human design brief

Before substantial redesign, record the intended person, their situation, recurring job, current alternative, output, primary action and signature proof. Capture the actual existing desktop and mobile experience. Use real copy and representative content in the comparison.

For a flagship, compare exactly three genuinely different directions under the existing kernel: composition, type, media and interaction must differ meaningfully. Select a direction with the appropriate owner before implementation. For a bounded defect repair, preserve the selected direction and test the affected behavior.

Study serious references on the same task. Useful reference categories include Linear for dense operational workflows, Stripe for technical explanations and integration trust, Apple for hierarchy and interaction restraint, and a strong specialist editor for the product's artifact. Record observed behavior, not assumed implementation. Direct imitation does not establish an identity.

Assess:

| Area | Evidence of considered work |
| --- | --- |
| Narrative | The first screen identifies the offer and demonstrates a specific result; claims have nearby evidence; labels describe user actions |
| Composition | Clear priority, deliberate rhythm, useful density, responsive hierarchy and a representative artifact |
| Typography | Roles, readable measure, real loading/fallback behavior, licensed sources and computed-font proof |
| Interaction | Immediate frequent actions, visible focus, meaningful touch targets, deliberate state transitions and interruption handling |
| Media | Useful subject, actual export inspection, license/consent, provenance sidecar and required ledger entries |
| Reliability | Saved work survives reload, interruption and retry; external actions are idempotent where relevant |

Sentence case is required in interfaces. Avoid defaulting every brand to the same dark dashboard, glow, gradient, glass or card grid. Do not invent metrics, testimonials, scarcity or live capability claims.

## State and interface coverage

Every changed workflow covers relevant default, empty, loading, partial, error, success, disabled, quota, offline and resumed states. Long operations show real progress or a truthful pending state. Cancellation preserves useful work. Authentication expiry returns the person to a recoverable task. Keyboard and touch workflows must be usable independently of hover.

| Interface | Acceptance beyond the shared engineering checks |
| --- | --- |
| Public site | Meaningful primary CTA, mobile narrative, domain/deployment identity, proof and honest offer state |
| Product workspace | Representative artifact, editing, persistence, undo where needed, export and failed-operation recovery |
| Command center | Timestamped sources, unknown/degraded states, useful next action and safe navigation to the owning system |
| Desktop/tray/browser panel | Clear invocation, keyboard access, stable focus, connection/reconnect feedback and no duplicate authority |
| CLI/TUI | Discoverable help, stable machine-readable output, useful exit codes, cancellation and resumable work |
| MCP/API | Versioned schema, scoped auth, denial, bounded output, timeout, retry, idempotency and receipt reconciliation |
| Agent/cloud job | Exact base, exclusive files, artifact/check receipts, budget, cancellation and safe patch reconciliation |

Web and agent entry points should call the same product services and enforce the same authority checks. ChatGPT cloud integration must be tested separately from local app/CLI configuration.

## Engineering and performance

Keep existing secret and security checks. Use current official API documentation. Prefer maintained dependencies that fit the product, deployment and license. An adoption decision compares the current implementation with a serious alternative on user value, latency, resource use, maintenance, cost and rollback. An experimental dependency remains isolated until measured.

For interactive changes, verify keyboard/focus, touch, reduced motion and interrupted transitions in the actual rendered experience. Frequent actions should not wait for decorative animation. Use explicit transition properties, reserve layout space and keep the user's task visible during loading.

The field target is LCP at most 2.5 seconds, INP at most 200 milliseconds and CLS at most 0.1 at the 75th percentile, assessed separately for mobile and desktop. [Core Web Vitals guidance](https://web.dev/articles/vitals). When traffic is insufficient, report field evidence as pending and use repeatable lab measurements plus a product-specific regression budget. A lab score cannot establish field success. Set API latency budgets from the named operation and baseline; do not impose one arbitrary latency target on all products.

The flagship kernel already requires editorial 18/20, typography 15/16, visual 28/30, and shipped motion 16/18 or an explicit cut. Generated assets have their own gate. A broken primary journey, unsupported claim, lost artifact or failed authorization blocks release regardless of scores.

## Enforce at the actual boundaries

1. Inspect the owning repo's current CI, deployment paths, rulesets and open PRs.
2. Adopt the existing kernel at an immutable commit. Reconcile the portfolio/brand record before enabling its check; do not invent brand authority to make validation pass.
3. Make the relevant engineering, journey and design aggregate report on every PR. Reject failed, missing, cancelled and improperly skipped dependencies. Inspect merge-queue behavior where used.
4. Verify that required checks actually block a controlled failing change. A workflow file or policy pointer alone is insufficient.
5. Inspect manual deployment and alternate promotion paths. Prepare boundary controls without silently changing access policy.
6. Bind preview evidence to the reviewed head and resolved deployment. Before promotion, require applicable checks and independent review. After deployment, record the serving alias, SHA, primary journey and compatible rollback in a later receipt.
7. Verify each harness in a fresh task: correct instructions loaded, correct tools exposed, failing operation denied and a useful allowed operation completed. Track selected, read, applied and verified separately.

A 403 or inaccessible setting is `unknown`. Missing independent review remains pending. No score or local configuration change proves universal agent enforcement.

## Bounded improvement loops

Each job has one integrator and a specific artifact, base revision, file ownership, acceptance, resource ceiling and stop condition. Give independent reviewers an immutable artifact and focused evidence; use an actual separate provider when consequential review requires it.

Run: reproduce the gap, propose the smallest complete repair, implement, verify, inspect the user's outcome, review and reconcile. After an initial attempt and one funded revision, hold the job if a material problem persists; change the hypothesis or escalate the concrete dependency before another admitted job. Track rework across jobs so repeated restarts cannot evade the total budget. No infinite self-improvement loops or unattended fanout.

Stop on a failed admission gate, uncertain write authority, exhausted budget, unresolved security issue, source mismatch, or user rejection. Preserve the artifact, evidence, open question and next action. Tests do not overturn the user's rejection.

## Adoption sequence and acceptance

Start with one internal operator journey and one public reference product. Prove a useful result and enforce a controlled failure before expanding. Admit at most three active objectives under the existing ledger; the rest remain queued.

For each repo, keep a bounded issue with its primary journey, current revision, missing checks, exact source paths, comparison, preview and rollback. A property with uncertain Git/domain ownership first gets a reconciliation task. Do not deploy through guessed mappings.

Program acceptance is coverage of the actual estate, fewer failed journeys and lost-work events, accepted product output against alternatives, reduced repair effort and measured performance. Record the denominator and observation window. Document completion does not close site implementation or runtime adoption.
