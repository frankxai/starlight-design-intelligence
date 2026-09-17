# Infogenius Adapter

Version: `infogenius-visual-adapter.v2`
Updated: 2026-08-21

This adapter defines how Infogenius consumes the universal premium visual system. It applies to research-grounded infographics produced from an AI studio, MCP server, coding agent, design tool, or image model.

## Authority order

1. Repository and estate instructions.
2. Domain truth and current primary sources.
3. `PREMIUM_INFOGRAPHIC_STANDARD.md` for semantic integrity.
4. `PREMIUM_IMAGE_PROMPT_STANDARD.md` for generated or edited source layers.
5. Relevant brand pack.
6. Arcanea Gate styling only when the operating unit is Arcanea.
7. Model-specific prompt adapter.

A model adapter may specialize syntax or settings. It may not weaken claim, brand, accessibility, inspection, or human-approval gates.

## Production lanes

Infogenius routes by consequence of error, not by the word `infographic`.

### Native imagegen

Default for premium social/editorial explainers with concise copy. Use `baoyu-infographic` for content analysis and layout/style selection, then the runtime-native image generator for the entire raster. Typography, arrows, illustration, iconography, and material must feel authored as one image. Correct text only through targeted imagegen edits or regeneration.

### Deterministic composite

Required for exact data, charts, engineering relationships, legal or compliance copy, official third-party marks, dense tables, code, or UI. Generated media may supply an illustration layer; exact publication elements come from code or a design tool.

## Two Infogenius modes

### Universal premium

Use for FrankX, Starlight, enterprise AI, AI architecture, research, creator, partner, and neutral editorial work.

- No Arcanea lore or Gate vocabulary.
- Brand pack controls voice, composition, materials, typography, and identity.
- Semantic model controls all information relationships.

### Arcanea

Use only when the operating unit is `arcanea-product-ip` or the user explicitly requests an Arcanea artifact.

- Identify the Gate after the outcome and semantic model are fixed.
- Apply Gate palette, motifs, lighting, atmosphere, and sacred geometry to the illustration and brand layers.
- Do not let frequency, Guardian, or sacred-geometry language replace evidence.
- Do not make a decorative circle, spiral, or Gate imply sequence, hierarchy, or causality unless that relationship exists in the semantic model.
- Load locked canon before using Guardian names, Gate meanings, symbols, characters, or lore.

Arcanea is an art-direction overlay, not an exception to factual integrity.

## Infogenius pipeline

### 1. Intake

Capture audience, surface, first read, artifact class, brand operating unit, dimensions, asset tier, and publication state.

Output: `visual-prompt-packet.json` with `decision: draft`.

### 2. Research

Resolve primary sources and store:

- Source identifier.
- URL or immutable repository reference.
- Publisher and checked date.
- Source type and status.
- Claims supported.

Search grounding may discover or summarize a source. The stored source and checked claim remain the evidence.

Output: `sources.json`.

### 3. Claim ledger

Convert research into discrete claims. Mark each as proposed, source-linked, independently-verified, disputed, or blocked.

Output: `claim-ledger.json`.

### 4. Semantic model

Choose the correct grammar and define nodes, edges, types, conditions, values, and reading order. Run semantic review before art direction.

Output: `semantic-model.json` and a `pass`, `revise`, or `hold` verdict.

### 5. Direction and wireframe

Create:

- Keep, Avoid, Signature, System, Sources.
- Deterministic layout zones.
- Safe areas for final copy, marks, citations, and crops.
- One illustration hypothesis and at least one meaningfully different direction for important work.

Output: composition blueprint with the selected production lane.

### 6. Prompt assembly

Assemble the image-model prompt from the packet:

- Intent and surface.
- Subject and context.
- Composition and reserved safe zones.
- Brand or Gate art direction.
- Reference assets and lock levels.
- Fragile-element constraints.
- Explicit source-layer role.

The Prompt Enhancement System may enrich palette, motif, material, lighting, and style. It must not invent claims, labels, logos, characters, or diagram relationships.

