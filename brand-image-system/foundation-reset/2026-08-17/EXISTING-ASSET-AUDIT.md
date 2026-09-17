# Existing identity asset audit

Status: discovery complete; founder approval still required for every surviving seed.

## Method and limits

This audit inspected the actual local SVG source, raster exports, font declarations, brand tokens, and representative application files for FrankX, GenCreator, Starlight Intelligence, and Arcanea. It distinguishes a useful seed from an approved identity.

The machine performance gate returned `HOLD` for browser QA during this pass, so no live-site or responsive-browser claim is made here. Raster files were visually inspected directly; SVGs were inspected from their source geometry and declarations.

## Decision language

- **Keep** means preserve as source material or production infrastructure.
- **Rework** means the idea may enter a new exploration but the current execution is not approved.
- **Retire** means it must not be used as identity truth or as an unchallenged reference.
- **Unresolved** means a founder or naming decision is required before design proceeds.

## Portfolio finding

Some good work exists, but mostly below the logo layer. The reusable value is in canon, narrative, material cues, selected typography experiments, file discipline, and product proof. None of the four current primary marks is ready to anchor the rebuilt portfolio.

The shared failure is not simply “bad logos.” It is premature convergence on a generic AI vocabulary: dark grounds, cyan or gold light, gradients, sparkles, loops, robots, portals, glass panels, monospaced labels, and interface chrome. That vocabulary erased the emotional and commercial difference between the brands.

## FrankX

### Keep

- The name and founder-led premise: a human practitioner making complex intelligence useful.
- The warmer editorial direction demonstrated by the Cormorant Garamond and Lora pairing in `app/year-of-the-fire-horse/layout.tsx`, as a specimen candidate only.
- Existing product proof, writing, teaching, workshop, and founder material as the source for the image world.
- Existing asset provenance and export locations as migration inputs.

### Rework

- The wordmark from first principles, beginning with the written name and its rhythm rather than a forced icon.
- The role of the `X`. It may become a distinctive typographic event, but must not default to crossing beams, chevrons, or “connection” symbolism.
- Typography through comparative specimens. The editorial pair is promising for warmth, but has not yet proved it can cover product UI, technical writing, navigation, and small sizes.

### Retire

- `public/images/brand/logo-full-v2.png` and `logo-mark-v2.png` as identity masters. The cyan F, attached sparkle, and chevron-like X read as generic AI/software branding.
- The competing geometric, wave, crystal, and minimal mark concepts in `components/ui/LogoMark.tsx` as canonical options.
- `data/brand-visual-dna.json` as a creative brief. Its dark canvas, emerald/violet/cyan palette, glass, volumetric light, and “premium futuristic” defaults reproduce the rejected house style.

### Unresolved

- Whether the master identity should be a pure wordmark, a founder signature system, or a wordmark with one restrained shorthand mark.
- Whether FrankX should feel primarily editorial, workshop-like, or architectural. This must be decided through black-and-white application tests, not adjectives.

## GenCreator

### Keep

- The vector-first production discipline in `public/brand`: separate mark, mono mark, wordmark, icon sheet, and social template sheet.
- The existence of a true one-color asset. This is the right logo-development constraint even though the current symbol is not approved.
- The consistent icon stroke system as infrastructure that can be redrawn after the identity is selected.
- Fraunces as one typography candidate worth testing against real GenCreator language; it is not pre-approved.

### Rework

- The wordmark and tagline hierarchy.
- The idea of creation as a visible process. Preserve the behavioral idea—raw material becoming finished work—without preserving the current loop-arrow symbol.
- The icon family after a new formal grammar is selected.

### Retire

- `public/brand/gencreator-mark.svg` as the final symbol. The gradient circular G/arrow inside a dark rounded square is category-generic.
- The cyan/blue/green gradient as a default identity device.
- The dark SaaS shell, glow, pill navigation, uppercase microcopy, and gradient headline language visible in the current local screenshots.
- The existing “Creator intelligence OS” lockup until positioning and naming are deliberately approved.

### Unresolved

