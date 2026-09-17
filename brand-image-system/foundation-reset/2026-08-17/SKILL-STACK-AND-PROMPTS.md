# Brand foundation skill stack and prompt kit

This document defines which skills belong at each stage of identity development and supplies reusable prompts. It deliberately separates identity reasoning, vector logo craft, image-world generation, system production, and quality control.

## Skill order

### 1. Diagnose the system

Use `agent-design-review` to inspect the agent workflow, source truth, memory, review loop, model routing, and failure modes. Its job is to explain why multiple agents keep converging on the same visual clichés and to define the controls that prevent recurrence.

Do not use an image model in this stage.

### 2. Build strategic and visual territories

Use `canvas-design` to articulate and express a visual philosophy for each territory board. Use it for black-and-white compositions, material studies, and static art-direction boards—not as a final logo generator.

Use `impeccable` only as a hierarchy and interaction hygiene pass on applications. It is not the authority for brand taste, logo meaning, fonts, or color.

### 3. Protect Arcanea canon

For every Arcanea identity or image task, use these in order:

1. `canon-guardian` to load and enforce locked canon.
2. `arcanean-art-director` to translate canon into a coherent visual system.
3. `cinematic-image-prompt-master` only when producing image-world explorations or campaign frames.

No Arcanea visual may be approved if the rationale is only “fantasy,” “magic,” “portal,” “crystal,” or “cosmic.” The visual must cite the canonical rule or material function it expresses.

### 4. Develop the logo in vector

Do not use `imagegen`, Grok Imagine, Midjourney-style tools, or 3D rendering as the final logo authoring medium. Use them only to explore broad formal territories when necessary.

Final logo work is vector-first: wordmark construction, optical spacing, custom letterforms, one-color geometry, reduction tests, and manual cleanup. Deliver SVG/PDF masters and raster exports from those masters.

### 5. Build the approved system in Figma

After founder approval of one territory and one application quartet, use `figma:figma-generate-library` together with `figma:figma-use` to create variables, typography styles, documented foundations, components, and code mappings. Follow its sequential Phase 0–4 process; do not attempt a one-call library build.

### 6. Generate image worlds and campaigns

Use Codex `imagegen` for high-quality still-image exploration and editing. Never ask it to typeset public headlines, diagrams, labels, or logo masters inside generated pixels.

Use `grok-cli-media-router` as a challenger lane for stills and motion-source frames. Give both lanes the same locked brief and select empirically. Grok execution does not replace Codex-owned file organization, exact overlays, provenance, or QA.

Use `higgsfield-soul-id` only for an explicitly requested, consented Frank likeness workflow. It processes biometric identity data and is not a general brand-foundation tool.

### 7. Check production applications

Use `canva:canva-brand-check` only after a real brand kit exists and a Canva design needs verification. It cannot establish the foundation and must report “cannot verify” when exact colors or fonts are unavailable.

Use deterministic design or code for covers, comparison charts, diagrams, product UI, claims, and exact copy. Generated imagery is a layer, not the compositor.

## Skills not to use as identity truth

- `brand-guidelines` is the Anthropic corporate brand skill. Its Poppins/Lora typography and Anthropic palette are not a general methodology and must not be applied to FrankX, GenCreator, SIS, or Arcanea.
- `model-routing` contains useful cost/risk principles, but its literal model names and prices are dated and Claude-specific. Use the principle: highest-reasoning models for irreversible strategic decisions; deterministic or cheaper tools for mechanical export work.
- No UI kit, “premium SaaS” template, or image model gets to select the brand's personality by default.

## Required brand-foundation files

Every brand pack must contain these before product-family fanout:

1. `strategy.md` — audience, tension, promise, proof, personality, category avoidance.
2. `territories/` — two black-and-white territory boards with explicit differences.
3. `typography.md` — licensed font candidates, real specimens, fallback stack, and rejection reasons.
4. `logo/` — source SVG, outlined SVG, PDF, positive, reverse, small-size, avatar, horizontal, and compact variants.
5. `color.json` — primitives and semantic roles, including one-color and print behavior.
6. `layout.md` — grid, spacing, density, image scale, edge behavior, and composition rules.
7. `imagery.md` — people, places, objects, materials, illustration, generation rules, and exclusions.
8. `iconography.md` — only if the brand needs an icon family.
9. `motion.md` — only after static identity approval; include reduced-motion behavior.
10. `applications/` — web hero, product cover, social frame, and document/product surface.
11. `license-and-provenance.json` — fonts, source assets, generated assets, prompts, models, and rights notes.
12. `decision-log.md` — founder verdicts, rejected directions, reasons, and what changes next.

