# Opus Strategy Review — Creative OS / Brand-Image System

Reviewer: Opus-class strategy · Date: 2026-07-16
Repo: `frankxai/starlight-design-intelligence` @ `codex/main-preserve-20260630`
Scope reviewed: council brief, `multi-agent-brand-template-operating-system.md`, both `runtime/` trees, the two competing `social-static` workflows, `asset-registry.json`, `sync-approved-to-registry.sh`.

---

## Verdict

- **KEEP the architecture thesis.** "Shared brand template runtime → job schema → deterministic renderer → QA gate → approval" is correct and worth defending. The five-layer contract and the folder-routing law are the right spine. Do not re-litigate this.
- **KEEP the hybrid image policy** (premium gen for creative bases, deterministic for exact text/claims/UI). It matches reality and the taste law. The overlay failure was a routing bug, not a policy bug.
- **KILL the split runtime immediately.** There are two live `runtime/` trees with **two contradictory `social-static/workflow.json` files** — one demands a 28-pt hybrid gate, the other a 30-pt "exact text rendered deterministically" gate with different outputs and different blocked routes. This is not "in progress," it is a forked source of truth. An agent loading the wrong one ships to the wrong standard. This is the single most dangerous thing in the repo.
- **ADJUST the canonical location to match the doc.** The spec explicitly names `brand-image-system/runtime/` as canonical, yet the *richer* implementation (brand packs, renderers, asset-registry, DAM docs, sync script) lives in **repo-root** `runtime/`. Reality drifted from the spec. Pick one, physically move the other, leave a tombstone. Recommend consolidating **into `brand-image-system/runtime/`** to honor the written contract — but the root tree has more real content, so this is a move+merge, not a delete.
- **KILL "E2E is done" as a claim.** There is no runnable job. `sync-approved-to-registry.sh` is an `echo`-only skeleton. `asset-registry.json` contains one fabricated example (`og: "..."`, `example-20260702-001`). No renderer has produced a real crop with a real `evidence.json`. The loop is drawn, not built.
- **ADJUST the branch posture.** Canonical work sits on `codex/main-preserve-20260630`, not `main`. That is fine as a staging lane but it must have a *named merge boundary*; otherwise every agent forks reality further. Decide now: this branch becomes main via one gated PR, or main is the target and this branch is a feature lane that merges this week.
- **KEEP the "no Immich / no mega-DAM today" non-goal.** Correct scoping. The registry `usedIn` model is enough to be always-up-to-date. Blob sync is the only infra that matters this wave.
- **ADJUST governance to enforce one runtime.** Add a hook/CI check (already in the roadmap as "hook-doctor") that fails if a second `runtime/workflows/*/workflow.json` with the same `workflowId` exists anywhere in the estate. Drift must be a build failure, not a discovery.

---

## Risks (ranked, worst first)

1. **Forked runtime with contradictory QA gates (CRITICAL).** `runtime/workflows/social-static/workflow.json` (root, 28-pt, hybrid, outputs square/og/4:5/9:16) vs `brand-image-system/runtime/workflows/social-static/workflow.json` (30-pt, deterministic-exact-text, outputs square/portrait only). Same `workflowId`, different law. Whichever an agent loads silently changes the ship bar. Until this is resolved, **no output can be trusted to a standard**, because there is no single standard.
2. **No real E2E job exists (CRITICAL for the mission).** The brief's whole point is "make E2E work." Today: skeleton sync script (`echo` only), placeholder registry entry with `"og": "..."`, no renderer→Playwright→crop→evidence run ever completed. The Queen cannot "distribute tasks" against a loop that has never produced one real artifact.
3. **Canonical path contradicts the spec (HIGH).** Doc says `brand-image-system/runtime/` is canonical; the load-bearing content is in root `runtime/`. Every new agent reads the doc, goes to the wrong folder, finds stubs, and either duplicates or edits the dead tree. This *manufactures* risk #1 on repeat.
4. **Branch ≠ main, no merge boundary (HIGH).** `codex/main-preserve-20260630` is the SSOT but is not `main` and has no declared gate. Parallel harnesses will keep forking. CI cost discipline (draft-first, batch) is undermined when there's no target branch everyone agrees on.
5. **No Blob sync / no publish path (MEDIUM).** `sync-to-vercel.js` is referenced but does not exist. "Approved → live on frankx.ai" is a comment, not code. The registry's `usedIn` cannot be trusted because nothing writes it.
6. **DAM ambiguity (LOW this wave).** Immich is correctly deferred. Low risk *only if* nobody treats the local mirror `C:\Users\frank\brands\image-system` as authoritative — it is a working cache, not a source. Keep it that way.

