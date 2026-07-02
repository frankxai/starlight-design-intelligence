# Multi-Brand Image System

This is the Git-backed source of truth for cross-brand image, infographic, social, website, hero, motion-source, and campaign visual work across Frank's brand estate.

The local production mirror is:

- `C:\Users\frank\brands\image-system`

Use the local mirror for generated assets, prompt logs, screenshots, tracker exports, and batch loops. Use this repo folder for strategy, governance, channel standards, tool routing, and agent alignment.

## Start Here

Before any agent creates visual media for an owned brand, it must read:

1. `C:\Users\frank\starlight\repos\AGENTS.md`
2. `C:\Users\frank\starlight\repos\design-agent-standards\PREMIUM_ASSET_STANDARD.md`
3. `C:\Users\frank\starlight\repos\design-agent-standards\AGENTIC_DESIGN_LOOP.md`
4. `C:\Users\frank\starlight\repos\design-agent-standards\OUTCOMES.md`
5. `C:\Users\frank\starlight\repos\starlight-design-intelligence\DESIGN_AGENT_OPERATING_SYSTEM.md`
6. This folder:
   - `source-map.md`
   - `brand-operating-units.json`
   - `social-channel-matrix.csv`
   - `agent-governance.md`
   - `tool-benchmark-plan.md`
   - `monthly-strategy.md`
7. The relevant brand pack or repo-local brand files listed in `source-map.md`.

## Operating Rule

Do not generate "a nice image" in isolation. Classify the job first:

- Brand operating unit.
- Surface and channel.
- Audience.
- Asset tier.
- Source method.
- Prompt lineage.
- Crop requirements.
- Approval route.
- QA score.

If the job needs exact text, diagrams, UI, charts, code snippets, or claims, generate the background or source frame separately and compose the exact information with code, Figma, Canva, browser capture, Remotion, or another deterministic renderer.

## Brand Coverage

The current canonical operating units come from `agentic-ops-hub/docs/MULTI_BRAND_AGENT_OPERATING_SYSTEM_2026-06-19.md`, not from the initial seven-folder image draft. The system covers:

- FrankX Demand
- Arcanea Product and IP
- Starlight Substrate
- AI-Architect / AI CoE
- Agentic Income Network
- Reality Architect
- Creator Systems / ACOS
- Research and Mind Intelligence
- Tooling / OSS Distribution
- Anime Legends / Media IP

Incubator lanes are tracked separately until Frank promotes or merges them:

- Music Intelligence
- Health Intelligence
- Dream / Life / Library Intelligence
- Investor Intelligence
- Chat / exporter / starter forks

## Tool Routing

Use `tool-benchmark-plan.md` for the current router and benchmark protocol.

Default routing before benchmark results are complete:

- Exact text, charts, claims, UI, code overlays: code, browser capture, Remotion, Figma, or Canva.
- Premium still frames, posters, brand worlds, social source images: Codex `image_gen` or another inspected image-generation lane.
- Motion source frames and image-to-video tests: Grok CLI Imagine, with Codex owning brief, paths, QA, and provenance.
- Batch production and multi-agent reflection: Hermes only after its media backend is configured and a test output path is verified.
- Product proof: live app capture, Vercel preview, browser screenshot, or real artifact capture.

## Minimum Deliverable For Generated Visual Work

Every important generated asset needs:

- Prompt or capture route.
- Source tool and model where knowable.
- Brand source used.
- Surface and crop target.
- Export path.
- Inspection note.
- 30 point score from `OUTCOMES.md`.
- Decision: approved, iterate, or restart.

Approved means 26/30 or higher after inspecting the actual export.

## What This Fixed

The initial `C:\Users\frank\brands\image-system` setup was useful but incomplete. It missed the broader brand operating unit model, channel governance, repo-backed source maps, and a repeatable benchmark for image tools. This folder closes that gap and gives future agents a single Git-backed reference.
