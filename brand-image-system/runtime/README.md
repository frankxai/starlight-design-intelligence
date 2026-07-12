# Brand Image Runtime

This folder is the machine-readable companion to the human brand and design standards.

## Source Boundaries

- Provider, workflow, job, loop, and QA contracts live here.
- Current machine-readable brand packs remain in the repo-level `../../runtime/brands/` folder until the historical split is deliberately consolidated.
- Human brand sources remain in `../../brand-packs/`.
- Legacy heavy assets remain in `C:\Users\frank\brands\image-system`.
- Governed Higgsfield jobs, receipts, and generated media live in `C:\Users\frank\starlight\higgsfield`.

Do not create a fourth location or silently move existing assets.

## Agent Order

1. Load estate and repo-local instructions.
2. Load the relevant repo-level brand pack and this runtime's `model-router.v1.json`.
3. Load the surface workflow and provider contract.
4. Create a job that validates against the relevant schema.
5. Run dry-run/live cost preflight before any generation.
6. Produce local artifacts and portable VIS provenance sidecars.
7. Inspect actual exports, record rights state, and apply the 30-point gate.
8. Stop downstream work at `approval_pending` until a named human decision.

## Higgsfield Sub-loop

- Strategy: `../strategy/HIGGSFIELD_VISUAL_INTELLIGENCE_SYSTEM.md`
- Provider: `providers/higgsfield.provider.json`
- Portfolio router: `model-router.v1.json`
- Job schema: `schemas/model-bakeoff.schema.json`
- Workflow and maker/checker contract: `workflows/higgsfield-model-bakeoff/`
- Runner: `tools/higgsfield-bakeoff.mjs`
- Example: `examples/frankx-higgsfield-bakeoff.json`

The runner defaults to a live, non-generating cost preflight. `--execute` is explicit and still cannot publish or schedule.
