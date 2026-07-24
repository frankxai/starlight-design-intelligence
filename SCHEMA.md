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

### Runtime data stores

- `git`

Product-owned schemas and migrations remain in this repository. Cross-estate contracts are adapters, not a shared database. PII is prohibited in product analytics events.
<!-- STARLIGHT-REPO-CONTRACT:END -->
