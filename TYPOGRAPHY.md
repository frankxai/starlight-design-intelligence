# Typography standard

Owner: Frank Riemer · Effective instruction: 9 September 2026

Use sentence case and real lowercase letterforms across Frank's portfolio. Build
hierarchy through size, weight, spacing, and composition. This applies to chat
copy, websites, apps, documents, slides, social graphics, and video titles.

## Non-negotiable defaults

- Write headings, navigation, buttons, labels, captions, and badges in sentence
  case. Preserve proper names, genuine acronyms such as AI and API, case-sensitive
  code, and verbatim source material. Do not turn an entire phrase into capitals.
- Do not add `text-transform: uppercase`, Tailwind `uppercase`, small caps, or
  decorative letter spacing to authored interface copy. Do not use an all-cap
  typeface to evade the casing rule. Existing wordmark artwork is an identity
  asset; changing it is a separate design decision.
- Use normal tracking for body and interface text. Start sans headings at
  -0.025em and serif headings at 0; refine against actual letterforms. Avoid
  widely tracked eyebrows and tiny monospaced labels.
- Body copy starts at 16–18 CSS px, reading copy at 18–20px. Use 1.5–1.7 line
  height for prose, 1.15–1.25 for multiline headings, and 55–75 characters for
  reading measure. These are starting tokens, not fixed dimensions for every
  export. Set document and video sizes for their actual viewing distance.
- Use one primary family and, when useful, one editorial family per surface.
  A mono face is optional for code or identifiers. A brand's entire font library
  must not load on every route.
- Use real weights and italics. Never rely on synthetic styles, an unloaded font
  name, a broken webfont request, or a decorative display face for long reading.
- ChatGPT controls the chat interface font. Apply casing and prose discipline in
  chat; specify and verify actual fonts in the artifacts we control.

## Brand decisions

Font selection status is distinct from implementation status. A recorded owner
selection for a named surface governs identity. Kits and dated research establish
source evidence; candidates remain candidates. App loaders and computed fonts
establish implementation evidence, not approval. Resolve conflicts explicitly;
neither the newest draft nor the deployed loader silently replaces a selected kit.
The following directions govern new specimens, not production migrations.

| Brand and surface | Primary | Editorial role | Utility | Status |
| --- | --- | --- | --- | --- |
| FrankX, new editorial and personal surfaces | Instrument Sans | Instrument Serif for short display accents | JetBrains Mono for code only | Recommended direction; compare with existing Inter + Playfair before a flagship migration |
| FrankX, existing technical interfaces | Inter | None by default | JetBrains Mono | Retain until a scoped redesign; Poppins is legacy display compatibility |
| Starlight Intelligence, institutional and product | Instrument Sans | Newsreader for editorial reading and selected display | IBM Plex Mono | Kit-based recommendation from v3 and the v5 candidate; owner selection and application proof remain open. Instrument Serif in the inspected loader and older Manrope tokens are implementation drift |
| Arcanea, product and world navigation | Geist | Instrument Serif, brief narrative display | JetBrains Mono | Matches the current app's principal families |
| Arcanea, sustained book or lore reading | Newsreader | Newsreader | None by default | Present in current app; verify route use and real italic files |
| GenCreator, editorial territory | Instrument Sans | Instrument Serif | Geist Mono | Existing territory in app; preserve territory selection |
| GenCreator, product territory | Geist | Fraunces for occasional editorial display | Geist Mono | Existing alternative territory; never mix both territories on one surface |

Instrument Serif is a display accent, not the book-body default. Newsreader,
Source Serif 4, Crimson Pro, and Lora are reading candidates already represented
in the inspected portfolio. Their presence is not a reason to add another family.
See [font inventory](typography/font-inventory.json) for evidence and status.

## Brand-kit architecture

Keep this standard in `starlight-design-intelligence`; maintain brand-specific
roles in `brand-packs/<brand>/TYPOGRAPHY.md`. Runtime brand packs reference those
files through `sourceDocs`. Preserve each brand's colors, imagery, density,
motion, and product voice in its existing files.

Each kit must name the exact primary, editorial, and utility family; weights and
styles actually loaded; surface-specific sizes and line heights; casing;
tracking; fallback; provenance and rights record; mobile specimen; and owner.
Use one pinned kit revision in each output adapter:

| Adapter | Required behavior |
| --- | --- |
| Next.js and CSS | Semantic type roles map to loaded font variables; reconcile tokens with computed fonts |
| Figma and Canva | Reuse named text styles from the chosen kit; flag unavailable fonts before export |
| Documents and slides | Verify the exported artifact; detect substitutions and clipped text |
| Social and video | Typeset exact copy in a controlled layer; inspect at phone viewing size |
| Image generation | Pass exact sentence-case copy; inspect lettering; use a typeset overlay when exact font identity matters |
| Agent skills and plugins | Read the kit before generation and the typography gate before handoff |

Treat fonts as part of the kit, alongside logo variants, colors and contrast
pairs, spacing, image direction, motion, voice, and reusable templates. Keep
licensed binaries with their exact notices; do not infer rights from a filename.
New brand kits inherit the casing and quality rules, then define their own voice.

## Verification and adoption

The [specimen](typography/specimen.html) compares selected directions with real
lowercase, long copy, buttons, names, punctuation, numerals, and mobile wrapping.
It is a proposal specimen, not evidence that a production site uses those fonts.

Before releasing a changed surface, inspect desktop and the smallest supported
phone, 200% zoom, font-loading failure, actual loaded faces, contrast, and long
content. Search both CSS transformations and literal all-cap copy. Preserve
acronyms and source text; never lowercase the entire DOM to hide a failure.

Use [the typography gate](evals/typography-quality-gate.md). Add this concise
instruction to downstream `AGENTS.md` and the equivalent harness entrypoint:

> Before creating or changing visual output, read the pinned portfolio typography
> standard and the selected brand's TYPOGRAPHY.md. Use sentence case, actual
> loaded fonts, and the brand's semantic type roles. Reject decorative all caps,
> small caps, wide tracking, faux styles, and unverified fallback. Inspect the
> rendered output before handoff.

Pinned older releases do not update themselves. Upgrade each consumer through a
reviewable change, including its existing design-contract digest and workflow pin
where applicable. Record the repository, revision, surface, and verification
result. Installed skills improve future generation; they cannot guarantee that
every unrelated chat loads the policy or that an older site is already fixed.

## Exact-file evidence and kit architecture

Use [the font audit tooling](scripts/font-audit/README.md) for reproducible
metadata, outline, glyph and license-source inspection. The
[9 September evidence](typography/audits/2026-09-09/README.md) covers 54 upstream
font files across 14 families; it does not approve differently versioned app,
desktop, Figma or Canva copies. Inventory those actual bytes independently.

Follow [the brand-kit architecture decision](portfolio/brand-kit-architecture.md)
before creating another repository or treating a design-tool kit as canonical.
Use [the release manifest contract](portfolio/brand-kit-release-contract.md) to
record selected files, text roles, assets, owner decisions and adapter evidence.
The [top-100 benchmark](observatory/benchmarks/2026-09-09/identity-evolution.md)
separates source-verified identity cases from indexed brands and website CSS
observations. Reference-brand typography never overrides the sentence-case rule.

Use the [applied brand studio](typography/brand-studio/README.md) to compare actual content and run its supplied-observation preflight. Its static PDF review is distinct from the browser and design-tool checks that remain pending.
