# Arcanea source authority and identity gaps

Observed 2026-10-03 for the estate design-quality task. This is a source and asset
audit, with a correction to shared guidance. It makes no new identity selection,
rights grant, font deployment, product redesign or production acceptance claim.

## Owning sources

Registry main `fdd0233cbbd384596981d542ae6b500b798e06d6` identifies this repository
as canonical for shared design protocol/brand packs and `frankxai/arcanea-ai-app`
as Arcanea's primary product experience. Product source below is its verified
main `79f3fb25ca8d34c22eae1210c7c92ae2ebe8ea0b`, independent of the local Gemini
worktree. These main blobs were read directly.

| Product path | Git blob | SHA-256 |
| --- | --- | --- |
| `AGENTS.md` | `9a562253a6143cc6575d865912511677d891cb99` | `c1601d99f1344d3ceceff67603b063d645bf6974b4b7ef28a775ae30d1f3a8f4` |
| `TASTE.md` | `da507071a23b27fd25e789ced585777de5ddfeb7` | `f92102020196807734aff83838bbdb5d22241e918e90aea6b67f9d31a352b344` |
| `DESIGN.md` | `bae69326598564e645df5c3b8da029e696d42fc9` | `dbbb7acbb5f211e300ea764518f1ce42ad1f7acfa792661b050bc64cf4d2baba` |
| `packages/design-system/src/tokens.ts` | `1ac80c11973930f7289b9b4058424ecb5b2a3916` | `004bfa6e720076614cb6dd31a5f3232092dfde0893af3935cf81217865fcfec6` |

The product contract names its local visual sources and token package. Its
`TASTE.md` gives curatorial judgment precedence when tokens and taste disagree.
Geist display/body, Instrument Serif editorial and Geist Mono code roles are
declared in both the contract and token source. Teal, blue and gold values agree
between `TASTE.md` and code; aquamarine is an additional package token. Exact
files, rights and rendered-font evidence are unverified.

## Unresolved source conflicts

- `TASTE.md` asks for restrained product chrome; the older `DESIGN.md` forbids
  flat vectors/ordinary flat UI and describes a cinematic gold interface.
- Backgrounds differ: taste `#09090b`, `cosmic.void` token `#0b0e14`, cinematic
  design `#05070f`. Shared guidance records the conflict and chooses no new value.
- `AGENTS.md` names both v0.2.0 and v0.3.0 of the design package; taste also records
  a dated incomplete integration. Neither prose nor package presence proves current
  app adoption, computed styles or a released package version.
- `AGENTS.md` and `TASTE.md` describe the root `DESIGN.md` as a machine-readable
  schema with YAML frontmatter. The pinned file is cinematic Markdown guidance
  without that frontmatter. Its claimed format is not runtime token evidence.
- The old product `DESIGN.md` still recommends a Higgsfield pipeline. Frank's
  current explicit prohibition governs execution. The source remains intact;
  this shared correction removes that recommendation from its active guidance.

Product-source reconciliation belongs in an owned product lane. Check newer
planning decisions, current code and actual desktop/mobile states before making
an application change. This shared audit does not override locked canon.

## Actual identity observations

| Product path | Source blob | Observation and acceptance limit |
| --- | --- | --- |
| `apps/web/assets/brand/arcanea-mark.jpg` | `b64c3835bb350d647d4585e91fc2be86af1d2129` | Viewed existing 784×1168 raster: a metallic angular A, wordmark, glow and dark scene in one portrait composition. Product taste/imports select this application. It establishes no editable vector master, monochrome or favicon-scale result. |
| `apps/web/public/brand/arcanea-logo.svg` | `36619b597d9057aad7a9fe1de90367e57b68e6ac` | Source inspected: 40×40 angular A with gradients, painted inner facet and highlights. A monochrome export/counter and optical small-size proof were not inspected. |
| `apps/web/public/brand/arcanea-wordmark.svg` | `8a1492532b5e85432963e1f66618084388b21109` | Source inspected: 168×40 rounded arch/crossbar symbol, aquamarine/violet gradients and live system-font text. Symbol geometry differs from the angular asset; text rendering depends on the recipient's fonts. No source-selected vector family or font rights is proved. |

The raster SHA-256 is
`b6d340166a44da32e1ce0f8e11c9e68423ae182c6fb95010ef337c3b7e4e0cf0`.
All three asset bytes match the pinned main blobs. No companion visual-generation
sidecar was found beside these existing files. No historical prompt or approval was
invented. The raster was viewed; the SVG observations are source inspection and
do not replace rendered, small-size or independent visual verification.

Retain the current product application and all earlier assets. Before rebuilding,
resolve the selected symbol/wordmark source, reconstruct an original editable
vector family, record font/asset rights, and inspect actual 16/32/64/128/512 outputs,
monochrome/reverse, backgrounds, masks and application placements. Independent
visual verification and named-owner approval remain required. This audit approves
no replacement, changes no product asset and performs no legal clearance.

## Consumer boundary

The runtime pack lists declared roles and agreed accent references. Its family
and color metadata is guidance. It does not establish deployed fonts, product token
integration, usable navigation, native harness use or enforcement of this audit.
New product adoption needs an owner-approved pin/update, actual application QA
and the existing release evidence. The full estate goal and its tracking issue
remain open.