---

## Action Plan

Owner lanes: **Yogabook Queen** = frontend/UX/runtime/renderer. **C940 Queen** = GitOps/merge/CI. **Codex/Claude Code** = implementation slices.

### P0 — this session (unblock everything)
- **[C940 Queen] De-fork the runtime.** Choose `brand-image-system/runtime/` as the single canonical tree (honors the written spec). `git mv` the root `runtime/` content (brands, renderers, asset-registry, dam, scripts, websites, workflows) into `brand-image-system/runtime/`, reconciling the two `social-static` (and any other dup) into ONE file. Delete the root tree; leave `runtime/README.md` as a one-line tombstone pointing to the canonical path. One commit, one PR.
- **[C940 Queen] Reconcile `social-static` to one law.** Keep the **30-pt deterministic-exact-text** gate as the ship bar (matches taste law + "no ad-hoc overlays as final") but merge the root file's **four output sizes** (square, og, 4:5, 9:16) and the **hybrid allowedRoutes** into it. One workflow.json, hybrid-allowed, 30-pt, four crops.
- **[Codex/Claude Code] Declare the merge boundary.** Write a one-line policy in `brand-image-system/README.md`: canonical branch is X, gate is one draft PR → `gh pr ready` fires suite → squash to main. Pick X now.

### P1 — this week (build the one real loop)
- **[Yogabook Queen] Ship ONE real FrankX social-static job end to end.** Real `media-job.json` → `renderers/social-card/index.html` → Playwright export of all four crops → real `crops/*.png` → real `evidence.json` with a real 30-pt score → `review.md`/`approval.md`. Replace the fabricated registry entry with this real one (`og` must be a real path, not `"..."`).
- **[Codex/Claude Code] Make `sync-approved-to-registry.sh` real.** Turn the `echo` skeleton into working code: copy approved crops → append a real asset object to `asset-registry.json` with real `usedIn` → optional Vercel Blob upload / copy to a site `public/` path. Idempotent, driven by `<jobId>`.
- **[C940 Queen] Add the drift guard.** CI/hook check that fails if two `workflow.json` share a `workflowId`, or if a second top-level `runtime/` reappears. Draft-gated per the estate CI discipline.

### P2 — this month (clone the pattern)
- **[Yogabook Queen] Clone the working loop to SIS, Arcanea, GenCreator** (compile packs already exist for these). One real job each, same DoD.
- **[Codex/Claude Code] Wire Vercel Blob for website-hero/header** and let the registry `usedIn` track live site placements.
- **[C940 Queen] Adapter generation** (`AGENTS/CLAUDE/GROK.fragment.md`) generated from the single runtime, so instruction drift can't restart the fork.
- Defer: Immich, portfolio 295-repo refresh, remaining brand packs (ai-coe/agentic-income/reality-architect/animelegends). Not this wave.

---

## E2E Definition of Done — FrankX social-static

A job is DONE only when **every** item is true and inspectable:

**Inputs**
- `jobs/2026/07/<jobId>/brief.md` — one brand, one workflow, one surface, one audience.
- `.../media-job.json` — validates against `runtime/schemas/media-job.schema.json`; names brand `frankx`, workflow `social-static`, chosen route (hybrid or full-deterministic).

**Production**
- Rendered via `runtime/renderers/social-card/index.html` (deterministic for all exact text/claims). Premium gen allowed for background/source frame ONLY — never for final public text.

**Outputs (real files, not placeholders)**
- `.../crops/square.png` 1080×1080
- `.../crops/og.png` 1200×628
- `.../crops/portrait.png` 1080×1350
- `.../crops/story.png` 1080×1920
- Each crop visually inspected; no clipped text, no fake UI, no broken glass.

**Evidence & score**
- `.../evidence.json` — validates against `qa-evidence.schema.json`; records route, prompt/source log, export paths, crop checks, and a **30-pt score ≥ 28** (ship bar). Below 22 → restart; 22–25 → one iterate + documented issue.

