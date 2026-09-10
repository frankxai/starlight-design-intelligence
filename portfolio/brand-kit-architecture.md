# Brand-kit architecture and research decision

Decision date: 9 September 2026. Status: proposed implementation, no identity migration approved.

## Repository decision

Keep `starlight-design-intelligence` as the design authority. Improve the existing packs, observatory, rights records and adapters. Do not create one repository per reference brand, font candidate, Figma file or Canva kit.

| Location | Owns | Release boundary |
| --- | --- | --- |
| Agentic Ops registry | Brand identity, lifecycle, parent/child relationships and product ownership | Registration does not mean the visual kit is approved. |
| This repository | Brand rules, semantic tokens, approved-source references, schemas, quality gates and normalized research | Pin a revision; distinguish proposals, selected candidates and released kits. |
| Existing product repositories | Code, actual font loaders, components and implementation evidence | Compare implementation with the pinned brand pack. |
| Figma, one library per active master brand | Editable vector construction, variables, text styles, components and design review | Publish only approved revisions; experiments live in clearly separate drafts. |
| Canva, one Brand Kit per approved active master brand | Channel templates, decks and reusable publishing layouts | Template fonts and logo revisions must map to the kit manifest. |
| Private rights/evidence store | Contracts, restricted EULAs, original research captures and unpublished identity decisions | Public Git contains permitted normalized facts and hashes, not restricted originals. |

Create a dedicated repository only when there is a real independent release or access boundary: a distributable font with its own build/test/releases, a licensed icon library, a separately owned client brand, or a product component package with its own consumers. A distinct visual identity alone is not sufficient. Such a repository consumes this quality contract; it does not become a second portfolio authority.

Do not duplicate a brand for every domain, campaign, capability or channel. Reconcile the registry and existing packs before generating new kits. Packs such as `sis` and `starlight-technology` need explicit parent/surface relationships; `ai-coe` needs naming reconciliation. A folder's presence is not an approval record.

## The kit is a versioned contract

Every production kit needs the following linked evidence. Unknown fields remain unknown; a generated board or ZIP is not sufficient evidence of approval.

1. Brand ID, audience, positioning, parent relationship, owner, selected territory, revision, and approval status.
2. Font roles and exact source files: family, style, weight, axes, version, hash, license, permitted uses, fallbacks and language scope.
3. Wordmark, compact mark and lockups: editable original, outlined distribution master, monochrome/reverse variants, optical size rules and provenance.
4. Color, spacing, typography and motion tokens; UI icons, diagrams, imagery, character and sonic rules where relevant.
5. Figma and Canva role mappings, reusable examples, brand voice and sentence-case rules.
6. Application evidence: desktop, smallest phone, long copy, localization, numerals, real italics, unavailable-font fallback, reduced motion and actual 200% browser zoom.
7. Rights and delivery manifest: owned/reference/licensed classification, redistributable files, restrictions, owner approvals, export hashes, version and retirement rules.

Use one primary text family plus a purposeful editorial role per surface, and a technical mono only where needed. Preserve real lowercase, proper names and acronyms. No decorative uppercase transformations, small caps, exaggerated tracking or synthetic font styles. A reference brand's use of uppercase never overrides this preference.

## Font and logo investment

| Route | Appropriate trigger | Required evidence |
| --- | --- | --- |
| Existing open or retail type | Meets reading, language and identity needs | Exact files, license scope, real-content specimens and deployment proof. |
| Custom lettering/wordmark and original symbol | Stable name and a clear memory mechanism | Three genuinely distinct candidates, editable vectors, optical proofs, unfamiliar-reader evidence, similarity screen and owner selection. |
| Authorized font modification | Specific gaps in an otherwise suitable family | Modification permission, reserved-name handling, shaping/spacing regression tests and new version provenance. |
| Full custom font family | Repeated functional/identity need that existing type cannot meet | Written glyph/script/style specification, source ownership or license, engineering plan, deployment rights and maintenance budget. |

A wordmark is a bounded lettering project. A text font adds complete glyph coverage, spacing, kerning, shaping, hinting, variations, file engineering and maintenance. Commission the latter only against a demonstrated need. A font license does not clear a brand name or mark.

Brand symbols and UI icons have different jobs. Keep a full-name lockup until recognition tests justify a symbol-only application. Use the approved icon library for UI; do not turn every feature into a new identity mark. Native platform symbols and third-party company logos require their own usage permissions.

## Research protocol

The new [cohort](../observatory/benchmarks/2026-09-09/top-100-cohort.json) is Kantar BrandZ's 2026 global top 100. It is a brand-value cohort, not a design-quality leaderboard. The [identity evolution study](../observatory/benchmarks/2026-09-09/identity-evolution.md) records primary evidence and gaps separately. A successful homepage fetch does not establish current visual identity, approved type or licensing.

Preserve the existing 17-target observatory wave. It contains 85 surface manifests; four captures failed, the recorded viewport is 1363 × 936, and the intended exact viewport suite/private capture storage remain pending. This is useful research, not a completed responsive audit.

Use Refero for interface discovery, Mobbin for flows and application patterns, official brand hubs for identity rules, foundries for font evidence, and official dated case studies for evolution. A gallery, downloadable logo, or CSS declaration is a lead; it does not grant rights. Brandfetch can help locate assets, but official provenance and allowed-use review still control adoption. Do not infer a subscription or installed integration from a public product page.

## Next bounded implementation

1. Reconcile the latest approved/candidate research with registry and central pack roles.
2. Resolve the shared Figma uppercase-style defect through a reviewed style change. Proposed values: original case, 14 px text, 20 px line height, 0% tracking. The attempted shared-style edit was blocked by automatic approval review because of downstream dependency impact; no change was made.
3. Complete font selection on actual flagship content, then map approved roles into Figma and Canva. Figma quota limits and Canva's limited font-family metadata must remain explicit evidence gaps.
4. Reconcile existing mark families before drawing replacements. Retain proposals and historical masters without declaring them approved.
5. Release one complete pilot kit with fonts, marks, tokens, source references, five real channel templates and deterministic proof fixtures. Use its manifest format for the remaining brands.

No new repositories, font purchases, custom-family commissions, production font migrations or public identity releases are enacted by this document.
