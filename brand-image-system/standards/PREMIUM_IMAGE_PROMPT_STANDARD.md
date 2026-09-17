# Premium Image Prompt Standard

Version: `visual-prompt-standard.v1`
Updated: 2026-08-21

Use this standard for every generated image, image edit, reference-guided variation, source frame, poster, hero, social asset, or illustration layer.

## The unit of work is a prompt packet

A prompt string is only one field. A production prompt packet also carries the outcome, source context, brand decision, reference rights, model receipt, deterministic overlay plan, inspection evidence, and final decision.

The packet validates against `../runtime/schemas/visual-prompt-packet.schema.json`.

## Outcome contract

Declare before generation:

- **Audience:** who must understand and trust the asset.
- **Surface:** exact placement, dimensions, aspect ratio, and responsive crops.
- **First read:** the subject or idea that must land in three seconds.
- **Evidence:** what makes the image specific rather than decorative.
- **Asset tier:** A, B, C, D, or blocked.
- **Taste direction:** references to learn from and the behavior to preserve.
- **Failure modes:** visual, semantic, brand, legal, accessibility, and crop risks.
- **Acceptance gate:** inspection set, reviewers, score, and human decision.

Do not generate when the intended surface, subject, or asset tier is unresolved.

## Prompt architecture

Use this order. It works across current image models and remains easy to maintain:

1. **Intent and surface** — what is being created, for whom, and where it will appear.
2. **Subject** — the principal person, object, place, system, or action.
3. **Context** — environment, time, surrounding objects, and narrative situation.
4. **Composition** — hierarchy, framing, camera position, depth, crop, safe zones, and negative space.
5. **Art direction** — medium, material, palette roles, lighting, texture, and emotional register.
6. **Brand behavior** — brand pack, canonical assets, recognizable behaviors, and prohibited cross-brand leakage.
7. **Exact-preservation instructions** — only for supplied references that must remain stable.
8. **Fragile-element constraints** — text, logos, hands, faces, geometry, reflections, or repeated identity.
9. **Output intent** — source layer, draft, edit, final candidate, transparent asset, or crop family.

Use short labeled blocks or concise paragraphs. Prefer visual specificity over adjective stacks. “Museum-grade,” “premium,” “cinematic,” and “world-class” are not directions until translated into observable choices.

## Prompt template

```text
Create a [asset type] for [audience] on [surface and aspect ratio].

First read
[One subject or idea that must land immediately.]

Scene and subject
[Who or what is present, what is happening, and the relevant context.]

Composition
[Framing, hierarchy, focal position, depth, safe zones, negative space, and crop behavior.]

Art direction
[Medium, materials, palette roles, lighting, texture, atmosphere, and level of realism.]

Brand behavior
[Brand pack, ownable metaphor, canonical reference assets, and what must not leak in from other brands.]

Preserve
[Identity, object, product, silhouette, layout, or supplied reference features that must remain stable.]

Avoid
[Specific failure modes: fake text, generated marks, malformed anatomy, generic AI tropes, busy background, or crop failures.]

Output role
[Illustration/source layer only, final art candidate, transparent cutout, edit, or crop family.]
```

## Exact content boundary

Generated pixels may be used directly only when an export inspection proves that any included text or structured content is correct and the asset is not carrying a high-risk public claim. For premium, factual, technical, legal, medical, financial, architectural, or brand-sensitive work:

- Render final public copy deterministically.
- Render exact numbers, charts, axes, legends, code, UI, and diagrams deterministically.
- Place canonical logos as approved assets after generation.
- Treat generated typography as a composition draft or replaceable source layer.
- Treat generated arrows, labels, topology, and causality as untrusted until reconciled with a semantic model.

An advanced model’s ability to render text or infographics does not remove the verification boundary. Current OpenAI documentation still notes possible failures in precise text placement and layout-sensitive composition; current Google guidance recommends preparing exact text first. Use the model’s strength, then verify the artifact as a publisher.

## Reference assets

Every reference must declare:

- Identifier and source path or URL.
- Role: identity, object, composition, material, style, product proof, or canonical mark.
- Rights status: owned, licensed, official-use-permitted, public domain, source-linked-review, or blocked.
- Lock level: inspiration, preserve silhouette, preserve identity, preserve layout, or exact asset.

Rules:

- Do not use a third-party mark as a style reference for generating a new mark.
- Do not let a model redraw a canonical logo for public use.
- Do not call a character an official mascot without a first-party source proving that status.
- An original editorial character may be labeled as original; it must not imply lab endorsement.
- Prefer art movements, material systems, photographic language, and observable craft over imitating a living artist’s signature style.

## Generation and editing routes

Choose the route based on the outcome, not personal model preference:

- **Text to image:** new scenes, posters, editorial illustration, and source frames.
- **Reference-guided generation:** stable subject, material, brand object, or composition family.
- **Edit or inpaint:** preserve a successful base and change the smallest necessary region.
- **Deterministic composition:** exact copy, data, logos, diagrams, UI, and publication crops.
- **Product capture:** real product proof and real interface states.

Record the model lane as `verified`, `runtime-best-available`, `unknown`, or `blocked`. Never invent a model name from a harness label. An `unknown` or `blocked` lane cannot be presented as a verified production route.

## Iteration protocol

1. Generate one directionally complete candidate.
2. Inspect the actual export at full size and delivery size.
3. Name the strongest element, weakest element, and one highest-leverage change.
4. Edit from the base when the composition is sound.
5. Regenerate only when the concept, hierarchy, or subject is wrong.
6. Compare with at least one meaningfully different direction for important work.
7. Record why the selected direction won.

Do not hide iteration by keeping only the final prompt. Preserve the prompt version, output path, critique, and decision.

## Surface and crop checks

Inspect the asset on every committed surface:

- Desktop hero or article width.
- Mobile hero or article width.
- Open Graph or 16:9 crop.
- 1:1, 4:5, and 9:16 when the campaign requires them.
- Light and dark application where relevant.
- Poster frame and reduced-motion route when used in motion.

Do not assume a master crop can be mechanically centered into every derivative. Protect faces, product proof, logos, callout zones, and reading order.

## Diagnostic score and decision

Score the inspected export out of 30:

- 5: first read and hierarchy.
- 5: brand fit and ownability.
- 5: craft, composition, type, spacing, material, and crop.
- 5: accessibility and surface fitness.
- 5: accuracy, provenance, and lack of artifacts.
- 5: usefulness for the intended audience and action.

Decision:

- `26–30`: eligible for independent human approval.
- `22–25`: targeted iteration.
- `0–21`: restart from the brief and references.
- Explicit founder rejection: restart regardless of score.

The maker may diagnose its own work but cannot be the only approving critic.

## Stop conditions

Stop or restart when:

- The image has no specific subject, evidence, or brand behavior.
- The primary asset is Tier D filler.
- A factual asset has no source or claim ledger.
- A public mark is generated, distorted, or unverified.
- Text, geometry, anatomy, UI, or reflections fail inspection.
- The image only works because a crop hides defects.
- The model route or output path is unverified.
- A third-party reference has unclear rights.
- The work is being bulk-generated before one direction passes.
- The final export has not been inspected on its real surface.
