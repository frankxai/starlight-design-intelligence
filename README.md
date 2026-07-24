# Starlight Design Intelligence

Owned methodology, reusable skill system, premium taste layer.

This repo is the source of truth for how FrankX, Starlight Intelligence Systems, Arcanea, and related products should look, move, explain themselves, and earn release approval.

## Operating Thesis

AI can generate interfaces quickly. The scarce layer is judgment: hierarchy, restraint, interaction quality, motion, brand memory, visual proof, and the ability to make every product feel like it belongs to a coherent world.

Starlight Design Intelligence turns that judgment into reusable brand packs, skills, rubrics, examples, and motion systems.

## Repo Roles

| Area | Purpose |
| --- | --- |
| `brand-packs/` | Brand-specific design, copy, product, token, and motion doctrine. |
| `skills/` | Canonical executable design-intelligence skills. Personal/plugin installations are derived snapshots. |
| `evals/` | Rubrics and checklists for anti-slop review, premium brand scoring, and UI quality. |
| `examples/` | Before/after examples showing the quality delta this system should produce. |
| `scripts/` | Deterministic validators for the kernel and release evidence. |

## Brand Boundaries

| Brand | Visual Mode | Motion Mode | Copy Mode |
| --- | --- | --- | --- |
| FrankX | clear, founder-led, commercially sharp | direct, fast, useful | practical, strategic, no mythic language |
| Starlight / SIS | calm operational intelligence | precise, evidence-driven, command-center motion | trustworthy, systems-literate, enterprise-ready |
| Arcanea | mythic creative intelligence | cinematic, ritual, luminous transformation | poetic but concrete, never generic fantasy fog |
| Vibeclubs | embodied creator/social energy | warm, rhythmic, sensory | inviting, participatory, culture-forward |

## Relationship To Other Repos

- `awesome-design-agent-skills`: public design-agent curation.
- `awesome-motion-design-agent-skills`: public motion-agent curation.
- `motion-design-studio`: optional motion-production adapter; it is not a canonical dependency until a real, installable repository exists.
- `visual-intelligence`: tooling and GitHub Action layer for asset and visual QA.
- `starlight-agent-skills`: portable substrate skills for Starlight/SIS runtime consumption.

There is no separate `starlight-design-agent-skills` authority. Creating another canonical layer would increase drift. Installations must retain a source reference to this repository and pass `npm test` before release.

## Standards

- Replace vague taste language with implementation guidance.
- Include motion and reduced-motion rules for every high-value product surface.
- Prefer real product screenshots, workflows, and before/after examples over abstract decoration.
- Preserve brand separation. Arcanea can be mythic; Starlight must remain high-trust.
- Use public repos for authority and discovery; use this repo for owned differentiation.
- A public flagship release requires current desktop/mobile source capture, exactly three visual directions, independent editorial and visual verification, and production/rollback proof.
- Production proof is emitted after deployment as an external CI artifact or a
  later receipts commit; it is never embedded in the production commit whose SHA
  it records.
