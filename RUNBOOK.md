# starlight-design-intelligence — Runbook

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `music-media-release-team` · Priority: `tier-0`
### Fast gates

- health: `git status --short`
- lint: not applicable
- typecheck: not applicable
- test: not applicable
- build: not applicable
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

### Release

Classify risk, run applicable gates locally, use one coherent preview when deployed, obtain an independent verifier verdict, record evidence, and confirm rollback before promotion. Only predesignated low-risk web changes may use green automatic promotion.
<!-- STARLIGHT-REPO-CONTRACT:END -->
