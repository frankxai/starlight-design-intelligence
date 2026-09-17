# Infogenius social infographic template

Version: `infogenius-social.v1`

This package turns a verified semantic model plus an optional generated source illustration into an exact social infographic. It is the reusable publication layer for Infogenius jobs; it does not replace the claim ledger, semantic review, or visual prompt packet.

## What this template guarantees

- A 4:5 master at 1440 × 1800, accepted by LinkedIn, Instagram Feed, and current X image placements.
- Sentence-case typography and a three-second first read.
- Exact public copy, connectors, citations, and brand assets rendered outside generated pixels.
- Separate provider, protocol, runtime, and governance lenses so incomparable concepts are not flattened into one vendor rail.
- Short alt text, a long-description path, source identifiers, checked date, and no-endorsement note.
- A fallback to exact plain text whenever an official mark is unavailable, restricted, or unverified.

## Required inputs

1. `sources.json`
2. `claim-ledger.json`
3. `semantic-model.json`
4. An Infogenius data file validated against `template.schema.json`
5. A generated or captured source image, when the visual needs a tactile central subject
6. Official identity assets with recorded provenance, or a plain-text fallback

## Layout grammar

The included renderer implements `bounded-system`, the correct grammar for architecture maps with cross-cutting controls. Other semantic shapes must route to a different composition rather than being forced into this template:

| Semantic shape | Required composition |
| --- | --- |
| Bounded architecture | This cutaway + annotated callout template |
| Runtime with loops | State-machine or event-lifecycle template |
| Comparison | Shared-dimension matrix |
| Timeline | Dated event rail |
| Decision policy | Decision tree or rule matrix |
| Peer taxonomy | Same-level category map |

## Rendering

The renderer always writes an SVG master. It can also create a PNG when `sharp` is available.

```powershell
$env:NODE_PATH = 'C:\Users\frank\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& 'C:\Users\frank\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  brand-image-system/runtime/templates/infogenius-social/render.mjs `
  brand-image-system/runtime/examples/ultimate-ai-architecture-infogenius/template-data.json `
  --root 'C:\Users\frank\brands\image-system\ai-architect-coe\2026-08-21-ultimate-ai-architecture-infogenius-pilot' `
  --png
```

Outputs:

- `masters/master.svg`
- `masters/master.png` when `--png` succeeds

For a no-tap mobile read, render the five-slide carousel from the same data contract:

```powershell
$env:NODE_PATH = 'C:\Users\frank\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& 'C:\Users\frank\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  brand-image-system/runtime/templates/infogenius-social/render-carousel.mjs `
  brand-image-system/runtime/examples/ultimate-ai-architecture-infogenius/template-data.json `
  --root 'C:\Users\frank\brands\image-system\ai-architect-coe\2026-08-21-ultimate-ai-architecture-infogenius-pilot' `
  --png
```

The carousel writes five 1080 × 1350 SVG/PNG slides under `crops/carousel/`.

For a brand-owned 16:9 editorial hero with no more than four integrated labels, validate `hero.schema.json` and run `render-hero.mjs`. The generated source must use locked character references; the renderer adds the exact headline, labels, ecosystem rail, and no-endorsement note.

Validate source references, contract invariants, provider slots, and artifact hashes:

```powershell
& 'C:\Users\frank\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  brand-image-system/runtime/templates/infogenius-social/validate-example.mjs `
  brand-image-system/runtime/examples/ultimate-ai-architecture-infogenius `
  --root 'C:\Users\frank\brands\image-system\ai-architect-coe\2026-08-21-ultimate-ai-architecture-infogenius-pilot'
```

## Identity policy

- Never ask an image model to draw a third-party mark.
- Use only the unmodified first-party asset recorded in the data file.
- Keep every provider equally weighted; the gateway is not a ranking.
- Do not infer that a company has an official mascot. Mistral describes its pixel cat as an emblem; that is the documented term.
- When terms or permissions are unclear, render the company or product name in plain text and mark the asset state `plain-text-only`.
- Every public export must include an independent-editorial/no-endorsement note.

## Social reading rules

- One dominant thesis, no generic “overview” title.
- Eight architecture callouts maximum on one 4:5 plate.
- Callout copy should stay under 80 characters where possible.
- Provider traits must use the same comparison frame and no more than two lines.
- Treat the dense one-sheet as a save/open artifact. If body copy is not readable in the 360-pixel preview, the five-slide carousel is the primary social release and the one-sheet becomes the downloadable reference.
- Freeze grid, type, source rail, and identity treatment after one human-approved pilot. Do not bulk-generate a series before that gate.
