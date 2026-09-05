# starlight-design-intelligence — Testing

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
### Commands

- health: `git status --short`
- lint: `npm run validate`
- portfolio contract: `npm run validate:portfolio`
- observatory integrity: `npm run validate:observatory`
- exact capture coverage: `npm run validate:observatory -- --strict-coverage`
- observatory retrieval index: `npm run index:observatory`
- committed retrieval index check (read-only): `npm run check:observatory-index`
- observatory freshness: `npm run check:freshness`
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

The Design kernel workflow runs on every pull request, including observatory and
example-only changes. It checks observatory integrity and the committed retrieval
index before running tests. Tests generate indexes only in disposable fixtures;
they must never repair a stale tracked artifact and then report the tree as valid.

Observatory failure tests cover foreign and undeclared extraction evidence,
duplicate extraction ownership, malformed contract shapes, content-hash mismatch,
and source-ledger identity, provenance, rights, and artifact-hash mismatches.
These checks establish consistency of committed records. They do not prove the
private artifacts exist or promote pending viewport captures to verified evidence.
<!-- STARLIGHT-REPO-CONTRACT:END -->
