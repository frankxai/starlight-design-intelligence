# Brand-kit release manifest contract

Status: proposed manifest format, 10 September 2026. This document creates no
runtime schema, automated approval, identity selection or production release.

Use one contract for every registered brand and explicit surface mode. Keep the
kit in its existing brand pack; a channel, domain or draft does not create a new
master brand or repository. Read the [architecture decision](brand-kit-architecture.md)
and selected brand's `TYPOGRAPHY.md` before producing a candidate.

## Authority and state

Separate three decisions: **identity selection**, **exact asset acceptance** and
**consumer release**. A selected family can have a defective file; a verified
file can belong to an unselected territory; an approved kit can be incorrectly
implemented. Each decision needs its own owner, scope, date and evidence.

Record `selection.status` as `unselected`, `candidate`, `selected` or `retired`.
Record `release.status` as `draft`, `blocked`, `ready_for_review`, `released` or
`retired`. Only a named owner decision moves identity to `selected`; only complete
evidence for the declared targets permits `released`. Unknown or unavailable
evidence remains explicit and blocks the affected target. A newer candidate or
live font loader does not override an earlier selection.

## Required manifest fields

Place a candidate at `brand-packs/<brand>/releases/<version>/manifest.json` when
its assets and decisions exist. This is a proposed location and field contract,
not a claim that current validators parse it. Never fill unknowns with invented
hashes, approvals or asset paths.

| Field | Required content |
| --- | --- |
| `format_version`, `brand_id`, `kit_version` | Stable brand ID, contract version and immutable kit revision. Reconcile parent/master-brand relationships with the registry. |
| `scope` | Named surfaces, modes, languages, channels and supported platforms; explicit exclusions. A web-only release cannot imply Canva or print acceptance. |
| `source` | Repository and full source commit, source-document revisions, dates and authority status. Restricted source material uses a permitted reference, never a public copy or private tool URL. |
| `ownership` | Accountable brand owner, asset/rightsholder references, maker, independent verifier and release approver. Store restricted identities and contracts privately. |
| `selection` | Status, chosen territory, decision reference, deciding owner, date and exact surface scope. Retain superseded alternatives as historical evidence. |
| `fonts[]` | Stable font ID; family, full name, PostScript name, version, file path, format, byte size and SHA-256; upstream revision; real weight/style, variable axes and selected instance settings. Derived subsets or instances record input hash, tool/version/options and output hash. |
| `fonts[].rights` | Exact notice/license path and SHA-256, source and copyright, allowed intended uses, redistribution/embedding/modification conditions, reserved-name handling, reviewer and decision state. A technical embedding flag or catalog name is insufficient. |
| `fonts[].coverage` | Required scripts/locales, real sample copy and its hash, missing codepoints, shaping/features tested, unresolved gaps, and explicit symbol or language fallbacks. |
| `text_tokens` | Semantic roles such as display, heading, body, label, caption and code, each bound to font ID, real style/weight or axes, size, unit, line height, tracking and fallback stack. Record responsive rules and approved casing; distinguish authored copy from preserved wordmark artwork. |
| `logos[]` | Role, exact editable source path/hash, outlined distribution path/hash, monochrome/reverse versions, clear space, minimum size, optical variant and background rules. Record creator, provenance, source rights and selection status. |
| `symbols_and_icons[]` | Approved library/source revision, exact file hashes, permitted uses and optical/stroke rules. Distinguish UI icons, proprietary identity symbols and third-party marks. |
| `tokens_and_templates` | Versioned color/contrast pairs, spacing, motion/reduced-motion rules, imagery and voice references; selected template paths/hashes and intended channels. |
| `adapters[]` | Target platform/version, kit revision, font/style and asset mappings, exact import method, available-byte identity or explicit limitation, export settings, output hashes and acceptance state. Tool-private IDs remain in private deployment records. |
| `evidence[]` | Check ID, target, method/tool/version, sample hash, actual result, reviewer/date and evidence reference. Local artifacts include SHA-256, byte size, MIME type, and dimensions or viewport/DPR when relevant. |
| `release` | Status, open blockers, named approvals and dates, supported targets, source revision, consumer adoption references, previous accepted revision, rollback and retirement instructions. |

