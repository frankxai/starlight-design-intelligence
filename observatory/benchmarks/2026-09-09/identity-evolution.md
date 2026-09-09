# Identity evolution and typography benchmark

Observed 9 September 2026. Companion data: [identity-evolution.json](identity-evolution.json).
Cohort: [Kantar BrandZ Most Valuable Global Brands 2026](https://www.kantar.com/campaigns/brandz/global).

This pass reviewed primary sources for **11 of the 100 cohort brands**, plus **two supplemental cases**. Eleven cases document a dated change, project period or continuity; Apple and NVIDIA provide current guidance only. Five additional brands have explicit evidence gaps. This is not a completed 100-brand design audit, a font-file license audit, or a claim that brand value measures design quality.

The sources are corporate guides and accounts from commissioned designers or foundries. Their descriptions establish what they designed and intended; they do not independently prove business impact or complete live adoption. A project date range is not a single launch date.

| Brand | Verified change or practice | Implication for our kits |
| --- | --- | --- |
| Google, rank 1 | 2015 identity expanded into role-specific typography; Sans/Flex became open source in 2025. [Google Design](https://design.google/library/google-sans-flex-font) | Separate wordmark, display, reading and code requirements. |
| Apple, rank 2 | Size-sensitive typography and text-aligned symbol weights form a platform system. [Fonts](https://developer.apple.com/fonts/), [symbols](https://developer.apple.com/sf-symbols/) | Use optical testing and native platform behavior; platform assets need their own permissions. |
| Microsoft, rank 3 | 2023 Calibri-to-Aptos selection followed commissioned candidates and user feedback. [Microsoft Design](https://microsoft.design/articles/a-change-of-typeface-microsoft-s-new-default-font-has-arrived/) | Test real documents before changing defaults. |
| Amazon, rank 4 | 2025 Ember Modern and a shared identity system address fragmented applications and sub-brands. [Koto](https://koto.com/projects/amazon) | Define shared foundations and intentional brand variation. |
| NVIDIA, rank 5 | Public rules preserve exact lockups, spacing and approved variants. [NVIDIA](https://www.nvidia.com/en-us/about-nvidia/legal-info/logo-brand-usage/) | Specify permitted use and retirement rules, beyond providing SVGs. |
| McDonald's, rank 10 | 2017–18 work connects arches-derived type with a global guidance hub. [Turner Duckworth](https://turnerduckworth.com/work/mcdonalds) | Connect symbols, type, physical environments and templates through one owned motif. |
| Mastercard, rank 12 | FF Mark supports the system; 2019 symbol-only use followed measured recognition. [Pentagram](https://www.pentagram.com/work/mastercard/story), [Mastercard](https://www.mastercard.com/us/en/news-and-trends/press/2019/january/mastercard-evolves-its-brand-mark-by-dropping-its-name.html) | A licensed family can work; retain our names until recognition justifies otherwise. |
| IBM, rank 16 | The 1972 mark persists with distinct positive/reversed artwork; Plex is openly licensed. [Logo guide](https://www.ibm.com/design/language/ibm-logos/8-bar/), [type guide](https://www.ibm.com/design/language/typography/typeface/) | Preserve successful identity while improving implementation and optical quality. |
| Netflix, rank 17 | A 2017–2023 custom-family project spans billboard and subtitle needs. [Dalton Maag](https://www.daltonmaag.com/portfolio/custom-fonts/netflix-sans.html) | Specify the smallest and largest real use cases together. |
| Coca-Cola, rank 20 | Its distinctive bottle dates to 1915–16; later applications use a reduced asset vocabulary. [Company history](https://www.coca-colacompany.com/about-us/history/the-history-of-the-coca-cola-contour-bottle), [Turner Duckworth](https://turnerduckworth.com/work/coca-cola) | Audit existing recognition before adding more motifs. |
| Spotify, rank 78 | 2024 Spotify Mix connected custom variable type with product and marketing. [Spotify](https://newsroom.spotify.com/2024-05-22/introducing-spotify-mix-our-new-and-exclusive-font/) | Test content and language coverage, not only a campaign headline. |
| Pepsi, supplemental | 2023 refresh coordinates custom type, globe, wordmark and animated pulse. [PepsiCo Design](https://design.pepsico.com/case-studies/pepsi-global-redesign) | Coordinate motion and static assets while retaining our sentence-case rules. |
| Vodafone, supplemental | 2009–2022 project modified the existing InterFace family. [Dalton Maag](https://www.daltonmaag.com/portfolio/font-modification/vodafone-interface.html) | Authorized modification is a practical middle option before a full custom family. |

## Font ownership is not one category

| Model | Verified example | Boundary for our work |
| --- | --- | --- |
| Brand-created, openly released | IBM Plex; Google states Sans/Flex went open source in 2025. [IBM](https://www.ibm.com/design/language/typography/typeface/), [Google](https://design.google/library/google-sans-flex-font) | Review the exact release license and notices; the corporate mark remains separate. |
| Licensed retail family | FF Mark in Mastercard's identity. [Pentagram](https://www.pentagram.com/work/mastercard/story) | Buy the required uses; a designer's specimen is not a license. |
| Authorized modification | Vodafone's exclusive version of InterFace. [Dalton Maag](https://www.daltonmaag.com/portfolio/font-modification/vodafone-interface.html) | Negotiate modifications, deployment, partner access and maintenance explicitly. |
| Exclusive custom family | Netflix Sans and Spotify Mix. [Dalton Maag](https://www.daltonmaag.com/portfolio/custom-fonts/netflix-sans.html), [Spotify](https://newsroom.spotify.com/2024-05-22/introducing-spotify-mix-our-new-and-exclusive-font/) | Study the design process; do not redistribute or adopt those families. |
| Platform-restricted asset | Apple's downloadable San Francisco license. [Apple](https://developer.apple.com/fonts/) | Its displayed mock-up permission is not a general website, logo or marketing license. |

Current Google Sans/Flex openness does **not** establish the rights to Product Sans, Google logos or every file named “Google Sans.” The exact font-file audit remains a separate gate.

Microsoft's Aptos page supplies licensing and redistribution routes; Office availability alone is not a webfont license. [Microsoft Learn](https://learn.microsoft.com/en-us/typography/font-list/aptos) Spotify's partner guide recommends platform sans defaults even though its own product uses exclusive custom type. That is a useful example of separating a company's internal kit from an integration kit. [Spotify partner guidance](https://developer.spotify.com/documentation/design)

## Decisions supported by the evidence

These are portfolio recommendations inferred from the cases, not claims that all top 100 brands use the same approach.

1. **Keep one design authority.** Google documents canonical source-controlled asset generation; Amazon demonstrates shared foundations with differentiated sub-brands. This supports the existing central repository and per-brand packs. It does not establish either company's private repository topology. [Google identity engineering](https://design.google/library/evolving-google-identity), [Amazon case](https://koto.com/projects/amazon)
2. **Treat Figma and Canva as publication surfaces for the kit.** Define stable role names, revision, provenance and approved examples centrally. Bind those roles into Figma libraries and Canva Brand Kits/templates. The reviewed cases do not establish which specific design tools each company uses.
3. **Improve our owned wordmarks and symbols before funding full custom alphabets.** Test original vector candidates in monochrome, reversed, tiny and large applications; keep full-name lockups. A wordmark is a bounded set of letterforms. A text family adds spacing, kerning, styles, hinting, shaping, language coverage and ongoing maintenance.
4. **Select fonts by job.** Compare primary UI, long reading, expressive display, numerals and code separately. A beautiful display face does not qualify for small labels or body copy. Start with the portfolio's audited open candidates.
5. **Commission only against a written need.** First establish a stable brand, missing functional coverage or a distinctive repeated typographic requirement. Compare stock licensing, authorized modification and full custom design against the same actual content. Do not presume a custom family automatically improves quality or saves money.
6. **Build recognition through consistency.** Preserve the strongest owned assets and extend them into motion, imagery, spacing and templates. The inherited all-caps examples in reference brands do not override Frank's sentence-case preference.

Suggested custom-type decision record: intended surfaces; reader languages; required scripts and glyphs; styles and axes; file formats; weight/italic coverage; client ownership or license; permitted modifications; web/app/desktop/PDF/video uses; contractor and Canva/Figma access; redistribution/subsetting terms; maintenance owner; validation budget; acceptance evidence. These are proposed procurement fields, not a legal clearance.

## Evidence gaps and next research

| Brand | Status on 9 September 2026 | Next bounded action |
| --- | --- | --- |
| Facebook, rank 6 | Official design page returned a temporary-block response. | Obtain accessible official 2023/current system documentation; confirm the present font and mark rules. |
| Instagram, rank 7 | Official page returned HTTP 429. Secondary search surfaced a possible 2026 update. | Verify the current refresh directly before treating 2022 guidance as current. |
| Tencent, rank 8 | Official page timed out. | Verify the Chinese/Latin identity relationship, typography and current asset permissions from official guidance. |
| Oracle, rank 9 | Official Redwood page fetch was disabled. | Verify corporate identity versus product-system typography and release dates. |
| Airbnb, supplemental | Official design site was unreadable. | Verify Cereal and Bélo history through an accessible corporate or commissioned-designer source. |

The remaining 85 cohort brands have not received primary identity research in this file: 11 have reviewed primary sources and four have recorded access gaps. Source URLs and field-level limitations live in the JSON. Do not promote “indexed” to “verified” because a company homepage is reachable.

For the next pass, prioritize the four top-ten gaps, then contrasting cohorts such as luxury, retail, finance, automotive and consumer technology. For each, capture an official dated predecessor/current relationship, font role, rights source and kit-distribution mechanism. Use Refero or comparable galleries for interface discovery only; their screenshots do not establish font identity, current licensing or permission to copy a brand.

No third-party fonts, logos, screenshots or downloaded brand-kit assets are included in this research. Original abstract principles may guide our work; the reference brands' names, marks, typography licenses and distinctive identities retain their own rights.

