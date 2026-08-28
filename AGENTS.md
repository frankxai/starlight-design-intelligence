# Repository Instructions

This repo is the owned premium design-intelligence layer for FrankX, Starlight Intelligence Systems, Arcanea, and related products.

## Scope

- Own brand packs, motion language, visual identity, design-system rules, evals, and before/after examples.
- Feed installable skills/plugins, public curation repos, site redesigns, launch pages, product UI, and visual QA.
- Keep public curation in `awesome-design-agent-skills` and `awesome-motion-design-agent-skills`; keep day-to-day Codex invocation in plugins such as `motion-design-studio`.

## Quality Bar

- Write with taste and specificity. Avoid generic "premium, sleek, modern" unless it is translated into concrete behavior.
- Every brand rule should guide an implementer: color, type, space, motion, image, copy, interaction, and QA implications.
- Distinguish Starlight and Arcanea clearly:
  - Starlight: calm operational intelligence, trust, systems, evidence, command centers.
  - Arcanea: mythic creative intelligence, worlds, rituals, cinematic reveal, creator magic.
- Do not leak Arcanea mythic language into FrankX or enterprise Starlight surfaces unless explicitly requested.

## Safety

- Do not add private memory, credentials, client secrets, unreleased deal material, or protected IP that should not be published.
- Mark internal-only strategy if a file should not be mirrored into public repos.
- Use owned or clearly licensed assets only.

## Verification

- Run placeholder scans before handoff.
- Check that brand packs can be consumed by skills/plugins without extra interpretation.
- For frontend examples, verify mobile/desktop layout, reduced motion, contrast, and asset provenance.

## Design Taste Kernel

For any site, app, landing page, dashboard, visual identity, brand, motion, media, social, or frontend task, apply the shared Design Taste Kernel before handoff:

- `skills/world-class-web-release/SKILL.md`
- `brand-packs/<brand>/`
- `evals/web-release-gate.md`
- `evals/editorial-articulation-gate.md`
- `evals/typography-quality-gate.md`
- `evals/motion-purpose-gate.md`

When motion, scroll, generated media, GIF/video, or premium polish matters, use
`skills/motion-and-interaction/SKILL.md` and verify the exported result visually.
Optional plugins may accelerate production but are not canonical dependencies.

## Editorial operating system

For direct communication with Frank, load `skills/frank-workstyle/SKILL.md`.

For public or customer-facing copy:

1. Resolve the publishing brand through `editorial/brand-registry.json`.
2. Load `skills/frank-brand-editor/SKILL.md` and the selected `brand-packs/<brand>/COPY.md`.
3. Apply `editorial/shared-editorial-standard.md`.
4. Run the editorial audit on changed public copy.
5. Require review by someone other than the drafting agent before release.

Unknown brands require resolution. Public copy must not inherit FrankX by assumption.

## Generated Asset Gate

Before accepting generated images, logos, posters, video stills, social crops, motion loops, or hero art, apply:

- `DESIGN_AGENT_OPERATING_SYSTEM.md`
- `evals/generated-asset-quality-gate.md`

Do not accept first-pass generated visual media unless it passes the 26/30 gate after actual export inspection. Logos are vector-first; 3D logo renders are applications, not the identity. Motion must name the hierarchy, state, causality, progress, spatial relationship, or brand memory it improves.


<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `frankx-product-revenue-team` · Priority: `tier-0`
- Work only in assigned paths and preserve unrelated dirty files.
- Read `SYSTEM.md`, `SCHEMA.md`, and `SKILLS.md` before architectural changes.
- Use the smallest 3–5 role team and an independent verifier for release-affecting work.
- Required handoff: artifacts, checks, verifier verdict, risks, approvals, rollback, and next bounded action.
- Human-gated actions: DNS, secrets, billing, spend, migrations, destructive operations, permissions, legal/IP, brand identity, external sends, and high-risk production changes.
<!-- STARLIGHT-REPO-CONTRACT:END -->
