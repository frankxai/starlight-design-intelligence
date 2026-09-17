# Hermes Integration with Brand Image System

**Rule**: All visual production work must go through the brand-image-system runtime.

## When Working on Visual Assets
1. Load the brand pack from `runtime/brands/<brand>/`
2. Load the workflow pack from `runtime/workflows/<workflow>/`
3. Create or validate a `media-job.json` against the schema
4. Classify the product form before choosing a visual route
5. Probe the current image capability and record the actual model receipt before generation
6. Use only allowed production routes (HTML/Satori renderer preferred)
7. Never use a generated image for final public text, logos, claims, charts, or product UI
8. Never type an approximation when a canonical logo asset exists
9. Keep generated media as an optional source layer; render the final composition deterministically
10. Write all outputs to the local mirror: `C:\Users\frank\brands\image-system\`
11. Record prompt version, route, model receipt, outputs, crop inspections, QA score, and decision in the media-job

## Execution Context
- Stay in the canonical project and default Hermes environment unless the operator explicitly selects another supported context.
- Load the brand-image-system runtime and the relevant brand/workflow packs.
- Do not claim a named profile, backend, or model merely because it appears in old instructions.

## Blocked Actions
- Direct generative overlays with exact text
- Bypassing canonical logo assets
- One generic cover template for multiple product forms
- Retrying a failed image route without switching or recording the failure
- Bypassing the renderer for Tier A assets

This fragment should be included in any Hermes AGENTS.md or profile instructions related to visual work.
