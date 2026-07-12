# Brand Image System (Runtime Foundations)

**Canonical machine-readable + human strategy for all brands, formats, websites, social, and assets.**

## Current State (2026-07-12)
- Runtime contracts live here: `runtime/`
  - `schemas/` — brand-pack, workflow-pack, media-job, provider, model-router, model-bakeoff, and agent-adapter contracts
  - `providers/` — governed generation adapters, beginning with Higgsfield
  - `workflows/` — social-static, website-header, and Higgsfield model-bakeoff contracts
  - `tools/` — dry-run-first bounded runners
- Repo-level `../runtime/brands/` currently owns the machine-readable FrankX, SIS, Arcanea, GenCreator, AI CoE, Reality Architect, and VibeClubs packs. This historical split is documented rather than hidden.
- Brand packs in `../brand-packs/` remain human sources.
- Local working mirror: `C:\Users\frank\brands\image-system`
- Higgsfield production workspace: `C:\Users\frank\starlight\higgsfield`
- Governance: agent-governance.md, brand-operating-units.json, source-map.md
- Routing cheat sheet: `visual-template-routing-2026-07-04.md`
- Higgsfield visual intelligence strategy: `strategy/HIGGSFIELD_VISUAL_INTELLIGENCE_SYSTEM.md`

## Key Foundations Now Live
- **Taste Standard**: World-class design team only. Apple liquid glass (translucency, depth, blur), Vercel clean functional beauty, GitHub approachable + insightful (Mona-like likeability), meaningful content. Ultra tasteful, no slop.
- **Image Generation Policy**: Premium image models such as Grok Image, Nano Banana 2, and GPT Image 2 (`gpt_image_2`, not the legacy GPT-2 language model) can create strong artistic and editorial bases. Deterministic renderers (HTML/Satori/Playwright/Figma) remain mandatory for exact text, UI, charts, claims, and citations. Hybrid production is encouraged when it improves the inspected result.
- **Asset Flow**: Brand pack → Workflow → Media job (with evidence + 30-pt score) → Review → DAM + Registry → Sync to sites (Vercel public/assets or Blob) + usage tracking.
- **Generation Economics**: Higgsfield web Unlimited is human exploration only; CLI/MCP work is treated as metered and requires live cost and balance preflight.
- **Always Up to Date**: Central `asset-registry.json` + per-asset `usedIn` array. Update on publish. Sync scripts keep websites and social libraries current.

## Next Execution Priorities
1. Complete three clean manual Higgsfield bake-off cycles before proposing a schedule.
2. Consolidate the duplicate runtime roots through an explicit migration decision.
3. Populate remaining brand packs and resolve VibeClubs publishing-unit status.
4. Build deterministic overlay and crop renderers for approved source frames.
5. Implement registry/DAM sync only after provenance and rights gates are proven.

All new assets must meet the elevated taste bar before entering the DAM.

See `multi-agent-brand-template-operating-system.md` for full strategy.
See `runtime/dam/ASSET_MANAGEMENT_SYSTEM.md` for connected asset ops.
