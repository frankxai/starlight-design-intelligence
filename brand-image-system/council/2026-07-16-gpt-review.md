# Starlight Creative OS — GPT Strategy Review

Date: 2026-07-16  
Scope: `frankxai/starlight-design-intelligence` on `codex/main-preserve-20260630`  
Decision constraint: consolidate the runtime before adding DAM infrastructure; hybrid image generation is allowed; Immich is deferred.

## Verdict

- **Keep the architecture, but stop calling it operational until one runtime produces one approved FrankX asset end to end.** Git-owned contracts + a local jobs/approved mirror + deterministic rendering + optional generated source frames is the right low-complexity shape.
- **Make `brand-image-system/runtime/` the only Creative OS runtime.** It already owns the schemas and Hermes adapter contract. Move the root runtime's brands, renderer, registry, DAM guidance, site guidance, scripts, and unique workflows into it; retain root `runtime/` only until parity checks pass, then remove it.
- **Reconcile, do not choose blindly between, the two `social-static` definitions.** Keep the schema-valid nested structure, add the root definition's OG and 9:16 outputs and hybrid route language, and set one explicit FrankX threshold: `score30 >= 28`, with actual-export inspection and human approval mandatory.
- **Keep hybrid generation as a route, not a renderer dependency.** Generated imagery may provide a source frame or a deliberately creative infographic; exact claims, charts, UI, and final public text remain deterministic unless the media job explicitly selects and verifies the premium creative-infographic route.
- **Replace the HTML demo with a parameterized, offline-capable render command.** The current file hard-codes copy, imports remote Google fonts, has no capture script, and lacks `box-sizing`, so its declared 1080 px card is not a deterministic 1080 px export.
- **Keep the registry, but convert it from an example into a validated publication ledger.** Entries need real paths or URLs, content hashes, provenance, approval identity/time, score, and structured `usedIn`; literal placeholders such as `"..."` must fail validation.
- **Keep the local `C:\Users\frank\brands\image-system` mirror as execution state, never as a second source of truth.** It receives a versioned runtime snapshot and holds jobs/review/approved binaries; it must not independently edit brand or workflow contracts.
- **Do not install Immich or build a DAM product in this wave.** First prove create → render → inspect → approve → register → optionally consume on site. Add Immich later as a browse/index surface over approved assets, not as workflow authority.

## Risks ranked

| Rank | Risk | Evidence and impact | Required control |
|---:|---|---|---|
| 1 — Critical | Split runtime creates two authorities | `brand-image-system/runtime/` has 4 schemas, Hermes adapter files, and two workflows; root `runtime/` has 7 brand packs, renderer, registry, sync stub, site/DAM docs, and three workflows. An agent cannot know which tree wins. | Consolidate into `brand-image-system/runtime/`; add CI that fails if repo-root `runtime/` reappears. |
| 2 — Critical | `social-static` contracts disagree | Nested workflow is schema-shaped and requires square + 4:5 plus a recorded 30-point score; root workflow uses incompatible property names, adds OG + 9:16, and requires 28. The root file cannot validate against the existing workflow schema. | Publish one merged, schema-valid workflow and one threshold/crop policy. Validate every workflow in CI. |
| 3 — Critical | No executable E2E render path | `runtime/renderers/social-card/index.html` is a hard-coded 1080 square demo, uses a network font import, has no data input, no capture CLI, no multi-crop output, and no test. Padding also expands the element beyond 1080 without `box-sizing: border-box`. | Implement a job-driven Playwright renderer with vendored/licensed fonts, exact viewport/export assertions, and a FrankX golden job. |
| 4 — High | Registry can claim publication without evidence | `runtime/asset-registry.json` contains an example record and a literal `"..."`; it lacks a schema, hashes, provenance, approval actor, and status transitions. `usedIn` therefore cannot prove that an approved binary is actually live. | Add a registry schema and append/update command; require hash, approval, score, and validated consumer coordinates. |
| 5 — High | Branch is not integrated with `main` | Work is canonical on `codex/main-preserve-20260630`, increasing the chance that other agents consume stale `main` or create another fork. | After P0 passes, C940 opens a bounded consolidation PR, identifies divergence, and makes the merged default branch/runtime location explicit. No blind force merge. |
| 6 — High | Approval and evidence are prose gates | The media-job schema records score and decision but not approval actor/time, source rights, claims evidence, crop inspection results, or renderer/runtime version. Human approval is required yet not auditable. | Extend the job/evidence schemas and block registry promotion unless all required evidence is present. |
| 7 — Medium | Blob/site sync is a non-functional stub | `sync-approved-to-registry.sh` only prints intended steps and references a nonexistent example command. There is no idempotency, checksum verification, dry-run, rollback record, or consumer receipt. | Implement local copy first; add Vercel Blob only behind dry-run + receipt + `usedIn` update. Keep publishing human-gated. |
| 8 — Medium | Local mirror drift can silently change outcomes | The local mirror contains a runtime copy but no demonstrated one-way sync/version pin. A Yogabook/C940 run could use different contracts from Git. | Stamp each job with commit SHA/runtime version; sync Git → mirror one way and fail on dirty contract drift. Immich does not solve this. |

