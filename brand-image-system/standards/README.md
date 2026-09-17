# Visual Prompt and Infographic Standards

This directory is the canonical design-intelligence layer for premium image-generation prompts and research-grounded infographics.

## Load order

1. [`PREMIUM_IMAGE_PROMPT_STANDARD.md`](PREMIUM_IMAGE_PROMPT_STANDARD.md) for every generated image or edit.
2. [`PREMIUM_INFOGRAPHIC_STANDARD.md`](PREMIUM_INFOGRAPHIC_STANDARD.md) when the asset carries facts, data, topology, sequence, causality, comparison, or architecture.
3. [`INFOGENIUS_ADAPTER.md`](INFOGENIUS_ADAPTER.md) when Infogenius assembles or produces the asset.
4. [`REFERENCES.md`](REFERENCES.md) for the dated primary-source basis.
5. The relevant brand pack and repository instructions.

The machine-readable companion is:

- Schema: `../runtime/schemas/visual-prompt-packet.schema.json`
- Validator: `../runtime/scripts/validate-visual-prompt-packet.mjs`
- Worked example: `../runtime/examples/ai-architecture-infogenius.visual-prompt-packet.json`

## Core rule

Generated pixels may carry atmosphere, subject, material, lighting, spatial composition, and editorial illustration. They do not become trusted facts merely because a current model can render text, diagrams, or infographics.

For a premium infographic, keep three layers distinct:

1. **Semantic layer:** sourced claims, taxonomy, nodes, edges, states, values, and intended reading order.
2. **Generated source layer:** optional art-directed imagery with no authority over labels, data, logos, or causality.
3. **Publication layer:** deterministic typography, verified marks, exact data, accessible descriptions, and inspected exports.

If the generated source layer disappears, the publication must remain accurate. If the deterministic layer disappears, the image may remain beautiful but must not be presented as an authoritative infographic.
