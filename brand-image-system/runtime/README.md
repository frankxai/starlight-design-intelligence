# Brand Image Runtime

This folder is the machine-readable companion to the human brand and design standards.

Agents should use this order:

1. Load the estate and repo-local instructions.
2. Load the brand pack from `runtime/brands/<brand-id>/`.
3. Load the workflow pack from `runtime/workflows/<workflow-id>/`.
4. Create a `media-job.json` that validates against `schemas/media-job.schema.json`.
5. Produce artifacts into `C:\Users\frank\brands\image-system`.
6. Validate evidence before claiming completion.

The runtime is intentionally separate from generated assets. It defines contracts, templates, routes, and QA gates. The local mirror stores heavy media outputs and prompt logs.