## Action Plan

Each row has exactly one accountable owner. Support may be requested, but accountability does not move.

### P0 — this session: establish one runnable contract

| Owner | Action | Exit evidence |
|---|---|---|
| **Codex** | Consolidate unique root-runtime content into `brand-image-system/runtime/`; merge the two `social-static` definitions; update all `$schema` and relative path references; leave no ambiguous duplicate. | A repo-wide path scan resolves all Creative OS runtime references to the nested runtime; JSON schemas validate every brand/workflow/job fixture; a guarded removal diff exists for root `runtime/`. |
| **Claude** | Turn `renderers/social-card/` into a parameterized Playwright render slice that reads a validated media job and exact copy, uses local fonts, and emits 1080×1080, 1080×1350, 1200×628, and 1080×1920 PNGs plus a manifest. | One command renders all four crops offline; PNG dimensions and non-empty hashes are asserted; invalid jobs fail non-zero. |
| **Yogabook** | Run the first FrankX social-static acceptance job through the consolidated runtime and visually inspect the four actual exports at 100% and contact-sheet scale. Record defects rather than editing final text onto pixels ad hoc. | `brief.md`, validated `media-job.json`, four crops, contact sheet, `evidence.json`, scorecard, and an explicit `approved` or `iterate` decision exist under one job ID. |
| **C940** | Audit branch divergence and prepare the consolidation PR/merge route without changing default branch or force-updating history. Add the minimum CI gate for schemas, duplicate runtime detection, renderer smoke test, and placeholder scan. | PR shows base/head, changed ownership boundaries, green gates, rollback commit, and reviewer assignment. |

### P1 — this week: make promotion and consumption trustworthy

| Owner | Action | Exit evidence |
|---|---|---|
| **Codex** | Add schemas and CLI validation for `asset-registry.json` and `evidence.json`; extend media-job approval/provenance fields; implement an atomic `approve/register` command. | Promotion rejects missing hashes, rights/source, claim evidence, inspection, approval actor/time, or score below 28. Registry update is deterministic and tested. |
| **Claude** | Implement idempotent approved-asset sync with `--dry-run`, local-public-path mode first, optional Blob adapter second, checksum verification, receipt creation, and rollback instructions. | Re-running the same approved job makes no duplicate; changed bytes require a new asset/version; a failed consumer write does not mark `usedIn`. |
| **Yogabook** | Define and run three FrankX acceptance variants—text-only deterministic, generated-base hybrid, and proof/browser-capture—using the same workflow contract. | All routes produce identical evidence structure and crops; at least one reaches approval; route-specific visual defects and timing are recorded. |
| **C940** | Merge the P0 PR after review, document the authoritative branch/path, and protect runtime changes with required CI checks. | Consumers can clone the declared branch and run the golden job from the README without local contract edits. |

### P2 — this month: scale only after repeatability

| Owner | Action | Exit evidence |
|---|---|---|
| **Yogabook** | Productize the Queen intake/approval UX around the same media-job states; expose queue, review crops, score, evidence, and approval without creating a second database of truth. | Ten mixed-brand jobs complete with no orphaned files or ambiguous status; Frank remains the public-publish gate. |
| **Codex** | Compile human brand packs into validated runtime packs for the next two brands only after FrankX passes; add contract-version migrations and compatibility tests. | FrankX plus two brands render from the same CLI without brand-specific code forks. |
| **Claude** | Add contact sheets, visual regression tolerances, accessibility/contrast checks, and consumer receipt reconciliation. | A changed template produces reviewable before/after artifacts; stale or missing `usedIn` receipts are reported. |
| **C940** | Evaluate Immich as a read/browse index over approved assets and receipts—not as SSOT—and document backup, access, and recovery. | Time-boxed recommendation with import mapping and rollback; no installation or migration occurs without separate approval. |

## E2E DoD FrankX social-static

The first slice is done only when all conditions below pass for one real, non-published FrankX asset.

