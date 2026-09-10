# Applied brand studio

Status: review candidate, 10 September 2026. This closes the gap between a font
inventory and a visible brand decision. It does not claim a production release.

## Decisions under review

| Surface | Recommended pairing | Controlled alternative |
| --- | --- | --- |
| FrankX editorial | Instrument Sans + Instrument Serif | Inter + Playfair Display |
| Arcanea reading room | Geist + Newsreader | Geist body + short Instrument Serif display |
| Starlight public/editorial | Instrument Sans + Newsreader; IBM Plex Mono for identifiers | Instrument Sans + short Instrument Serif display; same mono role |

Instrument Serif and Playfair Display are short display choices here. Neither is
the sustained-reading default. Starlight's recommendation follows the recovered
kit role; its inspected loader is implementation evidence, not identity approval.
Existing technical FrankX surfaces retain Inter until a scoped migration.

The specimens use original copy, colors and composition derived from the current
brand packs. Threshold and horizon geometry are illustrative studies, not new
approved logos or product claims. No competitor assets or private source kits
are embedded in the repository.

## Build the review exports

Use Python 3.12+ for the builders. HTML uses the standard library; the separate
PDF renderer uses ReportLab and fontTools. Keep caches and compiled exports
outside this repository.

```sh
python3 typography/brand-studio/acquire.py --cache ../brand-studio-cache
python3 typography/brand-studio/build.py --cache ../brand-studio-cache --out ../deliverables/Brand-studio-2026-09-10.html
python3 typography/brand-studio/build_review_pdf.py --cache ../brand-studio-cache --out ../deliverables/Brand-directions-2026-09-10.pdf
```

`font-manifest.json` pins nine unchanged source files across seven families and
their seven exact OFL notices. Both builders reject a font or license digest
mismatch. The HTML embeds all required bytes and notices for offline use; each
specimen declares only its selected normal faces. The PDF creates temporary
static instances at explicit weights/axes with distinct proof names for embedding.
Those instances are not distributed as font software. PDF appearance is not a
claim that a browser renders the same layout.

## Interactive comparison

The exported HTML includes three brands, two pairings per brand, 320/390/1280 px
iframe viewports, font-fallback mode, a root text-size stress control and custom
headline input. It preserves copy and layout while switching type roles. The
outer chrome uses system type. Casing exceptions preserve real brand names and
acronyms; source strings are not mechanically lowercased.

Fallback mode creates a new frame without webfont declarations. A separate
export can permanently omit all font bytes for an unavailable-font check:

```sh
python3 typography/brand-studio/build.py --cache ../brand-studio-cache --out ../deliverables/Brand-studio-fallback-test.html --fallback
```

The 200% control changes root text size with responsive rules. It is not an
assertion of actual browser zoom. Frame viewport geometry and font-face loading
are reported in the visible preflight panel when the viewer executes.

## Executable gate

Save the visible JSON preflight data from a verified browser session, then run:

```sh
node scripts/check-typography-specimen.mjs specimen-report.json
node --test tests/check-typography-specimen.test.mjs
```

The checker rejects empty evidence, missing expected font-load records,
decorative literal/transformed capitals, caps variants, wide tracking, synthetic
styles, sub-14px text, invalid measurements and horizontal overflow. Fallback
passes are explicitly distinct from primary font-load passes. Exact source/mark
exceptions are explicit strings rather than blanket uppercase exemptions.

This checker validates supplied DOM observations. It cannot establish a rendered
glyph's font identity, unseen content, OS installation, licensing, browser zoom,
Figma/Canva parity, or compliance across all applications. Its unit tests are not
browser observations. The wider [release manifest contract](../../portfolio/brand-kit-release-contract.md)
is still a proposed format; this preflight is not its implementation.

## Verification boundary and next action

The local-file browser preview was rejected by the browser security policy. No
alternate browser, CDP, hosted copy or other workaround was used. Therefore
browser interactions, responsive layout, fallback appearance and text-resize
remain unverified. The static five-page PDF was rendered with Poppler and
visually inspected independently. Read [the review](REVIEW.md) for the verdict.

Complete the declared browser matrix in an authorized development environment,
then run the preflight on those real reports. After a brand owner selects the
surface direction, validate actual Figma/Canva exports and product integration.
No new repository, shared-style mutation, font purchase or identity promotion is
part of this review change. Rollback is a revert of the bounded source change.
