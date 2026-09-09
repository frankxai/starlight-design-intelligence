# Prompt templates with evidence boundaries

These templates distinguish executed instructions from proposed adaptations. They do not guarantee compliance. Exact original prompts and outputs must accompany any claim of reproduction; sanitized or shortened templates are not byte-identical benchmark inputs.

Current product reference: [OpenAI image-prompting guide](https://developers.openai.com/api/docs/guides/image-prompting). The pilot used a built-in image tool with unknown exact backend, not a selectable named-model comparison.

## Executed local-edit instruction

The following is the executed output-02 prompt. Its source was an existing ensemble output, not included in this documentation release.

```text
Use case: precise-object-edit. Edit the supplied Starlight ensemble
still. Change ONLY the large black diagram panel high on the rear
wall and the diagram panel at far right into plain unmarked limestone
wall surfaces matching adjacent stone. Remove all diagram lines,
nodes and marks on those two panels. Preserve exactly the five
people's identities, faces, hair, expression, costume, pose, hands,
instruments, chair, room geometry, windows, foreground table,
exposure, warm lighting, shadows, camera framing and image
dimensions. Do not add anything. No text, no new diagrams. This is
an edit-locality benchmark; all other regions should remain visually
unchanged.
```

Line wrapping above is editorial. Result: diagrams removed; rug detail changed outside the requested region. The word “exactly” expressed intent and did not establish exact preservation.

Reusable adaptation, not separately tested:

```text
Change only [named object/region]. Replace it with [specific material].
Preserve [enumerated subjects, geometry, light, crop and exact content].
Do not add a substitute decoration or object.
```

Review requested removal and protected regions as separate criteria. Where exact pixels matter, preserve those layers through deterministic composition.

## Reference-role ensemble brief

Structure exercised in outputs 01, 15 and 16; this generic adaptation is not their exact prompt:

```text
Reference A defines the people, clothing and instruments.
Preserve each person's face, proportions, clothing construction,
colors and individual instrument. Create exactly [count] people in
[setting], with [explicit action per person]. Use [depth arrangement]
and readable shared eyelines. Keep heads and instruments inside
[margin]. No text, diagrams, prop swaps or substitute characters.
```

Observed limitation: broad role/color families carried through, but instrument geometry and poses varied; diagrams and tight framing recurred. Do not count proposed appearances as preserved approved identities.

## Complete-creature framing

Structure exercised in outputs 03–04; shortened adaptation:

```text
Show one [canon-constrained creature form], full body, with all
[anatomical extremities] visible. Depict [specific story action].
Keep the complete subject inside generous margins. Separate fixed
form requirements from exploratory palette and surface treatment.
```

Observed limitation: specifying complete antlers and margins did not prevent clipping. A follow-up asking for a wider view restored the canopy but still missed the requested top margin and regenerated the environment. Measure actual framing after generation.

## Wordmark and file-property test

The repeated Starlight brief requested exact mixed-case lettering and a genuinely transparent background. Outputs 05, 13 and 14 all decoded as RGB without alpha. This is a three-attempt failure observation for this route, not evidence that every named model lacks transparency.

Reusable adaptation, not byte-identical to those runs:

```text
Create an experimental wordmark. Exact text once: "[BrandName]".
Use [one typographic direction] with readable counters and intentional
spacing. Flat black lettering. Deliver actual transparency, not a white
background or a painted checkerboard. No mockup or extra symbol.
This remains an unapproved raster concept.
```

Check decoded mode, alpha/transparency metadata, edge quality and actual compositing. A white preview cannot prove transparency. Treat exact spelling, distinctive geometry, small-size readability and vector editability as separate tests.

## Exact-copy stress test

Output 19 exercised mixed-case copy, punctuation and accents. Manual review found the listed text plausible, but the prompt supplied a contradictory block count. Corrected template below is **untested**:

```text
Render seven clearly separated text blocks in this order:
1. What survives an edit?
2. A small field study in image generation
3. Identity: keep the same five characters.
4. Locality: remove only the wall diagram.
5. Transparency: inspect the alpha channel.
6. Evidence: save the prompt and the result.
7. Crème brûlée · naïve · façade · 09 September 2026

The numbers above specify order; do not print them. Preserve all
words, punctuation, accents and capitalization. Leave generous
margins. Add no other text.
```

Inspect every character and line break, then repeat before drawing reliability conclusions. For published labels, charts and exact copy, use a verified deterministic text layer when fidelity is required.

## Minimal evidence record

Keep prompt text/hash, source role/hash, output hash, actual dimensions, decoded file properties, executed route, backend ID if exposed, inspection author, requested-change result, protected-region result, limitations and release status. Keep private locations out of public exports. Unknown fields stay null. Preserve failed outputs and the prompts that produced them.