## Prompt 1 — forensic identity audit

Use this before creating anything:

```text
Act as a brand identity director, design historian, and systems auditor. Inspect the actual supplied logo files, SVG geometry, font declarations, tokens, screenshots, copy, product surfaces, and provenance. Do not infer quality from filenames such as canonical, premium, final, or v2.

For each artifact classify: keep as-is, keep as a seed, rework, retire, or unresolved. Cite the exact file and the visible or structural reason. Separate strategic value, craft quality, distinctiveness, production readiness, and founder preference. Identify copied category conventions and cross-brand contamination.

Do not create a new logo, palette, or mood board. Do not reward polish that lacks authorship. End with: the three most valuable surviving assets, the three most damaging defaults, the decisions only the founder can make, and the smallest next proof required.
```

## Prompt 2 — brand strategy card

Use one run per brand:

```text
Build a strategy card for [brand]. Work from the supplied product truth and customer evidence, not generic AI-brand vocabulary.

Define:
- primary audience and the moment they seek this brand
- human tension or desire
- concrete promise
- proof the brand can honestly show
- personality expressed as five behavioral statements, not adjectives
- what category conventions it must avoid
- what it should never resemble among our other brands
- three possible organizing ideas, each stated in one memorable sentence

Constraints: sentence case; no all-caps styling; no “premium,” “futuristic,” “innovative,” “empowering,” “seamless,” or “where X meets Y” unless backed by specific evidence. Do not propose colors, fonts, logos, gradients, symbols, or image prompts yet.

Return a one-page decision artifact. Recommend one organizing idea and explain the risk of choosing it.
```

## Prompt 3 — black-and-white territory boards

Use after the strategy card:

```text
Create two genuinely different black-and-white identity territories for [brand] from the approved strategy card. Each territory must express a different organizing idea, not the same layout with another font.

For each territory show:
- the brand name as a wordmark study
- two real product titles
- one two-line promise
- one readable paragraph
- numbers and punctuation
- navigation or section labels in sentence case
- a web-hero crop, product-cover crop, social-avatar crop, and document/product crop
- material and image behavior described without adding color

Do not use gradients, glow, glass, 3D, mockup reflections, dark-mode drama, sparkles, orbit/node imagery, portals, status pills, monospaced decoration, or uppercase microcopy. Avoid generic geometric initials. A wordmark-only route is valid.

Make the two territories differ in density, whitespace, rhythm, image scale, edge behavior, typographic voice, and emotional effect. Include a short rationale and a failure mode for each. Stop before color and polished rendering.
```

## Prompt 4 — vector wordmark and symbol exploration

Use with a vector-capable design workflow, not an image renderer:

```text
Develop the approved [brand] territory into a one-color vector identity exploration.

Start with twelve wordmark studies based on letterform rhythm, proportion, spacing, and one defensible custom intervention. Then create at most six symbol studies, and only if the applications prove a symbol is needed. Every symbol must derive from the brand's approved organizing idea; “connection,” “intelligence,” “growth,” “spark,” and “portal” are not sufficient rationales.

Forbidden: generic initials inside circles or squares, loops/arrows, stars/sparkles, nodes, orbits, crystals, portals, infinity marks, play buttons, chat bubbles, brain/circuit imagery, gradient-dependent geometry, and copied trademark silhouettes.

Test every candidate in solid black at 16px, 32px, navigation size, social avatar, A4 cover, and large signage. Reject any candidate that needs glow, color, texture, or an explanatory paragraph to work. Show optical corrections and spacing decisions. Do not call any candidate final; return a contact sheet and the three strongest candidates with risks.
```

## Prompt 5 — typography decision

```text
Build a comparative typography specimen for [brand] using no more than four licensed candidate families. Use the same real content for every candidate: brand name, two product names, a two-line promise, a 120-word paragraph, navigation, numerals, prices, punctuation, and a mobile crop.

Evaluate voice, readability, small-size behavior, technical coverage, multilingual needs, variable-font support, web performance, and license. Do not choose a font because it is fashionable or already installed. Do not use all caps as a shortcut to authority. Recommend a primary voice, support voice only if needed, and robust fallback stack. Record why each rejected candidate lost.
```

