# Native Imagegen Infographic Workflow

Version: `native-imagegen-infographic.v1`
Updated: 2026-08-21

Use this runbook for premium social, editorial, educational, creator, and thought-leadership infographics where the image should feel authored as one raster rather than assembled from generated art plus a UI/SVG template.

## Required skills

- Codex built-in `imagegen` — raster generation and targeted image editing.
- `baoyu-infographic` — content analysis, layout selection, style selection, structured content, and reproducible prompt files.
- `premium-visual-design` — outcome contract, references, asset tier, critique, inspection, and 30-point gate.

Install the infographic skill from its inspected MIT source:

```powershell
npx skills add https://github.com/jimliu/baoyu-skills --skill baoyu-infographic -g -y
```

The Starlight user preference at `C:\Users\frank\.baoyu-skills\baoyu-infographic\EXTEND.md` pins `preferred_image_backend: codex-imagegen` and provides the `starlight-authored-editorial` style.

## Trigger phrase

Use a request such as:

```text
Use premium-visual-design + baoyu-infographic + imagegen.
Production lane: native-imagegen.
Create a 4:5 premium social infographic about <topic>.
Research current primary sources first.
Generate the typography, callouts, iconography, and illustration as one native raster.
Save the full prompt before generation. Inspect every visible word. Correct defects only with targeted imagegen edits; never with code overlays.
```

## Workflow

### 1. Choose the lane

Use `native-imagegen` for concise social/editorial communication. Move to `deterministic-composite` when the artifact contains audited metrics, legal copy, exact axes, dense tables, code, product UI, engineering-critical relationships, or official third-party marks.

### 2. Research and constrain the truth

Research unstable claims with current primary sources. Create a compact semantic model before art direction. Every arrow, layer, grouping, and sequence must be approved before prompting.

### 2A. Pass the social narrative gate

For social or educational sequences, apply `SOCIAL_EDUCATION_NARRATIVE_STANDARD.md` before selecting a visual style. Define one spoken audience promise, then assign distinct jobs to the sequence: promise, contradiction, reframe, reference, and resolution. Score the writing at least 8/10 for specific promise, tension, progression, retellability, and payoff.

Do not send a component list to imagegen and expect visual polish to create meaning. Reject taxonomy-first writing when slides merely repeat a noun, definition, and diagram. Every slide must answer the reader's next question and create a reason to continue.

### 3. Control the text budget

Target:

- One headline.
- One short thesis.
- Five to seven short labels.
- No body paragraphs.
- No decorative microcopy.

Pair technical nouns with consequences wherever possible: `WORLD MODELS — FORESIGHT` teaches more than `WORLD MODELS — SIMULATE ENVIRONMENTS` because it gives the audience a retellable capability frame. Preserve nuance in the source ledger and evidence notes.

Long provider lists or taxonomies may exceed the target only when each string is short and the model has enough physical label surfaces.

### 4. Select layout and style

Use a Baoyu layout that matches the information grammar. For a layered AI architecture, prefer `structural-breakdown`; for a modular guide, use `dense-modules` only when small text is not required in the final crop.

Use `starlight-authored-editorial` when FrankX/Starlight technical content needs tactile photorealism, graphic color blocking, and integrated type without dashboard cosplay.

### 5. Save the prompt before rendering

Write `prompts/01-native-<slug>.md` before calling imagegen. Include:

- Surface and intended crop.
- Central subject and first read.
- Approved information structure.
- Exact quoted text, with uncommon names spelled letter by letter.
- Placement and typography role for each string.
- Visual references and brand constraints.
- Explicit `no other visible text` constraint.
- Anti-patterns: no HUD, equal cards, node-cloud cliché, claymorphism, pseudo-copy, fake UI, or generated logos.

### 6. Generate natively

Call Codex `imagegen` with the saved prompt content. Do not substitute SVG, HTML, Canvas, Pillow, ImageMagick, or a template renderer.

### 7. Inspect the actual raster

Compare every visible string with the approved list. Check:

- Spelling, duplication, and extra pseudo-copy.
- Three-second hierarchy.
- Relationship accuracy.
- Material and lighting craft.
- Final-size legibility.
- Brand recognizability without a logo.
- Actual pixel dimensions and platform crop.

### 8. Correct with imagegen

Save `prompts/02-edit-<defect>.md`. Make one targeted change, restate every invariant, reference the current candidate, and use imagegen editing. Preserve the flawed candidate for comparison.

Never cover, erase, or repaint native text with code.

### 9. Record and hand off

Preserve prompts, candidates, final raster, source ledger, long description, hashes, dimensions, critique, score, and human decision. A score of 26/30 makes a candidate eligible for human review; founder approval remains explicit.

## Definition of done

- Native raster backend used.
- Saved prompt and edit prompts exist.
- Exact visible text reconciled.
- No pseudo-copy or generated logo.
- Actual export inspected.
- Pixel dimensions recorded.
- Target crop checked or an explicit crop limitation recorded.
- 30-point score recorded.
- Human decision pending, approved, iterate, or restart.
