---
name: typography-art-direction
description: "Use when selecting, implementing, or reviewing fonts and typography for websites, apps, documents, slides, social graphics, or video. Apply Frank’s sentence-case preference, brand font roles, readable hierarchy, licensing, and rendered-output checks."
---

# Typography Art Direction

Typography is architecture. Choose it after the experience thesis and surface mode,
not from a trend list.

## Frank's standing preference

For Frank's outputs and portfolio brands, apply the preference recorded on
9 September 2026: sentence case, strong real lowercase, readable type, and no
decorative all caps. Apply this before generation across websites, apps,
documents, slides, social graphics, video titles, and chat copy.

- Reject uppercase transformations, small caps, caps-only fonts, widely tracked
  labels, tiny monospaced prose, and synthetic weights or italics.
- Preserve proper names, genuine acronyms, case-sensitive code, verbatim source
  text, and existing wordmark artwork. Do not lowercase everything mechanically.
- Use normal tracking for body and labels; begin sans headings near -0.025em and
  serif headings at 0. Start web body at 16–18px / 1.5–1.7 and long reading at
  18–20px with a 55–75ch measure. Adapt exported media to viewing size.
- ChatGPT controls its interface font. Control casing in chat and actual fonts in
  authored artifacts; never claim to change the chat application's typeface.
- Read the selected brand's typography kit. Existing typography from an unrelated
  template is not brand authority. A user's later explicit direction can change
  a particular design choice.

## Portfolio font roles

This is a dated selection snapshot, not a claim of universal deployment.

| Brand | Direction |
| --- | --- |
| FrankX | Propose Instrument Sans + Instrument Serif for new editorial work; compare with existing Inter + Playfair before flagship migration. Retain Inter in existing technical UI and JetBrains Mono for code. |
| Starlight Intelligence | Instrument Sans for primary text; Newsreader for the kit-based editorial recommendation; IBM Plex Mono for identifiers and code. Recovered kit roles and current web-loader drift are separate evidence; final selection remains owner-scoped. |
| Arcanea | Geist for product/display, Instrument Serif for short accents, Newsreader for dedicated lore reading; scope families by surface. No Cinzel or caps-only fantasy default. |
| GenCreator | Preserve territory: Instrument Sans + Instrument Serif for editorial; Geist + Fraunces for product/editorial accents. Geist Mono is utility only. |

Do not load every brand font on every route. Starlight's inspected Instrument
Serif loader was italic-only and conflicts with the recovered Newsreader kit role;
do not promote that implementation detail into brand-selection authority.
GenCreator's editorial serif loader was normal-only. Reconcile current source
before requesting a missing style.
Canonical authority: `frankxai/starlight-design-intelligence`, `TYPOGRAPHY.md` and
`brand-packs/<brand>/TYPOGRAPHY.md`. Font inventories are evidence, not licenses.

## Required Decisions

- Display role: authority, intimacy, utility, culture, or spectacle.
- Reading role: long-form, conversion, operational UI, or mixed.
- Data role: code, measurements, labels, or none.
- Availability: existing project font, licensed webfont, open font, or owned asset.
- Performance: files, subsets, preload, fallback, and layout-shift control.
- Responsive behavior: measure, wrap, optical size, smallest phone, and zoom.

## Specimen Before Implementation

Show the actual headline, longest paragraph, CTA, names, numerals, punctuation,
italics, every used weight, fallback state, and mobile wrap. Compare at least two
qualified pairings when changing a flagship surface.

The canonical repository's `typography/brand-studio/` provides controlled
comparisons and `scripts/check-typography-specimen.mjs` checks supplied DOM
observations. Use it when actual browser reports are available. Unit tests and
static PDF specimens do not prove browser reflow or design-tool exports; keep
unrun targets explicitly pending.

## Defaults

- Maximum two expressive families plus one mono.
- Never add a family when weight, width, tracking, measure, or composition solves
  the problem.
- Use only licensed files and real styles/weights.
- Record source and license for every new font.
- The type system must remain intentional without color or imagery and readable
  before webfonts load.

## Block Release When

- a font is chosen only because it is fashionable or called “premium”;
- slash-separated alternatives remain unresolved;
- the mobile specimen is missing;
- text clips, wraps accidentally, shifts materially, or loses hierarchy at 200% zoom;
- loading or fallback is untested;
- a new font has no recorded provenance and license;
- decorative all caps, small caps, caps-only typefaces, or wide-tracked labels remain;
- the rendered face differs unintentionally from the declared brand role.
