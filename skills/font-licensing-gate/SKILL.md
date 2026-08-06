---
name: font-licensing-gate
description: "Use when acquiring, selecting, distributing, embedding, self-hosting, or shipping fonts so typography decisions have verified source, files, permitted uses, and production evidence."
---

# Font Licensing Gate

Typography quality and font rights are separate gates. A beautiful pairing cannot ship when its source, files, or allowed use is ambiguous.

## Scope

Use for webfonts, desktop/brand working files, mobile/app embedding, print, video/social exports, PDFs/e-books, variable fonts, icon fonts, wordmarks, and third-party design-file handoff.

This workflow records evidence and risk; it does not provide legal advice. Qualified human/legal review owns interpretation of ambiguous or high-value proprietary EULAs.

## Workflow

1. **Inventory existing use.** Find font files, CSS imports, framework loaders, package dependencies, design tokens, PDFs/decks, logos, screenshots, and brand documents. Record actual family, style, weight, variable axes, format, and locations.
2. **Identify the source.** Record foundry/author, canonical product/page URL, acquisition method/date, account or order reference without secrets, and the exact license/EULA file or URL captured for review.
3. **Inspect files.** Use font metadata tooling where available to record internal family/subfamily, PostScript name, version, copyright, license strings/URLs, supported axes, glyph coverage, and file hash. A font filename is not identity proof.
4. **Map intended uses.** Explicitly classify web self-hosting/CDN, desktop creation, app/software embedding, print, logo/wordmark, social/video raster output, PDF/e-book embedding, client/contractor transfer, modification/subsetting, and redistribution.
5. **Compare rights to use.** Record each use as allowed, restricted, ambiguous, or not reviewed. Do not infer that free download, browser access, repository presence, or a similar family name grants rights.
6. **Choose the implementation.** Select files, subsets, unicode ranges, preload, `font-display`, fallbacks, variable/static instances, and caching/CDN policy. Do not upload proprietary font binaries to public Git unless redistribution is explicitly allowed.
7. **Build specimens.** Use real brand/product copy at desktop and smallest supported phone: headline, longest paragraph, CTA, labels, numerals, punctuation, italics, every weight/style, fallback state, and 200% zoom.
8. **Verify production.** Capture computed fonts, loaded resources, weights, fallback readability, layout shift, reflow, and browser/platform coverage at the exact preview/production URL.
9. **Package evidence.** Store the rights record and specimens beside the brand/release evidence. Store restricted EULA/order material only in an approved private location and reference it without secrets.
10. **Review lifecycle.** Record owner, verifier, approval, acquisition/renewal date, expiry or seat/pageview/app limits when applicable, and next review.

## Required Record

For each family:

```yaml
family: Example Family
foundry_or_author: Example Foundry
source_url: https://example.invalid/font
files:
  - name: ExampleVariable.woff2
    sha256: <sha256>
    version: "1.000"
    axes: [wght, wdth]
license:
  name: Example Web License
  evidence: <private path or canonical URL>
  reviewed_on: YYYY-MM-DD
uses:
  web_self_host: allowed
  desktop_creation: allowed
  app_embedding: ambiguous
  logo_wordmark: reviewed
  social_video_raster: allowed
  redistribution: prohibited
implementation:
  weights: [400, 600, 700]
  preload: [ExampleVariable.woff2]
  fallback: system-ui
owner: <name>
verifier: <different name>
status: approved | blocked | review-required
```

## Hard Stops

- unknown foundry/author or source;
- missing license/EULA evidence;
- family metadata contradicts the claimed font;
- public redistribution is not explicitly allowed;
- unreviewed proprietary app embedding, client transfer, modification, or logo use;
- faux bold/italic or unavailable weight;
- no fallback/mobile specimen or computed-font production proof;
- license limits or renewal state cannot be established.

## Handoff

Once rights are approved, use `typography-art-direction` for voice, hierarchy, pairing, loading, reflow, and accessibility. Keep the approved rights record linked from the brand pack and every flagship release using new fonts.
