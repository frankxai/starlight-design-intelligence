# Font use and rights evidence

Status: **evidence collected; review required**. Owner: Frank Riemer.
Independent evidence review completed (Codex verifier, 9 September 2026);
production rights implementation and owner approval remain open. This record covers only the files and notices
hashed in `font-evidence.json`; it does not approve a production release or
establish clearance of a proposed brand name or symbol.

All audited families declare SIL Open Font License 1.1. The following is a
working interpretation of the [official license](https://openfontlicense.org/open-font-license-official-text/)
and [maintainer FAQ](https://openfontlicense.org/ofl-faq/), subject to each exact
family notice.

| Intended use | Classification | Conditions to carry into implementation |
| --- | --- | --- |
| Web self-hosting or CDN | Allowed with conditions | Preserve copyright and license when distributing font files. |
| Desktop design | Allowed | Use the audited font version; keep its notice with working files. |
| App/software bundle | Allowed with conditions | Include font copyright and license. |
| Print output | Allowed | Artwork is not required to use the font's license. |
| Logo/wordmark artwork | Allowed | Font use does not establish trademark clearance. |
| Social/video raster output | Allowed | Output is artwork; distributing the font is a separate action. |
| PDF/e-book embedding | Allowed with conditions | Preserve notices appropriately; distinguish embedding from bundled files. |
| Client/contractor font transfer | Allowed with conditions | Transfer the relevant copyright and license with the font. |
| Modification/subsetting | Allowed with conditions | Preserve OFL; check reserved names and rename when required. |
| Redistribution | Allowed with conditions | Preserve notices and OFL; do not sell the font alone. |

Reserved names need **per-family review**. The exact copyright/reserved-name
header, source URL and hash are recorded per family. A zero `fsType` value is
not licensing proof. Review additional accompanying notices before distributing
modified files. A proposed proprietary font cannot be made by relabeling an OFL
derivative. An independently commissioned typeface needs its own rights record.

In the captured license headers, IBM Plex Mono explicitly reserves **Plex** and
Playfair Display explicitly reserves **Playfair Display**. The other twelve
captured headers do not contain a reserved-name declaration. This observation
is limited to those headers; review accompanying notices and exact modified
files before making a naming decision.

Google Sans and Google Sans Flex are outside this evidence set. Their expected
`ofl/googlesans/METADATA.pb` and `ofl/googlesansflex/METADATA.pb` paths returned
HTTP 404 at the pinned commit during this audit. That establishes only that
those paths were unavailable at this revision, not that the families lack an
open distribution elsewhere. Acquire and hash a verified source separately.

## Approval boundary

The audit records a reproducible source snapshot; human approval is still absent.
Do not label a font “approved” merely because this matrix says its intended use
is allowed with conditions. Approval needs a chosen file/hash, satisfied notice
requirements, actual implementation details, a verified specimen, and a named
reviewer. The brand owner separately approves identity changes.

No proprietary licenses, purchase receipts or third-party font binaries belong
in this public evidence folder. For fonts delivered by Figma, Canva or a package,
verify the actual version and vendor terms before equating them with these TTFs.
