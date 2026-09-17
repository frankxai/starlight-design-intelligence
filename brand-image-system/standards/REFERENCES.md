# Primary References

Current as of 2026-08-21. Model names, limits, brand rules, and platform behavior are unstable; re-check the primary source before changing a production router.

## Image generation

- [OpenAI GPT Image prompting guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide) — recommends a maintainable prompt order, explicit intended use, concrete materials and visual medium, and evaluation at the required fidelity.
- [OpenAI image-generation guide](https://developers.openai.com/api/docs/guides/image-generation) — documents current model parameters and the remaining limitations around precise text placement, recurring consistency, and layout-sensitive composition.
- [Google Gemini image-generation guide](https://ai.google.dev/gemini-api/docs/image-generation) — documents current generation/editing patterns, reference-image behavior, text workflows, aspect ratios, model selection, and limitations.
- [Google Imagen prompt guide](https://ai.google.dev/gemini-api/docs/imagen) — useful for the durable subject + context + style framing and iterative refinement pattern. Treat model availability notes as time-sensitive.

## Accessibility and provenance

- [W3C WAI complex-images tutorial](https://www.w3.org/WAI/tutorials/images/complex/) — requires a short identification and an equivalent long description for charts, diagrams, maps, and other complex images.
- [W3C WAI images tutorial](https://www.w3.org/WAI/tutorials/images/) — prefers real text over images of text where the technology can achieve the presentation and requires equivalent alternatives for informational images.
- [C2PA specifications](https://spec.c2pa.org/) — primary open specification for content provenance and media history. Use a prompt/source/output ledger even when the current tool does not emit Content Credentials.

## Third-party identity

- [OpenAI brand guidelines](https://openai.com/brand/) — use marks only in relevant contexts, exactly as provided, without effects, textures, unauthorized variants, or implied endorsement.
- [Google Brand Resource Center](https://about.google/brand-resource-center/guidance/) — do not imitate identity or imply affiliation; use approved resources only where the stated use permits them.
- [Microsoft trademark and brand guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks) — treat names, logos, product icons, designs, and other brand features as protected brand assets.

## Interpretation used by this standard

Current image models can produce impressive text-heavy layouts and infographics. The same primary documentation also records remaining precision and consistency limits. Therefore:

- Model capability authorizes exploration, not factual approval.
- Grounding helps research, but it does not replace a stored claim ledger.
- Correct-looking text is not verified text.
- A recognizable logo is not an approved logo asset.
- A model-generated arrow is not evidence of a valid causal relationship.
- A visually consistent character is not an official mascot unless first-party evidence says so.
