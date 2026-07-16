# Creative OS Council Brief — 2026-07-16

## Mission
Review Starlight multi-brand brand-image / Creative OS approach. Shape strategy + action plan. Enable Queen to distribute tasks and make E2E work in the right GitHubs with systems connected.

## Current architecture (facts)
- **Canonical GitHub:** `frankxai/starlight-design-intelligence` branch `codex/main-preserve-20260630`
- **Split runtime (PROBLEM):**
  - `brand-image-system/runtime/` → schemas, adapters/hermes, social-static + website-header workflows
  - **repo-root** `runtime/` → brand packs (frankx, sis, arcanea, gencreator, ai-coe, vibeclubs, reality-architect), dam docs, asset-registry, renderers/social-card, more workflows, websites/ASSET_STRUCTURES, sync script
- **Local mirror:** `C:\Users\frank\brands\image-system` (jobs, approved, review, runtime copy)
- **Human brand packs:** `brand-packs/{frankx,sis,arcanea,vibeclubs}`
- **Ideal stack already decided (Queen + prior session):**
  - Git runtime SSOT + local jobs mirror
  - Deterministic render (HTML/Satori/Playwright) + premium gen hybrid (Grok/Infogenius OK for creative infographics/text)
  - Immich browse DAM later; Vercel Blob for sites; registry `usedIn` for always-up-to-date
  - Hermes Queen conductor; no mega SaaS DAM first

## Taste law
World-class only: Apple liquid glass depth, Vercel craft, GitHub approachability, meaningful/insightful. 30-pt gate. No ad-hoc overlays as final.

## Image-gen policy
Premium models **can** do strong text/infographics — hybrid allowed. Deterministic for exact UI/claims/charts when precision is required.

## What council must produce
1. **Verdict:** keep / adjust / kill pieces of the approach (max 8 bullets).
2. **Risks ranked** (split runtime, branch not main, no E2E job, no DAM, no Blob sync).
3. **Action plan** (P0 this session → P1 week → P2 month) with **one owner lane**:
   - Yogabook Queen (frontend/UX/runtime/renderer)
   - C940 Queen (GitOps/merge/CI if needed)
   - Codex / Claude Code (implementation slices)
4. **E2E definition of done** for FrankX social-static (files + paths + score + registry + optional site path).
5. **Repo map:** which GitHub owns what (design-intelligence vs frankx website vs agentic-ops vs brands mirror).

## Non-goals this wave
Install Immich today. Rewrite all brands. Publish social without approval. New DAM product greenfield.

## Output format
Markdown only. Sections: Verdict | Risks | Action Plan | E2E DoD | Repo Map | First 5 Commands.
