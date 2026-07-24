---
name: typography-art-direction
description: "Use when selecting, implementing, or reviewing type for a high-value web surface where font voice, hierarchy, licensing, performance, responsive line breaks, and fallback behavior affect brand quality."
---

# Typography Art Direction

Typography is architecture. Choose it after the experience thesis and surface mode,
not from a trend list.

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
- a new font has no recorded provenance and license.
