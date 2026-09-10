# Font evidence tooling

This script audits a fixed, reviewable Google Fonts distribution revision. It
downloads the exact `METADATA.pb`, `OFL.txt`, and each declared TTF into a cache
outside the repository. It publishes metadata and original measurements, never
font binaries. A successful run means evidence was collected, not that a brand
identity or release is approved.

## Run

Use Python 3.11 or later with `fonttools==4.61.1` and `Pillow==12.3.0`.
For the recorded specimen run, Pillow used FreeType and libraqm; exact runtime
versions are in the JSON. Other renderer versions can produce different pixels.
Calling the reusable file inspector on WOFF2 also needs Brotli (tested with
`brotli==1.1.0`). A WOFF container is decoded in memory for rendering; metadata
and hashes continue to describe the original source bytes.

```sh
python scripts/font-audit/audit.py \
  --cache /tmp/starlight-font-audit-cache \
  --output typography/audits/2026-09-09 \
  --observed-on 2026-09-09 \
  --render-dir /tmp/starlight-font-specimens

python -m unittest discover -s scripts/font-audit -p 'test_*.py'
```

Network access is required only when a source file is absent from the cache.
Do not silently refresh the commit constant when reproducing an older audit.
Use a fresh cache or compare the recorded hashes if cache integrity is uncertain.

## Meaning of the checks

- Internal family and PostScript names are compared with upstream metadata.
  Named-instance labels and all axes are recorded. Static weight classes and
  true italic flags prevent a nonexistent style from being presented as tested.
  The acquisition set is checked for repeated PostScript names across different
  file hashes, which can cause font installation or style-selection collisions.
- All 26 lowercase/uppercase pairs are compared as decomposed outline commands.
  Different glyph IDs alone would miss a caps-only font that repeats outlines.
  The check uses default axes and does not grade aesthetics. Scaled or translated
  uppercase outlines can pass this check, so visually inspect lowercase and
  small-caps behavior separately.
- Six explicit strings exercise English, Dutch, German, French, Spanish,
  numerals and symbols. The report lists exact missing codepoints. This is not
  certification of every character, shaping rule, locale or font feature.
- Pillow measures the same original copy at 18 px across three text widths.
  These measurements are a reproducible renderer check; they are not browser
  reflow, zoom, fallback or layout-shift evidence.
- The optional contact sheet renders Roman 400 at the same size for every
  family. The PDF additionally renders every declared source file at its actual
  defaults. Continuous variation axes are not exhaustively rendered.
- `fsType` is a technical flag. The attached OFL text and copyright/name notices
  remain the licensing evidence. Neither a zero flag nor a download grants
  approval for an unrelated file, trademark or deployment.

Do not replace a consumer's existing font until its exact files, loaded styles,
rights record, target-language samples and surface-specific renders are checked.