**Approval**
- `.../review.md` (critic notes) and `.../approval.md` (human decision: approve / approve-with-edits / revise / hold). No public publish without approve.

**Registry (the "always-up-to-date" proof)**
- On approval, `sync-approved-to-registry.sh <jobId>` appends a **real** object to `brand-image-system/runtime/asset-registry.json`: real `files.square`/`files.og` paths (no `"..."`), real `score`, real `approvedAt`.

**Optional site path**
- If placed on a site: crop copied to that repo's `public/assets/frankx/...` (or Vercel Blob), and `usedIn` records `{site, location, profile, date, context}` pointing at the exact placement.

**Done = ** all of: schema-valid job, 4 real crops, evidence with score ≥28, human approval, one new real registry entry. Anything less is a draft, not a DoD.

---

## Repo Map — who owns what

| GitHub / location | Owns | Does NOT own |
| --- | --- | --- |
| **`frankxai/starlight-design-intelligence`** (this repo) → `brand-image-system/runtime/` | **THE Creative OS SSOT.** Schemas, compiled brand packs, workflow packs, renderers, `asset-registry.json`, QA gates, sync script, adapter fragments. Single canonical runtime after de-fork. | Local generated media. Published site code. |
| `starlight-design-intelligence/brand-packs/{frankx,sis,arcanea,vibeclubs}` | Human-readable brand source docs (markdown). | Machine packs (those live in `runtime/brands/*`). |
| **`C:\Users\frank\brands\image-system`** (local, not Git) | Working jobs, generated media, prompts, crops, evidence, review/approval packets. A **cache**, never a source. | Canonical workflow/brand law. Registry SSOT. |
| **`frankxai/frankx.ai-vercel-website`** | Live site; receives ONLY approved assets under `public/assets/...` or via Vercel Blob. | Brand law, job schemas, generation. |
| **`agentic-ops-hub`** | Slack approval packets, ops ledger, social-team OS, dispatch. | The runtime/renderer itself. |
| **`starlight-agent-config` / generated adapters** | Agent runtime configs, hooks, skills — generated FROM this runtime. | Hand-maintained per-agent brand rules (drift source). |
| **`C:\Users\frank\.starlight`** | Private runtime state. | Anything in Git. |

Rule (from the spec, restate loudly): **never create a second image system in another repo.** After de-fork, one runtime, one registry, one gate.

---

## First 5 Commands

Run from repo root `C:\Users\frank\starlight\repos\starlight-design-intelligence`. Confirm you are on the canonical branch and de-fork before anything else.

```powershell
# 1. Confirm branch + that BOTH runtime trees still exist (the fork)
git branch --show-current; git status -s
Get-ChildItem runtime, brand-image-system\runtime -Directory | Select-Object FullName

# 2. Prove the contradiction: diff the two social-static laws side by side
git --no-pager diff --no-index runtime\workflows\social-static\workflow.json brand-image-system\runtime\workflows\social-static\workflow.json

# 3. De-fork: move root runtime content into the canonical brand-image-system/runtime (reconcile dups by hand after)
git mv runtime\brands runtime\renderers runtime\dam runtime\websites runtime\scripts runtime\asset-registry.json runtime\WORKFLOWS.md brand-image-system\runtime\

# 4. Reconcile the one contradictory workflow, then leave a tombstone where root runtime was
#    (edit brand-image-system/runtime/workflows/social-static/workflow.json to: 30-pt gate + 4 crops + hybrid routes)
Set-Content runtime\README.md "# MOVED`nCanonical runtime is now brand-image-system/runtime/. Do not add files here."

# 5. Stage only this scope and open a DRAFT PR (CI-cost discipline: draft first, ready when complete)
git add brand-image-system\runtime runtime\README.md; git commit -m "refactor(brand-image): de-fork runtime into single canonical tree [skip ci]"
gh pr create --draft --title "De-fork Creative OS runtime → single SSOT" --body "Consolidates split runtime; reconciles contradictory social-static gate. Owner: C940 Queen."
```

> After command 3, manually reconcile any remaining same-`workflowId` duplicates (at least `social-static`; check `website-hero`/`website-header` too) into ONE file each. The de-fork is not done until `git ls-files '**/workflow.json'` shows no two files sharing a `workflowId`.