## Prompt 6 — image-world benchmark

Use only after a territory, type system, logo, and initial palette are approved:

```text
Create one image-world exploration for [brand] and [surface] using the locked identity brief below.

Subject and action: [one concrete subject doing one concrete thing]
Environment: [specific place with brand meaning]
Composition: [crop, viewpoint, negative space, focal hierarchy]
Material and light: [physical, culturally appropriate description]
Emotional effect: [one precise human feeling]
Brand truth expressed: [approved organizing idea]
Aspect ratio: [ratio]

Do not render logos, headlines, labels, diagrams, charts, interface text, or factual claims. Avoid [brand-specific exclusions]. Produce a clean image that leaves intentional space for deterministic typography. The result must be recognizable as this brand without relying on a color wash.
```

Run the identical prompt through the approved still-image lanes. Log model/tool, full prompt, references, output path, crop, date, and rights notes. Compare outputs blind before revealing the model.

## Prompt 7 — adversarial brand critic

```text
Review these identity candidates as a skeptical creative director who did not make them. Do not average the work into a compromise.

For each candidate answer:
1. What specific brand truth is visible without reading the rationale?
2. What category or competitor conventions does it resemble?
3. Could it be moved to another brand in this portfolio with only a name or color change?
4. What remains memorable after ten seconds?
5. What fails at 16px, in one color, in print, on mobile, or beside a real product title?
6. Which decision looks automated rather than authored?
7. What should be removed before anything is added?

Return: advance, revise, or restart. Name one reason. Founder rejection overrides this verdict.
```

## Brand-specific brief inserts

### FrankX — working intelligence

```text
The brand is a human founder, teacher, builder, and AI architect who turns difficult systems into practical capability. Express disciplined intelligence with warmth, candor, authorship, and evidence of actual work. Avoid tech-company anonymity, cyan software glow, sparkle marks, generic FX monograms, executive-luxury clichés, and spiritual-tech fog. Use workshops, drafts, marginalia, real tools, prototypes, and publishing only when they support the idea rather than decorate it.
```

### GenCreator — open studio

```text
The brand helps creators turn raw intent into finished, launched work. Express motion through visible transformation, editing, arrangement, rehearsal, and craft—not arrows or loop symbols. It should feel generous, active, culturally awake, and maker-owned rather than like a dark SaaS dashboard. Avoid gradient G marks, play buttons, infinity loops, creator-economy confetti, neon, pills, and fake product UI.
```

### Starlight Intelligence / SIS — civic intelligence

```text
The brand builds high-trust intelligence systems where human authority, memory, evidence, portability, refusal, and reversible decisions are visible. Express capability with restraint and inspectability. Avoid robots, stars, constellations, command centers, neural networks, control-room dashboards, cybersecurity shields, government seals, and science-fiction theater. Explore standards, records, measurement, annotation, custody, and open structure without becoming bureaucratic.
```

### Arcanea — living codex

```text
Load locked Arcanea canon before ideation. The identity must emerge from the lawful relationship between Lumina and Nero, the ten gates, elemental materials, thresholds, memory, and living records. Cite the canon behind every formal move and do not invent lore. Avoid generic fantasy portals, purple nebulae, arbitrary crystals, glowing runes, giant metallic A renders, game-logo bevels, and gold-on-black prestige unless a specific canonical function makes the material necessary. The master identity must hold literary, world, product, and collectible applications without collapsing them into one visual genre.
```

## Experiment record

Every generation or design round must create a record with:

```json
{
  "runId": "YYYY-MM-DD-brand-stage-variant",
  "brand": "frankx|gencreator|sis|arcanea",
  "stage": "territory|typography|logo|image-world|application",
  "sourceTruth": [],
  "skills": [],
  "toolAndModel": "",
  "promptPath": "",
  "referencePaths": [],
  "outputPaths": [],
  "deterministicOverlayPath": "",
  "inspectionSurfaces": [],
  "criticVerdict": "advance|revise|restart",
  "founderVerdict": "pending|advance|revise|reject",
  "founderReason": "",
  "nextChange": "",
  "rightsNotes": ""
}
```

Human verdict is a separate field and always outranks the maker's rubric or model score. A rejected direction remains in the ledger so future agents learn from it; it must not remain in active brand packs.