1. **Canonical contract:** Only `brand-image-system/runtime/` is referenced. The job resolves `brands/frankx/brand-pack.json`, `schemas/media-job.schema.json`, and `workflows/social-static/workflow.json` from the same runtime version/commit.
2. **Job packet:** The local execution root is `C:\Users\frank\brands\image-system\jobs\2026-07-16\2026-07-16-frankx-social-static-e2e\`. It contains `brief.md`, `media-job.json`, `source/`, `crops/`, `contact-sheet.png`, `evidence.json`, and `render-manifest.json`. Git owns schemas/templates; the mirror owns working binaries.
3. **Inputs:** `media-job.json` records job/brand/workflow IDs, surface, audience, exact copy, asset tier, selected route, source paths, claim risk/evidence, asset rights/provenance, runtime commit, renderer version, and intended outputs. It validates before rendering.
4. **Routes:** Either deterministic-only or hybrid is acceptable. For hybrid, generated media remains in `source/`; exact public text, UI, charts, and claims are rendered deterministically unless the job explicitly selects the premium creative-infographic exception and its text is inspected character by character.
5. **Exports:** These files exist and decode at exact dimensions: `crops/square.png` (1080×1080), `crops/portrait.png` (1080×1350), `crops/og.png` (1200×628), and `crops/story.png` (1080×1920). Each has a SHA-256 hash in `render-manifest.json`; rerendering unchanged inputs reproduces the same bytes or documents the nondeterministic source boundary.
6. **Visual QA:** Yogabook inspects every export, not just HTML. The contact sheet shows all crops. Exact text, safe areas, contrast, hierarchy, FrankX brand fit, no fake UI, no uncited claims, no Arcanea language, no clipping, and no filler pass. Reduced motion is not applicable to static output; asset provenance is.
7. **Score and decision:** The 30-point rubric is recorded in `evidence.json`; approval requires **at least 28/30**, no critical defect, and no failed mandatory criterion. `media-job.json.decision` becomes `approved` only with human approver and timestamp. Public posting remains out of scope.
8. **Approved promotion:** Approved bytes are copied without mutation to `C:\Users\frank\brands\image-system\approved\frankx\2026-07-16-frankx-social-static-e2e\`. The registry entry records asset ID/version, job ID, workflow, hashes, score, provenance, approval, file coordinates, and an initially empty `usedIn` array.
9. **Optional site path:** If explicitly approved for website use, the exact approved bytes go to `frankx.ai-vercel-website/public/assets/frankx/social/2026-07-16-frankx-social-static-e2e/` or Vercel Blob. Only after checksum verification and a preview URL exists may the registry append a structured `usedIn` receipt. No production promotion is implied by this DoD.
10. **Automated proof:** A clean checkout can validate schemas, render the golden job, assert dimensions/hashes, scan placeholders, and validate the registry with one documented command. CI fails on a second runtime tree, `"..."` placeholders, missing outputs, or approval below threshold.

## Repo Map

| Repository / location | Owns | Must not own |
|---|---|---|
| **`frankxai/starlight-design-intelligence`** → `brand-image-system/runtime/` | Creative OS Git SSOT: schemas, compiled brand packs, workflows, adapters, deterministic renderers, QA/evidence contracts, registry manifest, sync interfaces, golden fixtures, and operating docs. | Campaign working binaries, unpublished source dumps, live-site code, Slack state, secrets. |
| **`frankxai/frankx.ai-vercel-website`** | FrankX site code and only approved consumer assets under `public/assets/...`, or references to approved Blob objects; preview/production verification. | Brand/workflow authority, raw generations, approval decisions, master registry. |
| **`frankxai/agentic-ops-hub`** | Queen dispatch, campaign/ops ledger, approval packet pointers, social-channel routing, and publication receipts. | Renderer/runtime forks, duplicate brand packs, authoritative asset binaries, credentials in packets. |
| **Local mirror `C:\Users\frank\brands\image-system`** | Ephemeral execution state: Git-pinned runtime copy, `jobs/`, `review/`, `approved/`, caches, and actual media binaries. One-way contract sync from Git. | Independent schema/brand edits, publication truth, secrets, or an unversioned runtime fork. It is not a GitHub owner. |

Data flows one way through authority boundaries: **design-intelligence contract → local job/render → human approval → approved registry entry → optional website asset/Blob → `usedIn` receipt**. `agentic-ops-hub` coordinates this flow but does not become an asset or runtime authority.

## First 5 Commands

Run from this repository only. These commands start consolidation; they do not install Immich, publish, touch other repos, or handle secrets.

```powershell
# 1. Verify the four Git facts and preserve awareness of unrelated work.
git rev-parse --show-toplevel; git remote get-url origin; git branch --show-current; git status --short

# 2. Compare the conflicting workflow contracts before moving anything.
git diff --no-index -- brand-image-system/runtime/workflows/social-static/workflow.json runtime/workflows/social-static/workflow.json

# 3. Create a bounded implementation branch from the currently reviewed commit.
git switch -c chore/creative-os-runtime-consolidation

# 4. Move only root-runtime paths that have no nested-name collision.
git mv runtime/brands runtime/dam runtime/renderers runtime/scripts runtime/websites runtime/asset-registry.json runtime/WORKFLOWS.md brand-image-system/runtime/

# 5. Move unique workflows, then prove the only remaining root duplicate is the file requiring an intentional merge.
git mv runtime/workflows/infographic runtime/workflows/website-hero brand-image-system/runtime/workflows/; rg --files runtime brand-image-system/runtime
```

After command 5, merge the richer crop/route requirements into the schema-valid nested `social-static` file, validate it, and only then remove the remaining root `runtime/` tree in the implementation PR.
