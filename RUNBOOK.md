# starlight-design-intelligence — Runbook

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
### Fast gates

- health: `git status --short`
- lint: `npm run validate`
- portfolio contract: `npm run validate:portfolio`
- typecheck: not applicable
- test: `npm test`
- build: not applicable
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

### Release

Classify risk, run the canonical skill, validate the release-evidence manifest, use one coherent preview, obtain an independent verifier verdict, record evidence, and confirm rollback before promotion. Only predesignated low-risk web changes may use green automatic promotion.

### Downstream adoption

1. Merge and independently verify the canonical kernel change.
2. Record its full commit SHA; never use a branch, tag, or short SHA.
3. Hash the target brand pack as a raw Git blob at that commit.
4. Add `.starlight/design-contract.json` and a small caller workflow using
   `frankxai/starlight-design-intelligence/.github/workflows/design-contract.yml@<full-sha>`.
5. Keep the caller on an unfiltered `pull_request` trigger and require the
   resulting check in branch protection.
6. Produce the first post-deploy release-evidence receipt before propagating
   the contract to another repository.
<!-- STARLIGHT-REPO-CONTRACT:END -->
