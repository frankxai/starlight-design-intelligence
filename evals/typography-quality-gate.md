# Typography Quality Gate

Score each item 0, 1, or 2. Release requires **15/16**.

| Item | Passing evidence |
| --- | --- |
| Voice | Roles follow the experience thesis and surface mode |
| Hierarchy | Display, reading, labels, and data are unmistakable |
| Specimens | Actual content shown at desktop and smallest supported phone |
| Provenance | Source, license, files, styles, and weights recorded |
| Loading | Preload/subset/fallback behavior is intentional |
| Reflow | No accidental wrap, clip, orphan, or overflow |
| Accessibility | Readable contrast, zoom, measure, and line height |
| Restraint | Maximum two expressive families plus optional mono |

Automatic failure: unresolved alternatives, faux styles, absent license evidence,
missing mobile specimen, or materially broken fallback.

## Font artifact checks

`validate:release` decodes each supplied WOFF, WOFF2 or SFNT font with pinned
Fontkit 2.0.4. Use `file_check: decoded-font-metadata` in font records. Older
`container-signature` records fail the schema intentionally. The schema version
remains v1; upgrading to this kernel revision tightens its font evidence contract.

Before moving a downstream kernel pin, migrate its supplied font records:

1. Preserve the original manifest and font artifacts as historical evidence.
2. Make a separate candidate manifest beside the original, for example
   `release.font-decoded.json`, so the existing relative artifact paths still resolve.
3. In that candidate, change only font records' `file_check` to
   `decoded-font-metadata`. Keep file paths, hashes, bytes and all other evidence.
4. Run `npm run validate:release -- <candidate-path> --repo-root <product-checkout>`
   with this kernel and its pinned decoder installed. The validator decodes the
   original files and checks the whole candidate. A missing decoder or malformed
   font blocks migration. Relabeling a four-byte header still fails.
5. Keep the candidate, exact kernel SHA and validation receipt for review. Update
   the downstream pin only under its owning release/approval contract. A successful
   technical migration does not renew prior production checks or grant new approval.

The release-validator regression tests exercise both a valid synthetic font migration
without changing its artifact hash and a relabeled signature-only file that stays denied.

The check requires readable internal family/PostScript names, metrics, character
mapping and variation axes, and decodes a bounded sample of glyph outlines. It
does not compare CSS aliases to internal names: static weights and optical-size
families can legitimately have different internal names. It does not validate
every outline, shaping feature, checksum or browser renderer, and is not an
OpenType sanitizer or rights approval. A missing decoder fails closed.

Limits per artifact: 8 MiB file, 16 MiB expanded SFNT and decoded table stream, 256 tables,
five-second child deadline, 128 MiB V8 heap and 64 KiB output. The V8 heap limit
does not cap total process RSS. The child receives bytes over stdin and uses a
fixed executable and worker without a shell or inherited Node preloads. The
parser reads no remote fonts. Directory lengths and bounded native decompression
are checked before Fontkit decodes the tables. Supplied artifacts retain existing byte/hash checks.

System fonts and an empty `existing_project` font inventory keep their existing
scope; they do not establish that installed/browser fonts were decoded. Font
rights, declared weight/style compatibility, mobile/fallback specimens and
computed production fonts still require the separate font licensing workflow.
