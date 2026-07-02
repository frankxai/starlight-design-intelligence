# Image Generation Tool Benchmark Plan

This is not yet a completed verdict. It is the protocol agents must use before claiming one image-generation lane is best.

## Current Router

Verified on 2026-07-02:

- `grok` resolves to `C:\Users\frank\.grok\bin\grok.exe`.
- `grok models` reports the session is logged in, with `grok-build` as the default model and `grok-composer-2.5-fast` also available.
- `hermes` resolves to `C:\Users\frank\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe`.
- Media backend keys checked without printing values: `FAL_KEY`, `FAL_API_KEY`, `OPENAI_API_KEY`, and `REPLICATE_API_TOKEN` were not present in process/user/machine environment at check time.

| Lane | Use for | Do not use for | Current status |
| --- | --- | --- | --- |
| Codex `image_gen` | Fast premium stills, campaign source images, art-directed posters, website/social backgrounds. | Exact text, tiny UI, factual charts, logos as final identity. | Available in this session. |
| Grok CLI Imagine | Source frames and image-to-video tests where Grok can save local files and report paths. | Exact text, exact diagrams, unsupported text-to-video assumptions. | CLI is installed and logged in; use `grok models` before jobs. |
| Hermes media lane | Batch generation, multi-agent reflection, logged loops once configured. | Claims of completed image generation when backend keys or output paths are missing. | Blocked until media backend key and first test output are verified. |
| Code / browser / Remotion / Figma / Canva | Exact text, infographics, charts, overlays, UI proof, slides, captions, product screenshots. | Cinematic world imagery unless paired with generated or captured source media. | Preferred for public claims and information density. |
| Product capture | Real proof, website strategy images, dashboard proof, Vercel previews, app states. | Fictional product states or fake dashboards. | Preferred for trust surfaces. |

## Benchmark Set

Run the same prompt families across the viable lanes. Save all outputs under the local mirror:

`C:\Users\frank\brands\image-system\benchmarks\YYYY-MM-DD-tool-comparison\`

Use one short run per brand before scaling:

1. FrankX: executive command/social square.
2. Starlight: governance/observability website hero frame.
3. Arcanea: mythic creative studio poster.
4. GenCreator / Creator Systems: creator stack infographic source frame.
5. AnimeLegends: lore/dojo channel poster respecting repo-local IP rules.

For each generated still, also create one deterministic overlay variant when text or claims are needed.

## Scoring

Score every output with the 30 point gate from `OUTCOMES.md`:

- 5: first read and hierarchy.
- 5: brand fit and distinctiveness.
- 5: craft quality, typography, spacing, composition, lighting, and crop.
- 5: accessibility, contrast, responsiveness, and reduced-motion support if relevant.
- 5: accuracy, provenance, and lack of artifacts.
- 5: usefulness for the intended surface.

Decision:

- 26-30: approved.
- 22-25: one targeted iteration.
- 0-21: restart from brief and references.

## Results File

Record benchmark results in:

`C:\Users\frank\brands\image-system\benchmarks\tool-benchmark-results.csv`

Columns:

```csv
date,brand,operating_unit,surface,channel,tool,model_or_lane,prompt_path,output_path,overlay_path,dimensions,seconds_to_output,first_read,brand_fit,craft,accessibility,accuracy,usefulness,total_score,decision,notes
```

## Prompt Rules

- Front-load subject, brand, surface, and crop.
- Use brand-specific materials and metaphors from `brand-operating-units.json`.
- Keep image prompts natural and specific.
- Do not ask image tools to render exact text, labels, numbers, code, claims, or UI.
- Store prompt files beside outputs.
- Inspect actual exports before approving.

## Governance

No agent may replace this router with a private preference. If a lane performs better, add benchmark evidence and update this plan with the date, sample paths, and scores.