All recorded SHA-256 values are hashes of actual bytes, not URLs or filenames.
The manifest pins its source commit; it cannot contain the SHA of a Git commit
that contains the manifest itself. Publish final deployment receipts separately
from the production commit, as required by the existing web release contract.

## Required application proofs

| Target | Acceptance evidence |
| --- | --- |
| Browser | Actual loaded files and computed roles; desktop and smallest supported phone including 320px; actual 200% zoom; long/localized copy; requested weights/italics/axes; blocked-font fallback; contrast and clipping. Record keyboard/focus and reduced-motion results where components or motion ship. |
| Desktop font installation | Clean installation plus coexistence with prior kit; unique style/PostScript mappings; Roman/italic and variable/static selection; save, reopen and export without substitutions. |
| Figma | Named text styles and variables map to the selected roles; inspect real nodes and exported specimens at desktop/phone sizes. A family in the available-font list does not prove its file hash or correct rendering. |
| Canva | Brand Kit and templates map to the selected revision; inspect an actual exported design for case, wraps, style substitutions, logo geometry and contrast. Record platform fonts as unverified-version assets when exact bytes are unavailable. |
| Documents, slides and print | Inspect actual PDF and relevant editable exports; record font embedding/substitution, page boundaries, long headings, hyperlinks and intended print conditions. Editable-output acceptance is separate from PDF acceptance. |
| Social and video | Inspect final dimensions at phone viewing size; preserve exact copy, safe areas, real font styles and logo variants. Review representative motion frames and the static/reduced-motion equivalent where applicable. |

Keep unresolved platform font identity visible. An inspected export can prove
that export's appearance; it cannot prove byte identity with an upstream TTF.
Declare target-specific acceptance instead of asserting universal parity.

## Executable and review boundaries

| Boundary | What it can establish | What remains outside it |
| --- | --- | --- |
| Existing `scripts/font-audit/audit.py` | Exact-file metadata, hashes, naming collisions, lowercase outline distinctions, defined glyph samples and renderer measurements. | Font quality, exhaustive shaping, browser behavior, identity approval or license clearance. |
| `scripts/check-typography-specimen.mjs` | Supplied DOM font-load, casing, style and geometry observations for controlled specimens; explicit fallback verdicts. | Rendered glyph identity, omitted content, actual browser execution, other platforms or the complete manifest contract. |
| Existing kernel and adoption validators | Their current schemas, repository structure and pinned consumer contract. | This proposed manifest's completeness, every public design's appearance or automatic font/mark approval. |
| Existing web-release validator | Evidence structure and applicable checks in `schemas/web-release-evidence.schema.json`. | Independent taste judgment, Figma/Canva parity or unspecified channels. |
| Future manifest validator | Required-field completeness, file/hash references, valid state transitions and blocking check results after a dedicated implementation. | Named human decisions or visual judgment. This validator does not yet exist. |
| Independent visual and owner review | Real-content fit, brand distinction, optical mark behavior, correct casing, source reconciliation and selection. | Proof of tests not actually performed, automatic trademark clearance or rights inferred from a font name. |

Run the existing relevant validators against their own formats. Do not attach a
green repository test result to an untested platform and call its kit released.

## Adoption and rollback

Release one complete pilot kit to its declared targets. Each consumer records
the pinned kit revision, exact delivered assets, mapping changes, evidence and
prior accepted revision. Promote the same selected revision into Figma, Canva
and application code only after their respective proofs pass. Expand other
brands through the same contract while preserving their own selected identity.

Retain the preceding accepted package and mappings. Rollback restores those
assets and tokens together; it does not silently change the brand selection.
No new repository or automatic shared-style mutation is required by this contract.
