# Exact font-file evidence

Collected 2026-09-09 from one pinned Google Fonts distribution commit.

This audit inspects upstream TTFs and their exact metadata/license files. It does not establish that a deployed website, Figma, Canva, PDF, or document uses those bytes. Production approval remains open.

Source: [`google/fonts@334b789e3341`](https://github.com/google/fonts/tree/334b789e33413f3aba4264d9aa6c97f7b94c5a2f).

| Family | Files | Real styles and weights | Sample glyph gaps | Identity checks |
| --- | ---: | --- | --- | --- |
| Inter | 2 | Roman 100–900; Italic 100–900 | None in the six samples | Pass |
| Instrument Sans | 2 | Roman 400–700; Italic 400–700 | None in the six samples | Pass |
| Instrument Serif | 2 | Roman 400; Italic 400 | U+2192 → | Pass |
| Geist | 2 | Roman 100–900; Italic 100–900 | None in the six samples | Pass |
| Geist Mono | 2 | Roman 100–900; Italic 100–900 | None in the six samples | Pass |
| Fraunces | 2 | Roman 100–900; Italic 100–900 | U+2192 → | Pass |
| Newsreader | 2 | Roman 200–800; Italic 200–800 | U+2192 → | Pass |
| Source Serif 4 | 2 | Roman 200–900; Italic 200–900 | None in the six samples | Pass |
| IBM Plex Mono | 14 | Roman 100, 200, 300, 400, 500, 600, 700; Italic 100, 200, 300, 400, 500, 600, 700 | None in the six samples | Pass |
| JetBrains Mono | 2 | Roman 100–800; Italic 100–800 | None in the six samples | Pass |
| Poppins | 18 | Roman 100 (OS/2 250), 200 (OS/2 275), 300, 400, 500, 600, 700, 800, 900; Italic 100 (OS/2 250), 200 (OS/2 275), 300, 400, 500, 600, 700, 800, 900 | U+1E9E ẞ, U+2192 → | declared_weight_supported |
| Playfair Display | 2 | Roman 400–900; Italic 400–900 | None in the six samples | Pass |
| Manrope | 1 | Roman 200–800 | None in the six samples | Pass |
| Bricolage Grotesque | 1 | Roman 200–800 | None in the six samples | Pass |

## What passed

- 54 font files were parsed; hashes, internal names, exact versions, notices, axes and embedding flags are recorded in `font-evidence.json`.
- 54 files have 26 distinct lowercase/uppercase outline pairs at default axes. This is a mechanical check, not proof of attractive lowercase design.
- 30 files cover every codepoint in the English, Dutch, German, French, Spanish and symbol samples. This is sample coverage, not complete language certification.
- Every file was measured at its real default style at 18 px in 288, 358 and 660 px text widths. No synthetic weight or slant was used.
- 0 groups reuse a PostScript name across different file hashes in this acquisition set.

## Specific findings

- Poppins Thin/ThinItalic declare weight 100 in METADATA but contain OS/2 weight 250. ExtraLight/ExtraLightItalic declare 200 but contain 275. Treat those four inconsistencies as review items; do not silently rewrite the font files or infer CSS weight mapping from filenames alone.
- Variable font defaults can differ legitimately from the declared selection weight: Fraunces defaults to 900, Manrope to 200, and Bricolage Grotesque to 800, while all support 400. Set intended axis coordinates explicitly. A supported selection inside the axis range passes; a static mismatch is flagged.
- Manrope and Bricolage Grotesque have no italic source file in this snapshot. Instrument Serif has Roman and italic 400 only. A requested bold Instrument Serif or italic Manrope/Bricolage would need an actual separately verified face; browser synthesis is rejected.
- Instrument Serif, Fraunces and Newsreader lack the tested right arrow. Poppins also lacks the tested capital sharp S. Use a verified icon for arrows and inspect localized copy; never assume automatic fallback is visually acceptable.

## What remains open

- A second reviewer must inspect any failed identity checks and every family’s reserved-name header. OFL conditions and rights decisions are recorded separately in `rights-matrix.md`.
- Google Fonts distribution files are candidates for controlled acquisition. Their hashes do not approve older repository copies, differently versioned app packages, hosted subsets or design-tool fonts.
- Body measurements use Pillow/FreeType, not CSS. Browser shaping, wrapping, fallback state, loading, layout shift, 200% zoom, all supported languages, exported documents and actual Figma/Canva styles still require surface-specific evidence.
- A variable font was inspected for all axes and named instances, but its continuous design space was not exhaustively rendered. Raster specimens show each source file at its defaults; the contact sheet uses real weight 400 when supported.
- The report does not compare quality by file size or rank fonts automatically. Choose roles through rendered comparisons with real product copy.