Output: versioned prompt under `prompts/`.

### 7. Native generation or source-layer generation

For native imagegen, generate the complete authored raster from the approved structured content. For deterministic composite, generate or edit only the approved source-layer role. Record actual model lane, settings, capability receipt, source prompt, references, and output path.

Output: inspected native candidate under `candidates/` or source layer under `source/`.

### 8. Correct or compose

Native imagegen: compare every visible text string and relationship with the approved set; make one targeted imagegen edit at a time. Never repair the bitmap with code overlays.

Deterministic composite: place exact copy, claims, diagrams, arrows, numbers, citations, canonical identity assets, and accessibility hooks with code or a design tool.

Output: corrected native raster or deterministic source master and raster exports.

### 9. Dual review

Run semantic review and visual review separately.

- Semantic reviewer checks truth, taxonomy, causality, versions, and source parity.
- Visual reviewer checks hierarchy, composition, brand fit, legibility, crop, artifacts, and accessibility.
- The maker cannot be the only approving critic.

Output: review verdicts and 30-point diagnostic score.

### 10. Publication packet

Complete long description, source ledger, hashes, crop inspection, provenance, and human decision.

Output: `evidence.json` and `approved`, `iterate`, `restart`, or `blocked` decision.

## Required prompt-packet invariants

For every `infographic`, `diagram`, or `chart`:

- `semantic.required` is `true`.
- At least one sourced material claim exists.
- A short alt description and long-description path exist.
- Candidate or published work has semantic `pass`, visual `pass`, inspected artifacts, and a score of at least 26.

For `native-imagegen`:

- `generation.sourceRole` is `final-native-infographic`.
- `deterministic.required` is `false`.
- The approved text set is concise, quoted verbatim in the prompt, and visually reconciled after generation.
- Official third-party marks are not generated; plain-text names are used or the job moves to deterministic composite.

For `deterministic-composite`:

- `generation.sourceRole` is `illustration-layer` or `draft-composition`, never `final-semantic-layer`.
- `deterministic.required` is `true`.
- Exact text, data, connectors, and official marks are deterministic.

Validate with:

```powershell
node brand-image-system/runtime/scripts/validate-visual-prompt-packet.mjs `
  brand-image-system/runtime/examples/ai-architecture-infogenius.visual-prompt-packet.json
```

## How the premium-visual-design skill should use this adapter

When the `premium-visual-design` skill handles an Infogenius job:

1. Use its outcome contract and asset-tier gate.
2. Load this adapter and both standards in this directory.
3. Create the prompt packet before calling an image tool.
4. Use `baoyu-infographic` plus native Codex `imagegen` when the native lane is selected.
5. Inspect the actual native candidate or generated source and final composite.
6. Record semantic and visual verdicts separately.
7. Report asset tier, model/source route, strongest element, weakest element, iteration change, score, and human decision.

## Migration from prompt-only Infogenius jobs

| Existing artifact | New destination |
| --- | --- |
| Research links inside a prompt | `sources.json` plus claim source IDs |
| Narrative prompt | `generation.prompt` |
| Style suffix | `composition.artDirection` and brand/Gate fields |
| “No text” negative prompt | Remove for native-imagegen; retain only when deterministic composite needs a clean source layer |
| Generated infographic PNG | `candidates/` for native-imagegen; `source/` for deterministic composite |
| Final copy embedded in pixels | Approved in native-imagegen only after literal reconciliation; otherwise deterministic master composition |
| Visual-only critique | Separate semantic and visual reviews |
| “Looks approved” | Explicit human decision and evidence packet |

## Hold conditions

Infogenius must return `hold` or `blocked` when:

- Sources cannot support a material claim.
- The taxonomy mixes incomparable kinds.
- A requested arrow or sequence is not defensible.
- A third-party logo or character cannot be verified for the intended use.
- Arcanea styling would obscure meaning or introduce canon risk.
- The final copy cannot be made legible at delivery size.
- The final export or long description cannot be inspected.
- The user requests bulk production before a pilot passes.
