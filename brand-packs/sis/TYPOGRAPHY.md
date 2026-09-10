# Starlight Intelligence typography

Apply [the portfolio standard](../../TYPOGRAPHY.md).

## Source reconciliation

The recovered v3 kit and v5 candidate both use Instrument Sans, Newsreader and
IBM Plex Mono. That agreement supports the recommendation below. It does not
establish a new owner selection or approve the v5 candidate's wider identity.
Preserve the Horizon, Operator, Academy and Cultural modes in [BRAND.md](BRAND.md).

The inspected web layout loads Instrument Serif italic. Older web tokens name
Manrope. These are conflicting implementation observations, not authority to
replace Newsreader. Record the selected editorial role and surface first, then
change loaders and tokens together in a scoped downstream review. No migration
is enacted by this document.

## Recommended roles for review

| Role | Family and requested styles | Surface behavior |
| --- | --- | --- |
| Interface and primary text | Instrument Sans, Roman 400/500/600/700; real italic where needed | Navigation, controls, body and primary headings. Operator mode keeps dense information in this family. |
| Editorial | Newsreader, Roman 400/500/600; real italic 400 for authored emphasis | Sustained editorial reading and selected Horizon, Academy or Cultural display. Set variable weight and optical-size behavior explicitly. |
| Technical utility | IBM Plex Mono, Roman 400/500 | Code, identifiers and technical receipts. Ordinary labels and prose stay in the primary or editorial role. |

These are requested roles, not a claim that every named file is installed or
loaded. Map each role to verified bytes and axes in the
[release manifest](../../portfolio/brand-kit-release-contract.md).

- Use sentence case, tracking 0 for body, around -0.025em for sans display, 1.6
  prose line height, and 60–70ch reading measure. Start Newsreader tracking at 0.
  Test final scale and density on actual content in the chosen surface mode.
- Fallbacks: system-ui/Arial for Instrument Sans, Georgia/serif for Newsreader,
  and ui-monospace/monospace for IBM Plex Mono; verify reflow and style mapping.
- The audited upstream Newsreader files lack the tested right-arrow character.
  Use a verified icon or documented symbol fallback; test actual localized copy.
- Preserve real lowercase and real font styles. Never substitute a caps-only
  face or transform an entire label into capitals.

## Release status

Selection: kit-based recommendation, awaiting a recorded owner decision for the
target surfaces. Implementation: loader and token reconciliation pending.
Packaging: a separately audited upstream candidate exists; it has not replaced
the original kit or installed fonts. Audit hashes do not prove desktop, browser,
Figma or Canva copies match. Release requires the selected exact files and
notices, verified exports, and a consumer-specific adoption record.
