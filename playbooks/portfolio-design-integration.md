# Portfolio design integration

## Decision and authority

Integrate the complementary tooling from PRs #25, #41, #42 and #43 on current
main. This accepts a design-intelligence substrate, not a creative identity,
product release, native Figma library, managed designer or completed journey.
Current owning brand packs and product implementations retain authority.

| Layer | Contract | Owner and boundary |
| --- | --- | --- |
| Customer job | `starlight.experience_standard.v1` | Portfolio registry and domain profiles; proposed journeys and acceptance criteria |
| Source handoff | `starlight.brand_handoff.v1` | Committed kernel bytes and hashes; product repositories retain tokens and components |
| Native projection | source-pinned projection and external execution receipt | Exact product source/font preflight; additive Figma changes, no implicit publication |
| Changed screens | `starlight.screen_atlas.v1` / `starlight.design_impact.v1` | Immutable product revision and supplied complete Git diff; nominated captures only |
| Content and assets | `starlight.content_asset_atlas.v1` | Private operational registry; immutable versions and release-referenced screen definitions |
| Acceptance | Existing release/adoption contracts | Separate source, browser, native, human and production evidence |

## Connect the records without conflating them

The source-screen atlas inventories route templates at a product commit. The
content/asset atlas records concrete route, role, state and viewport instances.
They intentionally have different cardinality. Keep the template-to-instance
crosswalk in the private operational store, pinned to repository and source
commit; do not infer identity from a pathname or invent public Figma identifiers.
A change plan nominates templates. The crosswalk expands those templates into
actual states and content/asset dependencies. Missing mappings or stale source
revisions require inventory reconciliation before capture, not a green result.
This consolidation does not implement that private crosswalk or an unattended
execution service.

Content release pins identify exact content versions and their asset renditions.
A historical release's referenced screens cannot be repointed to another route,
state, viewport or Figma node. Append a new screen identity and release record
for new evidence. An unreferenced screen may complete its pending mapping.
Preserve the comparison baseline; validation without it cannot prove history.

`usage` includes historical placements; it is not live usage analytics. A native
projection receipt is not a browser capture. A source-known route is not a
functional customer flow. Existing generated import packages and Template
Studio deliveries remain separate artifacts; no files in this merge prove their
native execution or editing quality.

## Bounded adoption

Start with one actual product journey. Reconcile its current source inventory,
fixtures and immutable deployment; export the owning brand source bundle; prove
one desktop and phone task and its recovery; inspect the Figma destination and
execute only the scoped import or update; retain native/readback and visual
proof in private storage. Then append content/asset usage and independent
acceptance evidence. Existing product CI and release owners perform promotion.
Keep quota, missing fixtures, capture budgets and unavailable native evidence
explicit. Do not launch a generic DAM, LMS or continuous service from schemas.

## Verification and rollback

Run kernel, experience, observatory, committed-index, portfolio, Node and native
hook checks plus the existing rendered-interface CI. Independent verification
must cover the combined tree, including conflict resolutions and history tests.
The owner's explicit instruction to review and merge authorizes this bounded
code consolidation. Rollback is a revert of the consolidation merge; no product
runtime, database, billing, permissions or production alias changes here.
