# Brand Image Runtime

This folder is the machine-readable companion to the human brand and design standards.

Agents should use this order:

1. Load the estate and repo-local instructions.
2. Load the brand pack from `runtime/brands/<brand-id>/`.
3. Load the workflow pack from `runtime/workflows/<workflow-id>/`.
4. Resolve product truth, release state, product form, canonical identity assets, and exact copy.
5. Create a `media-job.json` that validates against `schemas/media-job.schema.json`.
6. Probe and record the actual model/tool receipt before any generated source work.
7. Render logos, public copy, diagrams, UI, claims, and crops deterministically.
8. Produce artifacts into `C:\Users\frank\brands\image-system`.
9. Inspect exports, update the experiment ledger, and validate evidence before claiming completion.

The runtime is intentionally separate from generated assets. It defines contracts, templates, routes, and QA gates. The local mirror stores heavy media outputs and prompt logs.

Product portfolio work uses:

- `workflows/product-cover/workflow.json`
- `workflows/product-launch-kit/workflow.json`
- `schemas/product-asset-portfolio.schema.json`
- `schemas/experiment-ledger.schema.json`

Generated imagery is a source layer, never a substitute for product truth or canonical identity.
