---
name: logo-system
description: "Use when creating, refining, validating, exporting, or governing an original logo, wordmark, symbol, lockup family, favicon, or app/social identity system."
---

# Logo System

A final logo is an optically corrected vector system with provenance and small-size proof. Generated images and 3D renders may explore or apply a mark; they are not the master identity.

## Prerequisites

Read the selected identity brief, naming decision, audience/category evidence, anti-references, typography rights, and production surfaces. Stop if the canonical name, owner, or selected direction is unknown.

## Workflow

1. **Inventory before drawing.** Find every existing source mark, export, sketch, generated image, favicon, social avatar, app icon, and lockup. Record path, Git history/source, dimensions, vector/raster state, approval, and use.
2. **Define the job.** State what the mark must signal, where it must work, what category codes it should avoid, and the one memory it may own.
3. **Similarity screen.** Research direct competitors and adjacent marks. Record sources and obvious collision risks. This is a design screen—not legal trademark clearance.
4. **Sketch families.** Explore wordmark, monogram/symbol, combination, and responsive possibilities in black and white before effects. Build geometry/vector paths; do not trace third-party marks or ship text-to-image output.
5. **Select with proof.** Compare at least three materially distinct candidates against meaning, distinctiveness, legibility, small-size survival, one-color use, motion potential, production feasibility, and collision risk.
6. **Refine optically.** Correct spacing, stroke behavior, counters, joins, negative space, baseline, curves, overshoots, and symbol/wordmark balance. Geometry is a starting point, not the verdict.
7. **Build the lockup family.** Required unless a documented surface exception applies:
   - primary and secondary lockups;
   - horizontal and stacked;
   - symbol-only and wordmark-only;
   - monochrome, reverse, and constrained-color versions;
   - small-size/responsive variant;
   - favicon, app icon, social avatar, and OG-safe placement.
8. **Define rules.** Clear space, minimum digital/print sizes, background control, color modes, co-branding, alignment, placement, safe-area, and explicit misuse examples.
9. **Validate exports.** Inspect SVG source and rasterize actual 16, 32, 64, 128, and 512 pixel outputs. Test one-color, grayscale, light/dark, transparent, high/low contrast, square/circle masks, and print-size proof.
10. **Package provenance.** Record creator/tool, source files, selected direction, font source/license, external references, hashes, approval, and export script/version.

## Source And Export Contract

Keep an editable master and reproducible exports:

```text
identity/logo/
  source/
    mark-master.svg
    wordmark-master.svg
    lockup-primary.svg
  exports/
    svg/
    png/16 32 64 128 512 1024/
    social/
    app/
    print/
  specimens/
    small-size.png
    monochrome.png
    background-matrix.png
    misuse.png
  LOGO-SYSTEM.md
  PROVENANCE.json
```

SVG masters must have an explicit `viewBox`, no broken/external asset reference, no embedded secrets/metadata, and predictable color behavior. Preserve live-type source for editing only when the exact font rights are recorded; production wordmark exports should not depend on the end user's font installation.

## Automatic Failure

- final master exists only as raster or generated image;
- copied/traced symbol, stock icon, emoji, or unlicensed glyph;
- no black-and-white proof;
- mark fails at 16px/32px or becomes a different shape when simplified;
- no clear-space/minimum-size rules;
- wordmark font provenance or rights are missing;
- effects, chrome, glow, glass, texture, or 3D are required for recognition;
- no named decision owner, independent verifier, or rollback/source history.

## Output

Return the selected concept, comparison evidence, editable vectors, complete lockup/export matrix, usage rules, small-size/background specimens, provenance, similarity/legal limitations, verifier verdict, and decision-owner approval state.
