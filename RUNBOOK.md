# starlight-design-intelligence — Runbook

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
### Fast gates

- health: `git status --short`
- lint: `npm run validate`
- typecheck: not applicable
- test: `npm test`
- build: not applicable
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

### Release

Classify risk, run the canonical skill, validate the release-evidence manifest, use one coherent preview, obtain an independent verifier verdict, record evidence, and confirm rollback before promotion. Only predesignated low-risk web changes may use green automatic promotion.
<!-- STARLIGHT-REPO-CONTRACT:END -->
