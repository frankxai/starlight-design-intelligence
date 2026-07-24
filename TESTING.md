# starlight-design-intelligence — Testing

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
### Commands

- health: `git status --short`
- lint: `npm run validate`
- typecheck: not applicable
- test: `npm test`
- media acceptance: `npm run validate:media -- /path/to/media-job.json --asset-root "$STARLIGHT_ASSET_ROOT"`
- web production receipt: `npm run validate:release -- /path/to/release.json --repo-root /path/to/owning-repo`
- build: not applicable
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

Tests must cover failure paths, idempotency where state changes, adapter compatibility, and rollback-sensitive behavior. Skipped checks require a reason and may not be reported as passed.
<!-- STARLIGHT-REPO-CONTRACT:END -->
