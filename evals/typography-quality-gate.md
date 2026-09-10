# Typography Quality Gate

Score each item 0, 1, or 2. Release requires **15/16**.

| Item | Passing evidence |
| --- | --- |
| Voice | Roles follow the experience thesis and surface mode |
| Hierarchy | Display, reading, labels, and data are unmistakable |
| Specimens | Actual content shown at desktop and smallest supported phone |
| Provenance | Source, license, files, styles, and weights recorded |
| Loading | Preload/subset/fallback behavior is intentional |
| Reflow | No accidental wrap, clip, orphan, or overflow |
| Accessibility | Readable contrast, zoom, measure, and line height |
| Restraint | Maximum two expressive families plus optional mono |

Automatic failure: unresolved alternatives, faux styles, absent license evidence,
missing mobile specimen, or materially broken fallback.

## Casing and actual typefaces

Automatic failure also includes decorative all-cap headings or labels, small caps,
an all-cap font used to bypass sentence case, wide tracking on ordinary labels,
monospaced prose, unintentional font substitution, or a token that names a font
which does not load. Preserve genuine acronyms, proper names, case-sensitive
code, verbatim sources, and existing wordmark assets.

Inspect the actual rendered text, including pseudo-elements and literal source
strings. A CSS-only search does not detect typed capitals. A source-only search
does not detect uppercase transforms or a caps-only typeface. Never fix this by
lowercasing whole strings or the DOM.

Check the selected brand's `TYPOGRAPHY.md`, loaded styles, a 320px specimen,
200% zoom, long content, and readable fallback before accepting a changed surface.
This remains an evidence-based gate; a written policy alone proves no UI passed.
