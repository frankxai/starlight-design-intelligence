# GenCreator source authority

Reconciled 2026-10-03. The owning product is `frankxai/gencreator.ai`.
These references use its verified main revision
`1ca14c197830d577c4d290535b9fe10ef089edbd`, rather than an agent's working tree.

| Source | Git blob | Evidence |
|---|---|---|
| [docs/DECISIONS.md, ADR-011](https://github.com/frankxai/gencreator.ai/blob/1ca14c197830d577c4d290535b9fe10ef089edbd/docs/DECISIONS.md) | `02ef5c0601bdde94079b5271ba0db5afeb47b324` | Territory B accepted on 2026-08-22, decided by Frank; scoped migration; gates 7 and 8 remain open |
| [docs/brand/GENCREATOR_BRAND_SYSTEM.md](https://github.com/frankxai/gencreator.ai/blob/1ca14c197830d577c4d290535b9fe10ef089edbd/docs/brand/GENCREATOR_BRAND_SYSTEM.md) | `4c3afb8981823a516c37b8a8b2f7ede1ea96f65a` | Foundation v3; paper/ink/red, Instrument fonts, wordmark selection pending, rollout gates |
| [identity-manifest.json](https://github.com/frankxai/gencreator.ai/blob/1ca14c197830d577c4d290535b9fe10ef089edbd/docs/brand/explorations/2026-08-27-identity-core/identity-manifest.json) | `ef8fff3d0f7623a6f6531022e10fd375194ad88d` | Territory approved; breadth, anonymous review and production unapproved; legal review not started; runtime assets unchanged |

## Resolution

The [prior shared pack](https://github.com/frankxai/starlight-design-intelligence/blob/f90a3a31f4dca5feafd9f9f427848ec42330fe3f/brand-image-system/runtime/brands/gencreator/brand-pack.json),
updated 2026-09-02, is Git blob `0e60722b7cac5a867d221b1395548eaaf7643d2e`.
Its green action palette and catalog ladder conflict with
the product's accepted identity and brand kernel. The owning product's accepted
decision takes precedence for these facts. This pack now carries its Territory B
colors, font roles and authorship direction. It preserves the existing adoption
mode IDs and both canonical repositories.

The August reset's GenCreator territory gate is satisfied at gate 6 by ADR-011.
That decision explicitly leaves the Territory B application quartet, gate 7 image
world and gate 8 family scale pending. The old reset program is absent from current
kernel baseline `f90a3a31f4dca5feafd9f9f427848ec42330fe3f` (its Git tree has no
`brand-image-system/foundation-reset/` entries). This reconciliation records
GenCreator's status here and in its
runtime pack without recreating other brands' stale reset states.

## Font source evidence

The owning product revision above pins the following files under
`docs/brand/explorations/2026-08-27-identity-core/fonts/`. The font SHA-256 values
were checked against the actual files and the pinned Git contents. These identify
the exploration fonts; they do not establish which files a deployed page uses.

| File | Git blob | SHA-256 for font files |
|---|---|---|
| `InstrumentSans[wdth,wght].ttf` | `3589b81b22d3defc725dfdcdf16b5da7c9adc691` | `b24f1812584816958afcf22e22d08e44318c5e51651e25d2438efddde389b33b1` |
| `InstrumentSerif-Regular.otf` | `1f0366b115a935d2e6c9109e56d76522766eb9da` | `8299613dc56e9530d6a416cf8b9b24c209457f9ea66a7c118a024c7714c01cd6` |
| `InstrumentSerif-Italic.otf` | `d2dba206264a3ebb387c9f65b39e79a6d55cf5b1` | `6d9d11705e3e81be42696d2d4be56f551ae29bcba41ed10c7d9a2d725859b874` |
| `OFL-Instrument-Sans.txt` | `d41633cc1209e83ba21211954b1b9f356758e5e6` | License file |
| `OFL-Instrument-Serif.txt` | `e1801b959d17c62ffc42ed6ca650328e1a2f95d2` | License file |

Both local license texts identify OFL 1.1, consistent with the official
[Instrument Sans license](https://github.com/Instrument/instrument-sans/blob/master/OFL.txt)
and [Instrument Serif license](https://github.com/Instrument/instrument-serif/blob/main/OFL.txt)
read on 2026-10-03. An upstream font snapshot commit was not recorded by the
exploration; the owning product commit and the concrete blob/hash identify the
files verified here. Preserve license notices when distributing fonts. Font
licensing does not approve a wordmark or provide trademark clearance.

## Approval limits

This is evidence of the approval recorded in the owning product's decision log,
not a new founder verdict. No wordmark mechanism or symbol is approved. Do not
turn a model preference, a readable outline, a font license or a runtime filename
into identity approval. Similarity screening is not legal clearance.

The product names [this Figma file](https://www.figma.com/design/rQRcBL1Kg5TMzEYa5TO9On)
as its editable destination. A read on 2026-10-03 found one empty page, `0:1`.
Access now succeeds; native identity construction and selection remain unfinished.
The existing shortlisted raster proofs are review artifacts, not populated Figma
masters. Rebuild the selected survivor after human selection, with small-size,
inverse, crop, reading and recall proof before rollout.

Pack loading and SHA validation establish source consistency only. Existing
validators do not verify that a human approved a wordmark, that these fonts
rendered, or that a downstream surface migrated. Downstream pins stay unchanged
until an owning repository adopts this revision and verifies its application.
