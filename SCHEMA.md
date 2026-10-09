# starlight-design-intelligence — Schema

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
### Contract index

- Repository profile: `starlight.repo_profile.v2`
- Team profile: `starlight.team_profile.v2`
- Product events: `starlight.product_event.v1` when this repo emits funnel events
- Entitlements: `starlight.entitlement.v1` when this repo grants product access
- Operation receipts: `starlight.operation_receipt.v1` for delivery, verification, and releases
- Run receipts: `starlight.run_receipt.v1` for bounded agent work
- Web release evidence: `starlight.web_release_evidence.v1` for high-value public
  surfaces, defined in `schemas/web-release-evidence.schema.json` and enforced by
  `scripts/validate-release-evidence.mjs`
- Media jobs: `brand-image-system/runtime/schemas/media-job.schema.json`, combined
  with the selected workflow's numerical ship bar and filesystem evidence by
  `scripts/validate-media-job.mjs`
- Downstream design adoption: `starlight.design_contract.v1`, defined in
  `schemas/design-contract.schema.json` and enforced by
  `scripts/validate-adoption.mjs`
- Portfolio design authority: `starlight.design_portfolio.v1`, stored in
  `portfolio/core-surfaces.json`
- Portfolio toolchain boundary: `starlight.design_toolchain.v1`, stored in
  `portfolio/design-toolchain.json`; it contains roles, readiness, and rules but
  no private tool identifiers, credentials, or asset binaries.
- Screen impact planning: `starlight.screen_atlas.v1` inventories source-known
  screen templates at an immutable product commit; `starlight.design_impact.v1`
  records nominated captures and blockers, not execution or release approval.
  Both are checked by `scripts/design-impact.mjs`; see
  `playbooks/design-atlas-reconciliation.md` for incomplete-dependency boundaries.
- Portfolio experience standard and bounded upgrade queue: `starlight.experience_standard.v1`,
  stored in `portfolio/experience-standard.json`, defined in
  `schemas/experience-standard.schema.json` and checked by `scripts/validate-experience.mjs`.
  It cross-references existing authorities and records proposed jobs and dated observations,
  never adoption, identity approval or a production pass.
- Read-only brand handoff: `starlight.brand_handoff.v1`, emitted by
  `scripts/export-brand-handoff.mjs` from committed Git blobs with revision and raw-byte hashes.
  This is an export format, not a new brand authority or release validator.
  The bundle includes `playbooks/figma-template-pipeline.md` and the existing
  App Factory source pointers. Template implementation manifests and asset
  validators remain owned by their implementation package/repository.
- Content and asset relationships: `starlight.content_asset_atlas.v1`, defined in
  `schemas/content-asset-atlas.schema.json` and checked by
  `scripts/content-asset-atlas.mjs`; operational records remain private.
  Historical release screen definitions and version payloads are immutable.
- Design research target: `starlight.design_research_target.v1`.
- Design snapshot manifest: `starlight.design_snapshot_manifest.v1`.
- Normalized extraction: `starlight.design_extraction.v1`.
- Abstract pattern card: `starlight.design_pattern.v1`.
- Domain design profile: `starlight.domain_design_profile.v1`.

The five observatory schemas live in `schemas/design-*.schema.json`. Stable IDs
are `target_id`, `snapshot_id`, `pattern_id`, `brand_id`, `domain_id`, and
`surface_id`. Snapshot artifacts are content-addressed and raw evidence is
never stored in Git.

### Runtime data stores

- `git`

Product-owned schemas and migrations remain in this repository. Cross-estate contracts are adapters, not a shared database. PII is prohibited in product analytics events.

The design contract pins a full lowercase kernel commit SHA and the SHA-256 of
the selected brand pack's raw Git blob at that commit. It contains no shared
colors, typography, motion tokens, components, or layout recipes. Those remain
brand-local. The portfolio registry has no mutable adoption status: a
repository either passes its pinned workflow or it does not.
<!-- STARLIGHT-REPO-CONTRACT:END -->
