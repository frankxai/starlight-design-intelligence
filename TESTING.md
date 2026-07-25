# starlight-design-intelligence — Testing

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
### Commands

- health: `git status --short`
- lint: `npm run validate`
- portfolio contract: `npm run validate:portfolio`
- downstream adoption: `npm run validate:adoption -- --downstream-root <repo> --kernel-root <kernel> --caller-repository <owner/repo> --workflow-repository frankxai/starlight-design-intelligence --workflow-path .github/workflows/design-contract.yml --workflow-sha <full-sha>`
- typecheck: not applicable
- test: `npm test`
- media acceptance: `npm run validate:media -- /path/to/media-job.json --asset-root "$STARLIGHT_ASSET_ROOT"`
- web production receipt: `npm run validate:release -- /path/to/release.json --repo-root /path/to/owning-repo`
- build: not applicable
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

Tests must cover failure paths, idempotency where state changes, adapter compatibility, and rollback-sensitive behavior. Skipped checks require a reason and may not be reported as passed.

Adoption tests must reject vacuous registries, normalized duplicates, identity
mismatches, mutable workflow refs, conditional or filtered caller jobs,
incorrect raw-blob digests, surface subsets/supersets, untracked files, path
escapes, and every symlink.
<!-- STARLIGHT-REPO-CONTRACT:END -->
