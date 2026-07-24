# Brand Image Runtime

This folder is the machine-readable companion to the human brand and design standards.

Agents should use this order:

1. Load the repo-local instructions.
2. Resolve `surface.brand_id` through `runtime/brands/<brand-id>/`; stop when it is unknown.
3. Load the workflow pack from `runtime/workflows/<workflow-id>/`.
4. Create a `media-job.json` and run
   `npm run validate:media -- /path/to/media-job.json --asset-root "$STARLIGHT_ASSET_ROOT"`.
   Approval requires inspection, human approval metadata, existing non-empty
   output/evidence files, and the selected workflow's numerical ship bar.
5. Produce artifacts into the absolute directory named by `STARLIGHT_ASSET_ROOT`;
   stop when it is unset rather than guessing a machine path.
6. Validate evidence before claiming completion.

The runtime is intentionally separate from generated assets. It defines contracts,
templates, routes, and QA gates. The configured asset root stores heavy media
outputs and prompt logs.
