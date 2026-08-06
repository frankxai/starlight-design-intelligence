# Agent brand and design stack benchmark — 2026-08-06

## Decision

Starlight Design Intelligence remains the **owned authority** for brand systems and production gates. External skills are specialist accelerators, not canonical brand owners.

| Specialist | Adopted role | Boundary |
| --- | --- | --- |
| Brand Building Skills | Portable strategy sequence covering context, audience, positioning, architecture, naming, voice, identity brief, launch, and measurement | Instruction framework only; research, trademark/domain/legal clearance, and senior approval remain external gates |
| UI UX Pro Max | Searchable UI/UX pattern, color, type-pairing, and stack intelligence | Recommendations do not override the selected brand pack or source evidence |
| Impeccable | Primary cross-harness frontend shaping, critique, polish, and deterministic anti-pattern detection | Per-project hooks require explicit review/trust; it does not own identity, rights, or release approval |
| Anthropic `frontend-design` | Concise subject-grounded generation and three-direction baseline | Reference only; Anthropic's `brand-guidelines` is Anthropic-specific |
| Taste Skill | High-variance marketing/portfolio anti-slop reference | Not a default for product dashboards; local brand truth wins |
| Emil Kowalski skills | Interaction, easing, interruption, motion-frequency, and microinteraction craft | Specialist polish layer |
| ibelick `create-design-md` | Evidence discipline for extracting DESIGN.md from code or a rendered site | Does not infer intent or implement changes |
| Google `design.md` | Validated agent-readable YAML-token and Markdown contract | Alpha; pin schema and validator and do not make it the sole source of truth |
| DTCG + Style Dictionary | Standard token source and deterministic cross-platform transforms | Transform validity does not prove semantic quality, contrast, or component adoption |
| Penpot integrated MCP | Editable vector/component canvas and human handoff | Requires a trusted active plugin/tab; audit code-mode operations and retain editable source masters |
| Storybook | Isolated component states, documentation, and review | Does not replace route-level responsive or end-to-end UX testing |
| Vercel Web Interface Guidelines | Terse interface audit | Audit only |
| Playwright + axe + Lighthouse/LHCI | Cross-browser, accessibility, and performance evidence | Stabilize fonts/data/browser versions and tie receipts to exact commit and URL |
| Dembrandt | Extraction and design-drift comparison against owned rendered properties | Use only on owned/authorized properties; evaluate in a bounded project before gating release |
| ComfyUI | Reproducible controlled image exploration and editing | Core/model/node/output licenses differ; never treat generated raster marks as logo masters |
| SVGO + sharp | Deterministic vector cleanup and responsive raster derivatives | Retain editable masters and inspect geometry, transparency, and color profiles after processing |

## Machine state observed

This is a point-in-time machine observation from 2026-08-06, not a durable
capability guarantee. Re-run the install/authentication checks before routing a
production job.

- UI UX Pro Max was present across Claude Code, Codex, OpenCode, and Gemini; CLI version `2.11.0`.
- Impeccable was installed globally across detected harnesses on 2026-08-06; skill payload reports `4.0.4`.
- Hermes `0.18.2`, Claude Code `2.1.215`, Codex CLI `0.144.5`, OpenCode `1.14.48`, and Gemini CLI `0.51.0` were installed at the deeper audit cutoff.
- `21st` CLI `1.12.0` was installed but account-backed discovery/generation was not authenticated.
- Claude had the richest connected design surface, including Figma/Canva/media MCP entries; equivalent authenticated production access was not proven estate-wide.
- Codex had strong implementation and rendered-QA plugins, while cached Figma/Canva/Remotion/Cloudinary material was explicitly not installed.
- Gemini loaded shared skills but had no extensions; only Starlight MCPs were connected.
- OpenCode was degraded: `opencode mcp list` hit a NUL JSON parse failure, 281 duplicate skill names existed across 694 discovery paths, and local plugin dependency links were broken.
- Hermes Grok image/video generation and deterministic browser/file tooling were available; ComfyUI was not operational.

## Gaps closed by this change

- Added a strategy-to-identity workflow.
- Added a vector-first logo-system workflow.
- Added a font-rights source gate instead of relying on font-name substitution.
- Added a source-led visual-research workflow for web references and moodboards.
- Kept promotion human-gated and evidence-backed.

## Remaining integration work

- Put the live `.agent-harness` doctrine and brand/media registry under committed provenance with a release/version manifest.
- Repair OpenCode's NUL JSON failure, broken package links, and overlapping discovery roots before trusting it for design production.
- Reconcile or intentionally pin `estate-design-excellence` and `brand-media-ops` drift in `arcanea-agent`, `gemini-35`, `music-producer`, and `publishing-house`.
- Pin and reconcile duplicated cross-client skill payloads from one source/version/hash/adapter manifest; remove the shared design skill's hardcoded Claude path.
- Authenticate and run a bounded 21st.dev component-source test before classifying it approved.
- Authenticate and verify the official Figma design-context/Variables/Code Connect workflow before treating it as active.
- Add project-local Storybook, Playwright, axe/LHCI, and optional Dembrandt receipts rather than relying on doctrine alone.
- Add deterministic logo-export, font-metadata, SVGO, and responsive-raster scripts after the first brand uses the workflows.
- Keep legal trademark and proprietary font-EULA interpretations with qualified humans.

## Public companion

The detailed public comparison and adoption matrix lives in [`frankxai/awesome-design-agent-skills`](https://github.com/frankxai/awesome-design-agent-skills) under `rankings/end-to-end-brand-design-stack.md`.
