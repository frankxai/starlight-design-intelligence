# starlight-design-intelligence — Testing

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `music-media-release-team` · Priority: `tier-0`
### Commands

- health: `git status --short`
- lint: not applicable
- typecheck: not applicable
- test: not applicable
- build: not applicable
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

Tests must cover failure paths, idempotency where state changes, adapter compatibility, and rollback-sensitive behavior. Skipped checks require a reason and may not be reported as passed.
<!-- STARLIGHT-REPO-CONTRACT:END -->
