# Premium Infographic Standard

Version: `premium-infographic-standard.v2`
Updated: 2026-08-21

Use this standard for imagegen-native editorial infographics and for verified diagrams, architecture plates, system maps, timelines, comparisons, charts, decision trees, taxonomies, and explainers.

## Definition

A premium infographic is a truthful information product with strong visual authorship. Native image generation may author the whole raster—including concise text—when the surface rewards visual unity and the consequences of a text error are low. Deterministic composition remains mandatory when exactness is the product.

Every job still has three conceptual layers, even when one image model renders them together:

1. **Semantic model** — claims, terms, categories, nodes, edges, states, values, sources, and reading order.
2. **Visual-authorship layer** — generated, edited, rendered, or designed imagery, typography, iconography, and spatial composition.
3. **Publication layer** — approved text, data, relationships, marks, accessibility, crops, and export evidence.

The semantic model is authoritative. A generated raster may be the final visual artifact, but it never becomes the source of truth for the claims it depicts.

## Production-lane router

Choose the lane before prompting. The word `infographic` does not choose the lane.

### Lane A — native imagegen authored infographic

Default for social, editorial, campaign, educational, and thought-leadership infographics when visual unity, memorability, and speed matter more than machine-perfect typesetting.

Use when all are true:

- The text set is concise: preferably one headline, one short thesis, and no more than seven short labels.
- The image does not contain audited metrics, legal copy, dense tables, exact axes, code, or long citations.
- A misspelled label can be corrected by a targeted image edit or regeneration without invalidating external evidence.
- Official third-party marks are not required; use plain-text names unless an exact asset is composited in the deterministic lane.
- The final raster will be inspected at its actual social or editorial crop.

Hard rules:

- Use the runtime-native image generator when available.
- Ask the model to render every quoted label verbatim, exactly once, with specified placement and hierarchy.
- Treat typography, arrows, iconography, material, and illustration as one authored composition.
- Never repair generated text with SVG, HTML, Canvas, Pillow, ImageMagick, or a painted code overlay.
- If text is wrong, make one targeted image edit at a time or regenerate with fewer words.

### Lane B — deterministic verified composite

Use for investor, compliance, legal, engineering, research, benchmark, product UI, data visualization, or partner-brand work where a wrong character, value, logo, axis, or relationship would invalidate the artifact.

Lane B uses generated imagery only as an optional source layer. Exact text, data, connectors, marks, and citations are composed with code or a design tool and exported to raster for delivery.

## Gate 1: claim ledger

Before layout, inventory every material public claim:

- Stable identifier.
- Exact claim text.
- Claim type: fact, interpretation, recommendation, version, comparison, or example.
- Source identifiers.
- Verification state: proposed, source-linked, independently-verified, disputed, or blocked.
- Effective or checked date for unstable claims.
- Intended label or visual encoding.

Publication candidates cannot contain proposed, disputed, or blocked claims. “Grounded” is not a verification state unless the resolved source and the checked claim are stored.

## Gate 2: semantic grammar

Choose a visual grammar that matches the truth being expressed.

| Information shape | Use | Do not use |
| --- | --- | --- |
| Bounded system or architecture | Layered map, component map, or system boundary with cross-cutting controls | A numbered ladder that implies sequence |
| Truly linear process | Sequence with explicit start, end, and handoff conditions | A corridor when retries, branches, cancellation, or compensation exist |
| Runtime with branches or loops | State machine, flowchart, or event lifecycle | A left-to-right pipeline that hides failure paths |
| Two independent dimensions | Matrix, scatterplot, or paired axes | A single ladder that invents monotonic order |
| Peer taxonomy | Mutually comparable categories at one level | Mixing roles, protocols, products, patterns, and qualities in one flat list |
| Decision policy | Decision tree, rule table, or scored matrix | Decorative routing lanes that mix modality, cost, speed, capability, and deployment |
| Comparison | Same dimensions, units, and evidence for every item | Vendor rails comparing SDKs, models, runtimes, standards, and providers as peers |
| Evidence over time | Timeline with dated events and source status | Freshness labels with no dates or version anchors |

If the information does not fit one grammar, split the plate. Density is not sophistication.

## Gate 3: nodes, edges, and causality

Every node and edge must be named in the semantic model before visual styling.

For nodes, record:

- Identifier and label.
- Type and system boundary.
- Parent or grouping rule.
- Source or definition.
- Whether it is a component, property, control, actor, artifact, state, or outcome.

For edges, record:

- From and to identifiers.
- Relationship type: sequence, data flow, control, dependency, containment, feedback, fallback, retry, compensation, or observation.
- Directionality.
- Condition or trigger.
- Source or rationale.

Rules:

- An arrow is a claim.
- Proximity is a claim.
- Ordering is a claim.
- Color grouping is a claim.
- Equal visual weight implies peer status.
- A numbered list implies order even when the copy says otherwise.

Do not let the image model invent any of these relationships.

## Gate 4: composition blueprint

Create a low-fidelity composition blueprint before generation:

- Canvas and delivery dimensions.
- Title, thesis, legend, source rail, and description location.
- Primary reading path.
- Bounding regions for the semantic elements.
- Native text zones for Lane A or deterministic text/mark zones for Lane B.
- Illustration window and permitted overlaps.
- Mobile or article-width simplification plan.

For an editorial article, inspect the plate at the actual content width, not only at the master export width. Labels that are correct but unreadable at delivery size fail.

## Gate 5: native imagegen authorship

In Lane A, image generation may author:

- The tactile central subject or cutaway metaphor.
- Material, lighting, atmosphere, editorial character, and spatial setting.
- Concise titles, labels, callouts, icons, and arrows that were approved in the semantic model.
- The final integrated raster composition.

