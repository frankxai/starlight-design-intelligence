# Top-Tier CLI · Image · Design · Swarm Playbook (Design pointer)

**Canonical full playbook (ops + CLI + swarms):**  
[`frankxai/agentic-ops-hub`](https://github.com/frankxai/agentic-ops-hub) →  
`docs/TOP-TIER-CLI-DESIGN-IMAGE-SWARM-PLAYBOOK-2026-08.md`

**Local ops path:** `C:\Users\frank\agentic-ops\docs\TOP-TIER-CLI-DESIGN-IMAGE-SWARM-PLAYBOOK-2026-08.md`

This file is the **design-intelligence entry** so design agents load the right defaults without forking a second doctrine.

---

## Design defaults (do not renegotiate mid-task)

| Concern | Default |
| --- | --- |
| Components | shadcn/ui patterns + Radix (one primitive family per app) |
| Icons | Lucide |
| Motion | Motion / framer-motion path + reduced-motion |
| Tokens / brand law | This repo’s `brand-packs/` + target `DESIGN.md` |
| AI images | Grok Imagine (Hermes `image_gen` / Grok Build `imagine` skill) |
| Exact UI / charts / long text | **Code**, not diffusion |
| Production gate | `evals/` + harness `GENERATION-A11Y-CHECKLIST` + font licensing |
| External skills | Accelerate a named stage only — never replace brand packs |

## Skills to load for visual product work

From this repo (`skills/`):

- `world-class-web-release`
- `anti-slop-frontend`
- `product-ui-polish`
- `landing-page-polish`
- `motion-and-interaction`
- `logo-system` / `brand-strategy-to-identity` / `brand-constitution`
- `typography-art-direction`
- `font-licensing-gate`
- `design-audit`

From Hermes (companion):

- `image-generation` / `hermes-image-generation` / `image-prompt-crafter`
- `brand-identity-strategy`, `logo-system`, `image-workflow-orchestrator`
- `twenty-first-component-bridge` (named missing component only)

From Grok Build:

- skill `imagine` (image_gen / image_edit craft)

## Related estate docs

- `~/.agent-harness/UI-STACK-RADAR.md`
- `~/.agent-harness/DESIGN-SOURCE-CATALOG.md`
- `~/.agent-harness/UI-COMPONENT-SOURCES.md`
- `brand-image-system/` in this repo

## Curation boundary

`awesome-design-agent-skills` remains **public curation**. Runtime authority stays here.

---

*Updated 2026-08-11 with the top-tier CLI/image/swarm research pass.*
