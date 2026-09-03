# Brand Image System (Runtime Foundations)

**Canonical machine-readable + human strategy for all brands, formats, websites, social, and assets.**

## Current State (2026-07-02)
- Runtime contracts live here: `runtime/`
  - `schemas/` — brand-pack, workflow-pack, media-job, agent-adapter (validated)
  - `brands/` — frankx (full with liquid glass + Vercel/GitHub taste), sis, arcanea, gencreator, ai-coe + tokens
  - `workflows/` — social-static, website-header, infographic (hybrid premium creative + deterministic)
  - `renderers/` — social-card (HTML liquid glass example)
  - `dam/` — ASSET_MANAGEMENT_SYSTEM.md (Immich/ResourceSpace + Vercel Blob + usage tracking)
- Brand packs in `../brand-packs/` remain human sources.
- Local working mirror: `C:\Users\frank\brands\image-system`
- Governance: agent-governance.md, brand-operating-units.json, source-map.md
- Liked reference library: `liked-references/` (catalog SSOT; working inbox under `C:\Users\frank\brands\image-system\liked-references`)
- Routing cheat sheet: `visual-template-routing-2026-07-04.md`

## Key Foundations Now Live
- **Taste Standard**: World-class design team only. Apple liquid glass (translucency, depth, blur), Vercel clean functional beauty, GitHub approachable + insightful (Mona-like likeability), meaningful content. Ultra tasteful, no slop.
- **Image Generation Policy**: Premium models (Grok, Infogenius/NB2/GPT-2-image, etc.) **excel** at creative infographics and text. Use for artistic/insightful bases. Deterministic renderers (HTML/Satori/Playwright/Figma) for exact text, UI, charts, claims. Hybrid allowed and encouraged where it produces better results.
- **Asset Flow**: Brand pack → Workflow → Media job (with evidence + 30-pt score) → Review → DAM + Registry → Sync to sites (Vercel public/assets or Blob) + usage tracking.
- **Always Up to Date**: Central `asset-registry.json` + per-asset `usedIn` array. Update on publish. Sync scripts keep websites and social libraries current.

## Next Execution Priorities
1. Populate remaining brands in runtime.
2. Build more renderers (Playwright/Satori templates for all formats).
3. Implement sync scripts + Immich/ResourceSpace ingest.
4. Seed high-quality assets for FrankX using new standards (fix previous overlay issues).
5. Per-website foundations (asset folders, manifests).
6. GitHub sync and Vercel Blob integration examples.

All new assets must meet the elevated taste bar before entering the DAM.

See `multi-agent-brand-template-operating-system.md` for full strategy.
See `runtime/dam/ASSET_MANAGEMENT_SYSTEM.md` for connected asset ops.
