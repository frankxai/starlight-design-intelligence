# Image Generation Tool Benchmark Plan

This is not yet a completed verdict. It is the protocol agents must use before claiming one image-generation lane is best.

## Current Router

Reverified on 2026-08-17:

- `grok` resolves to `C:\Users\frank\.grok\bin\grok.exe`.
- `grok models` currently reports that the standalone CLI is not authenticated. Do not route jobs there until a new receipt proves otherwise.
- `hermes` resolves to `C:\Users\frank\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe`.
- Historical Hermes session `20260817_112400_8870aa` used `grok-4.6` for reasoning and `grok-imagine-image-quality` for xAI image output. Those are separate receipts.
- Hermes successfully reached xAI through its OAuth route during that session, but the visual tool first failed five `image_generate` calls and then used an internal provider import. Run one bounded smoke test before any new Hermes media job.
- Current official model families worth benchmarking are OpenAI GPT Image 1.5, xAI Grok Imagine Image 2.0, Google Nano Banana Pro (`gemini-3-pro-image`), and Nano Banana 2 (`gemini-3.1-flash-image`). Availability must still be proven in the executing harness.

| Lane | Use for | Do not use for | Current status |
| --- | --- | --- | --- |
| Codex `image_gen` | Premium source stills, reference-aware edits, campaign art, and product-artifact source frames. | Exact public text, tiny UI, factual charts, logos as final identity. | Available in this session. Record `runtime-best-available` unless the tool returns a named model receipt. |
| xAI Grok Imagine Image 2.0 | 2K source frames and controlled aspect-ratio variants after an authenticated capability probe. | Exact diagrams, public copy, or an assumed continuation of the older quality-model route. | Official current API route; standalone CLI is presently unauthenticated. |
| Google Nano Banana Pro / 2 | Complex multi-reference brand-consistency experiments (Pro) and scalable 4K variant work (2). | Unproven claims that the current harness can call the model. | Preferred benchmark challenger when a verified Google lane is available. |
| Hermes media lane | Orchestration and logged loops after a successful source-output receipt. | Treating Grok 4.6 reasoning as the image generator; undocumented internal-provider fallbacks. | Conditional. Historical xAI OAuth output exists; new jobs require a fresh smoke test. |
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

- 28-30: ship candidate, pending human approval.
- 22-27: targeted iteration.
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
