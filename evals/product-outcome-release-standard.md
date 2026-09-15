# Product outcome release standard

Status: proposed operational standard for review. This extends the existing design release contract; it does not approve a brand identity, replace a product ADR, enable a paid service, or prove downstream adoption.

## Decision

A product release must prove an outcome that a customer can complete. A page count, passing build, installed SDK, agent profile, exported prompt, or provider logo proves only that specific intermediate artifact.

Use this standard alongside `evals/web-release-gate.md`. Product repositories own their workflows and domain models. This repository owns the evaluation method, not customer data or a second runtime.

## Five separate verdicts

| Verdict | Evidence required |
| --- | --- |
| Available | Intended domain resolves to the identified production deployment and commit |
| Functional | Named user journey completes with observable output and correct recovery |
| Useful | Intended users accept the output against their current alternative |
| Distinctive | Independent review finds a recognizable brand and an advantage in the task |
| Sustainable | Acquisition, repeat use, support effort and variable costs support the offer |

Never compress these into a single green badge. Unknown remains unknown. A documented prototype can be available without being a managed product.

## Product brief before implementation

Record one intended user, one costly recurring job, the existing alternative, the exact output, and the reason the user returns. Name what is already shipped, what is in a reviewed branch, and what requires external activation. Inspect open PRs before starting a replacement.

Every substantial implementation task names:
- one customer behavior and its failure cases;
- an accountable integrator and a separate verifier;
- exact repository, base revision and owned paths;
- current product decision and selected brand authority;
- task-specific tools, permissions, time and cost budget;
- observable acceptance evidence and rollback.

Use the existing task/run/operation receipt contracts where available. Do not add a new orchestration service solely to record these fields.

## Acceptance is non-compensable

Unsupported empirical claims, broken authorization, lost work, duplicate external actions, broken primary controls, or evidence from the wrong deployment fail the applicable release. Typography, motion and prose scores cannot compensate.

Test the complete relevant loop: enter or import; transform; edit; save; reload or resume; review; export or deliver; recover from interruption. Add cross-tenant denial, quota, retry and cancellation tests when that behavior exists. An export-only tool does not need a billing subsystem. A product claiming managed persistence does need persistence evidence.

Use fictional fixtures for deterministic checks, and real consented user pilots for usefulness. Keep pilot results and proposed targets separate. A ten-person pilot is a directional product decision, not a population-level performance claim.

## Continuous delivery binding

Reuse the owning repository's CI instead of adding a second deployment lane.

1. Every required aggregate check always reports and rejects failed, missing, cancelled and inapplicably skipped dependencies.
2. Require applicable engineering, design/editorial and journey checks at the actual merge boundary. Workflow files alone do not establish branch protection.
3. Resolve each preview through the deployment API. Require its Git SHA to equal the reviewed PR head before recording screenshots or browser results.
4. Bind evidence to commit, deployment, URL, scenario, viewport where applicable, timestamp and actual result.
5. Separate pre-promotion evidence from post-deployment receipts; never require a commit to contain its own SHA.
6. Verify production alias, deployment SHA and the primary journey after promotion. Confirm a compatible rollback target.
7. Inspect alternate manual release paths; they must meet the same applicable requirements.

A 403 while reading branch protection means configuration is unknown, not absent. A latest preview is not necessarily the deployment serving the production domain.

## Design should expose the work

The main interface presents the user's artifact, its useful controls and its current state. Use progressive disclosure for infrequent settings. An empty state should let a user try a representative example and reach a meaningful result.

Retain each brand's approved identity and protected surfaces. Follow the existing three-direction process for a flagship redesign; ordinary bug fixes do not reopen brand strategy. Review hierarchy, type, content density, focus, contrast, mobile composition, loading, error, empty, success and reduced-motion states. Evaluate actual rendered behavior.

Keep operational permission details at the action boundary where they affect a decision. The core value proposition should describe the benefit and show the work.

## Agent and memory discipline

Use a small team only where independent work improves the result: accountable product/engineering integrator, maker or domain specialist, and independent verifier. Route narrowly; more personas do not establish more intelligence.

- Load the entry contract, active decision, relevant code and focused evidence. Retrieve deeper context on demand.
- A leaf agent must obey the same current source hierarchy as the root contract.
- Quarantined research and inaccessible machine-local files are never calibration anchors.
- Evaluate an empirical claim before evaluating its style. Unsupported facts fail even when prose scores well.
- Keep user intent, proposed architecture, accepted decision, implementation, observed runtime result and lesson distinct.
- Give operational observations a source, timestamp and revision. Expire or supersede them explicitly.
- A blocked credential or migration gates that capability; it does not prevent all unrelated implementation or testing.
- Measure accepted outcomes, rework and escaped defects. Do not reward files, tokens or agent count.

Resolve contradictory documents in their owning repository. Preserve historical evidence while removing it from the active resume path. Use unique decision identifiers and explicit supersession.

## Integration and commercial boundary

Own the customer state and the specialized workflow that creates the advantage. Integrate mature editing, distribution and measurement tools behind versioned adapters. A provider link, a prepared draft, an authenticated API call, a remote write receipt and a verified result are different capability levels.

Web, API, MCP and skills should use the same product services and authority checks. An agent-facing interface is useful only when another host can actually discover, authenticate, execute and recover the intended operation.

Distinguish technical compatibility, an available integration, an affiliate enrollment and a negotiated partnership. Do not publish partnership or revenue claims from a logo or a plan.

Measure:

```text
accepted-output cost = (inference + tools + rendering + storage + retries + review/rework) / accepted outputs
contribution margin = collected revenue - attributable variable costs - support/fulfillment costs
activation = users completing the named useful outcome / eligible users starting it
repeat use = activated users repeating that outcome in the defined window / activated users
```

Denominators, windows, currencies and exclusions must be explicit. Never equate a payment request with collected revenue or page analytics with activation.

## Rollout

For each active product, open a bounded adoption change that reconciles current authority, identifies the primary journey, binds existing evidence to the release, and names the missing work. Keep adoption proposed until the actual downstream checks pass.

Start with one reference product and one repeatable customer job. Expand shared primitives only after their use in a second product demonstrates the boundary. Preserve the portfolio's breadth while concentrating engineering work in progress.

Owner actions such as account authorization or commercial terms should be presented as concrete prepared decisions. Do all authorized code, tests, documentation and preview preparation first. This standard does not add permission requests to reversible tasks.