- Whether GenCreator needs a symbol at all or whether a flexible wordmark plus studio stamp is stronger.
- Whether the public promise is a creator operating system, a studio, a launch platform, or an education/product family. Identity cannot solve an unresolved category.

## Starlight Intelligence / SIS

### Keep

- The strategic language of human authority, receipts, evidence, memory, governance, portability, and reversible decisions.
- Source Serif 4 as a serious candidate for institutional/editorial authority.
- The warmer mineral spectrum—paper, stone, restrained amber, graphite—as a territory seed. It feels more human and credible than a neon future aesthetic.
- The idea of an open, inspectable standard rather than an opaque autonomous machine.

### Rework

- Manrope as support type only if it wins a real specimen comparison.
- The serif/sans relationship and page hierarchy, reducing the large amount of IBM Plex Mono.
- The generated material world. Archive, proof, measurement, and human decision can survive; the robot cast should not define the company.
- The name architecture between “Starlight Intelligence,” “Starlight Intelligence Systems,” and “SIS.” Lock this before final wordmark work.

### Retire

- The CSS-only italic `S` inside a circle in `components/site-header.tsx` as a logo.
- Generic polished robots, glowing eyes, agent mascots, command corridors, and sci-fi laboratories as primary corporate identity.
- Monospaced labels, status pills, uppercase asset labels, cyan grid overlays, and dashboard telemetry used as marketing decoration.

### Unresolved

- Master name and abbreviation hierarchy.
- Whether the identity should feel like a standards institution, a high-trust applied intelligence company, or a protocol steward. The system can serve all three, but one must lead.

## Arcanea

### Keep

- The locked canon in `arcanea-ai-app/.arcanea/lore/CANON_LOCKED.md` as the non-negotiable source of identity meaning.
- The Lumina/Nero duality, ten-gate structure, elemental materials, living records, thresholds, and codex logic as a deep proprietary vocabulary.
- The best artifact cinematography as an image-world seed: physical objects, inscriptions, chambers, maps, archives, and materials that perform a canonical function.
- The gold crystalline A only as an exploratory sketch whose geometry may be studied; it is not an approved mark.

### Rework

- One wordmark and one symbol system derived from canon, redrawn in one color before any material render.
- A coherent relationship between literary publishing, world imagery, game/product UI, and collectible objects.
- Typography from a deliberately limited specimen set. The current font inventory is too broad to constitute a system.

### Retire

- The mint-purple arch/A in `apps/web/public/brand/arcanea-wordmark.svg`.
- System-ui or Geist as a default “canonical” identity voice without a comparative proof.
- The current mixture of polished dark relics, teal fantasy portals, giant chrome A renders, generic crystalline magic, and pixel-game collectibles as one undifferentiated master brand.
- Portals, crystals, glowing runes, gold-on-black prestige, and cosmic fog when they are decorative rather than tied to a specific canonical function.

### Unresolved

- Whether the primary mark is inscriptional, editorial, heraldic, or architectural. Canon can support all four, so the application system must decide.
- The exact boundary between the master Arcanea identity and sub-world/product visual languages.

## What is genuinely worth saving

| Brand | Best surviving seed | Why it matters | Status |
|---|---|---|---|
| FrankX | Human/founder perspective and warmer editorial typography | It can make the brand feel authored rather than generated | Specimen candidate |
| GenCreator | Vector packaging and mono-first asset discipline | It is the strongest production foundation in the portfolio | Keep infrastructure |
| SIS | Human authority/proof language, Source Serif, warm mineral materiality | It can communicate high trust without science-fiction theater | Territory seed |
| Arcanea | Locked canon and functional material cosmology | It is proprietary and deep enough to generate a real identity world | Protect and translate |

## Immediate decision

Do not commission polished logo renders yet. Create two black-and-white, type-led territory boards per brand. Each board must contain the real name, two real product titles, one two-line promise, a paragraph, numbers, navigation, and three small application crops. Select or reject the territories before symbols, palettes, imagery, motion, or large asset batches are produced.
