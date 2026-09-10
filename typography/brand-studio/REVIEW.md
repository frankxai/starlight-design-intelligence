# Independent review: applied brand studio

Reviewed 10 September 2026 by the independent visual verifier.

**Verdict: ready for visual direction review and reproducible tooling handoff.
Not approved for identity adoption or a web release.**

## Evidence inspected

The verifier read the repository instructions, portfolio and three brand
typography standards, typography/editorial/visual/motion gates, source builders,
HTML/CSS/JavaScript and the typography preflight checker. All five pages of the
exported decision PDF were visually inspected after rasterization. The revised
Arcanea and Starlight comparison pages were inspected again after their paired
headings were set to identical sizes and copy.

Reviewed artifact: `Brand-directions-2026-09-10.pdf`, five pages.

SHA-256: `d419db3f3818d31a9bf0a155e31c2d37011b6157646703bb158b1203867dab96`

This PDF was independently typeset with ReportLab using temporary static font
instances at explicit axes. Its raster pages are document proofs, not browser
screenshots or captures of live products. The compiled artifacts are distributed
separately from this source repository.

## Visual findings

| Surface | Observed result | Decision supported |
| --- | --- | --- |
| FrankX editorial | Warm paper, forest ink and the narrow Instrument Serif phrase create a clear editorial hierarchy. The paired headline makes the wider Playfair forms directly comparable. | Instrument Sans + Instrument Serif is a coherent recommendation for the demonstrated editorial surface. It does not imply replacing technical Inter interfaces. |
| Arcanea reading | Newsreader gives the title and original reading passage a consistent narrative role. Geist keeps supporting copy clear. The alternative Instrument Serif title remains visibly distinct at equal size and line breaks. | Prefer Geist + Newsreader for the reading room; reserve Instrument Serif for a separately scoped display surface. |
| Starlight public/editorial | Instrument Sans carries structure and explanation; Newsreader adds a substantial editorial voice. Rows and restrained mono identifiers distinguish the operational role from Arcanea's story reading. | The kit-based Newsreader recommendation is reviewable; the alternate loader family remains a comparison rather than identity authority. |

The inspected pages have readable sentence case, actual lowercase, clear
hierarchy and no observed clipping. Font comparisons preserve the headline copy;
the corrected Arcanea and Starlight pairs also preserve type size. The work is
materially more useful for choosing a direction than a family inventory alone.

The threshold, notebook and horizon graphics are illustrative composition
studies. They do not establish an original approved logo system or prove brand
recognition. No numeric flagship-release score is assigned: the evidence is not
complete enough to pass that gate.

## Independent source and test checks

- Nine font files across seven families and seven distinct OFL notice files were
  independently hashed against `font-manifest.json`; all matched.
- Eight focused preflight tests passed. They exercise rejection of empty or
  malformed evidence, unloaded faces, casing violations, overflow, invalid or
  synthetic type measurements, and CLI failure. The fallback result cannot
  claim primary font loading. These are fixture-based tests, not browser runs.
- The reviewed source disables font synthesis, uses SVG arrows, gives display
  faces explicit roles, and scopes Arcanea's alternate reading face to maintain
  two expressive families per surface.
- Earlier review findings were corrected: the manifest's subset scope, Playfair's
  display role, the Arcanea comparison description, narrow Starlight navigation
  policy, and unequal comparison type sizes.

Repository-wide validation and test results belong to the final delivery receipt;
they were not rerun by this verifier against an intentionally dirty tree.

## Remaining release constraints

The browser security policy rejected the local-file preview. That route was not
retried or bypassed. Browser execution, 320/390/1280 px reflow, actual zoom,
root-text-size behavior, fallback appearance, keyboard interaction and rendered
font identity remain unverified. Source inspection and document rendering cannot
substitute for those observations. The PDF also does not attest Figma, Canva or
desktop installation/export parity, nor a general licensing or trademark
approval.

Complete the declared browser matrix in an authorized development environment,
run the checker on real observations, then test the selected kit's target-tool
exports. A brand owner must select a surface direction before identity adoption.
No production surface or shared Figma style was changed by this review.

Rollback: revert the bounded studio/checker source change. The existing brand
assets and production implementations remain the rollback baseline.
