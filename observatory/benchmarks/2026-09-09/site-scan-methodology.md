# Top 100 brand website declaration scan

This is a breadth study of public HTML and CSS responses from the candidate URLs in `top-100-cohort.json`. The cohort is [Kantar BrandZ's 2026 ranking](https://www.kantar.com/campaigns/brandz/global), which measures brand value. Inclusion does not make a brand a design-quality benchmark or establish that its typography causes its commercial performance.

## Observed coverage on September 9, 2026

All 100 candidates were attempted. The collector received 39 HTML responses: 32 substantive pages and seven empty/script-dependent responses. There were 54 network failures, two HTTP errors and five HTTP denials. The substantive pages yielded 23 samples with font declarations: 22 contain resolved family names, while Claude contains unresolved family variables and the CSS keyword `inherit`. Nine substantive pages had no font-family declarations in the bounded sample. Eighteen samples contained `@font-face` definitions; thirteen contained an uppercase text-transform declaration. These are sample coverage counts, not brand-quality scores.

The captured CSS names include Everyday Sans/Headline at Walmart, TeleNeo Var at Deutsche Telekom, Costco Sans Web at Costco, separate BrandFont-Display/Text aliases at Verizon, CharlesModernVar at Charles Schwab, and EMprint variants at ExxonMobil. This suggests useful follow-up questions about role separation, variable axes and multinational coverage; it does not establish that these are custom commissions or that they may be reused. Some large bundles contain many fallback, icon and legacy families. ChatGPT's candidate URL redirected to its public product surface; the CSS includes OpenAI Sans language/script families. Several candidates redirected to Dutch regional pages. Every such comparison requires its surface and locale to remain attached to the evidence.

## Evidence levels

| Field | What it supports | What it does not support |
| --- | --- | --- |
| Ranking and name | Membership of the separately sourced 100-brand cohort | Design quality or a recommended style |
| HTTP status and final URL | What this request received on the observation date | Independent confirmation of domain ownership |
| Title and domain relevance | Whether the response names the expected brand/parent and stays on the candidate host | Official guideline status or comprehensive identity validation |
| `declared_font_families` | Font-family declarations in the sampled CSS, including fallback and icon families | A font actually rendered, its intended role, or its production license |
| `font_face_definitions` | Declared family, weight, style, stretch and display descriptors | Successful download, exact binary metadata, or permitted use |
| Uppercase/small-caps declaration counts | The number of matching declarations in this CSS sample | The number, visibility, or meaning of affected elements |
| Response hash | Integrity of the locally observed response bytes | A licensed asset or a guarantee that the page is unchanged |

## Collection boundaries

`scan-cohort-sites.py` uses Python's standard library and a descriptive research user agent. It attempts every cohort entry with at most eight workers. Each site has a 25-second collection budget, with individual socket operations capped at eight seconds or the remaining budget. Network/OS behavior can make the wall-clock total exceed the intended budget; observed elapsed time is recorded. Each response is capped at 2 MiB and any truncation is explicit.

The scan reads one public HTML response, its inline style text and style attributes, and at most the first three distinct linked stylesheets in document order. It follows ordinary redirects, up to five. It does not execute JavaScript, follow CSS imports, request font binaries or images, crawl internal pages, authenticate, traverse age gates, retry denials, or work around challenges. HTTP denials, failed requests, challenge pages, and empty/script-dependent pages retain their own statuses. An HTTP 200 response alone does not count as a usable typography observation.

The CSS extractor handles ordinary `font-family` and `@font-face` declarations and removes comments. It records unresolved variable expressions separately. It is not a CSS parser or rendering engine: shorthand `font` declarations, escaped names, complex expressions, dynamically injected styles, cascade precedence, stylesheet media applicability, and actual glyph fallback are outside its scope. A later visual study must inspect computed styles and screenshots at named desktop/mobile viewports.

Names found in generic fallbacks, icon fonts, unused selectors, consent widgets, or legacy bundles must not be promoted to the brand's primary font. The counts cannot be used to rank design quality or justify decorative uppercase in our own work.

## Surface comparability

The sample distinguishes corporate/about pages, consumer homepages, product-marketing pages and parent-company proxies. Amazon's corporate site does not stand in for Amazon retail or AWS. Meta's newsroom cannot establish Facebook's application typography. Microsoft spans several product identities. PMI product pages cannot establish Marlboro or IQOS typography. OpenAI and Anthropic marketing pages do not establish their authenticated product interfaces. Locale, personalization and consent state can also change responses.

`official_ownership_status` deliberately remains `not-established-by-this-scan`; domain/title matches are relevance checks. Confirm ownership and identity authority using an official brand portal, company legal/about page, or linked primary evidence before using a page in a deeper case study.

## Reproduction and storage

Run from the repository root, choosing a raw-response directory outside the repository:

```sh
python observatory/benchmarks/2026-09-09/scan-cohort-sites.py \
  --cohort observatory/benchmarks/2026-09-09/top-100-cohort.json \
  --output observatory/benchmarks/2026-09-09/site-scan.json \
  --raw-dir /tmp/brand-cohort-observations \
  --workers 8
```

Only the normalized observations, method and reproducible collector belong in this public repository. Raw HTML/CSS remains outside Git. Response hashes are retained; public records do not embed copied stylesheets, screenshots, font binaries, or extracted logos. Raw scratch files are not durable archival evidence; a future approved private archive should retain any captures required for longitudinal work.

Rerunning observes a new moment and may change results. Compare dated records rather than overwriting historical claims. A failed attempt is a recorded gap, not evidence that a brand lacks a type system.