Lane A does not authorize the model to invent:

- Claims, labels, numbers, relationships, hierarchy, taxonomy, or causality not present in the approved content model.
- Official logos, wordmarks, product icons, or mascot identity.
- Versioned technical claims, audited metrics, code, dense legends, axes, or UI.
- Architecture that has not passed semantic review.

Native text is accepted only after literal visual comparison with the approved text set. The image is rejected or edited if a character is wrong, a label appears twice, pseudo-copy appears, or delivery-size legibility fails.

## Gate 6: deterministic publication layer

In Lane B, use HTML/CSS, Canvas, Figma, Canva, code-rendered SVG, or another exact composition route for:

- All public copy and labels.
- Values, axes, legends, tables, and chart marks.
- Arrows, connectors, boundaries, and reading order.
- Canonical brand assets.
- Citations and source identifiers.
- Export crops and responsive variants.

Raster PNG or WebP may be the final delivery format. “No SVG final” does not mean “no deterministic composition”; it means the deterministic composition is exported to the required raster format.

Do not use Lane B as a quality crutch. A technically exact SVG template with generic cards, dashboard chrome, or weak hierarchy still fails the visual gate.

## Typography and information density

- Sentence case is the default.
- Use one headline, one short thesis, and only the callouts the explanation requires.
- In Lane A, keep the verbatim text set short enough for large, integrated type. No generated microtext or decorative pseudo-copy.
- Do not use three equal bottom pills as a default ending.
- Use a real legend when encodings need explanation.
- Avoid all-caps technical decoration and tiny mono labels.
- Use visible hierarchy rather than equal card weight.
- Remove information that cannot survive the delivery crop; link to the full explanation instead.

## Third-party labs, brands, and characters

- Use a canonical official asset only when the usage is permitted and relevant.
- Store the source URL, download path, checked date, rights status, and transformation status.
- Do not generate or approximate a lab logo.
- Do not add glow, texture, 3D material, mascot treatment, or other effects to a protected mark unless the official rules allow it.
- Do not imply partnership, sponsorship, or endorsement.
- Do not call Codey, Clawd, a robot, animal, or other character “official” without a first-party source that says so.
- If no approved visual asset exists, use the company or product name in plain text with accurate attribution.
- Original editorial characters must be labeled original and visually subordinate to the factual architecture.

## Accessibility

Every complex infographic needs:

- A short alt description that identifies the artifact and its main point.
- A long description that communicates the essential claims, structure, values, relationships, and reading order.
- A text or table equivalent when the visual encodes structured data.
- Sufficient contrast for text and meaningful graphical objects.
- A main-content summary that explains why the infographic matters.

Do not put a dense paragraph into `alt`. The short alternative identifies; the adjacent or linked long description explains.

## Semantic review

Run this before visual-quality scoring:

- Every claim resolves to its source.
- Every category contains comparable items.
- Every arrow has a defined relationship.
- Cross-cutting controls are not shown as isolated steps.
- Optional steps are not shown as mandatory.
- Branches, loops, retries, and failure states are visible where material.
- Dimensions are not mixed into a false ladder.
- Versions and checked dates are accurate.
- The explanation and picture make the same claim.

Verdict: `pass`, `revise`, or `hold`. A visual score cannot override `revise` or `hold`.

## Visual review

After semantic pass, inspect:

- First read and hierarchy.
- Brand fit and ownability.
- Composition, typography, spacing, material, and crop.
- Legibility at master, delivery, and mobile/article widths.
- Contrast and accessibility route.
- Logo and character integrity.
- Pixel artifacts and generated pseudo-copy.
- Usefulness to the intended audience.

Score with the 30-point gate. A 26/30 candidate is eligible for human approval; it is not automatically approved.

## Required production packet

Lane A minimum:

```text
<job-root>/
  sources.json
  semantic-model.json
  structured-content.md
  prompts/
    native-v1.md
    native-edit-v2.md
  candidates/
    native-v1.png
    native-v2.png
  crops/
    social.png
  accessibility/
    long-description.md
  evidence.json
```

Lane B minimum:

```text
<job-root>/
  sources.json
  claim-ledger.json
  semantic-model.json
  visual-prompt-packet.json
  prompts/
    source-layer-v1.txt
  source/
    generated-or-captured-layer.png
  masters/
    master-source-file.*
    master.png
  crops/
    article.png
    og.png
    mobile.png
  accessibility/
    long-description.md
  evidence.json
```

Store hashes for public masters and record which source, overlay, and crop produced each export.

## Series rule

For a multi-plate series:

- Freeze the shared type, grid, citation, legend, and source-rail system after one approved pilot.
- Let each plate choose the correct semantic grammar; do not force every concept into the same layout.
- Maintain stable terminology and identifiers across plates.
- Review the series for contradictions, not only each plate in isolation.
- Do not animate a plate until its still semantic model passes.
- Generate one pilot, not a ten-image batch, before the direction is approved.

## Release blockers

- Material claim without a source.
- Lane A used for audited metrics, legal copy, dense charts, exact UI, official marks, or another artifact whose value depends on machine-perfect typesetting.
- Generated text that does not match the approved verbatim set, appears more than once, becomes pseudo-copy, or fails at delivery size.
- Code or design overlays used to repair text inside a Lane A candidate instead of imagegen editing or regeneration.
- Generated logo or architecture relationship used as authoritative output without semantic reconciliation.
- Mixed taxonomy or false sequence.
- Arrow with no declared relationship.
- Generated or altered third-party mark.
- Unsupported “official mascot” claim.
- No long description for a complex image.
- Labels unreadable at delivery size.
- Visual approval before semantic approval.
- Uninspected final export.
