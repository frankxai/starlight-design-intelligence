# Liked Reference Library

Curated visual/marketing references Frank actually likes. Git is the catalog SSOT. Bytes live in the local mirror.

## Paths

| Role | Path |
| --- | --- |
| Catalog SSOT | `brand-image-system/liked-references/` (this folder) |
| Working inbox / screenshots / exports | `C:\Users\frank\brands\image-system\liked-references\` |
| Hermes adapter | `runtime/adapters/hermes/liked-references.md` |
| Codex adapter | `runtime/adapters/codex/liked-references.md` |
| Team loop | `MARKETING_DESIGN_TEAM.md` |

Do not copy liked images into public repos. Catalog records URL, why-liked, brand unit, and local path only.

## Can agents use “these sites”?

| Surface | Use URLs / live sites | Use Slack image attachments | Use local inbox files |
| --- | --- | --- | --- |
| Hermes in Slack (this bot) | Yes: `web`, `browser`, `vision` on saved URLs | **No** until Slack `files:read` fetch works | Yes, if dropped in the inbox |
| Hermes Agent on Yogabook | Yes | No (same Slack gate) | Yes |
| Codex desktop on Yogabook | Yes, if this catalog is in the task context | No | Yes |

Hermes does **not** need Codex to browse a liked site. Codex does **not** need Hermes to read a local file. Both must read **this catalog** before treating a site as a taste reference.

Observed 2026-08-30: Slack attachment fetch HTTP 403. Android screenshot filename hashes to `com.instagram.android`. Cover filename `agentic-coding-os-cover-preview-2026-06-25-revised.png` was not on disk in allowed leaves.

## Feed loop

1. Drop screenshot, URL, or export into the inbox (never Phone Link / Pictures recurse).
2. Add or update a `catalog.json` entry (`status: liked`, `why`, `use_for`, `do_not_copy`).
3. Marketing/design work loads the catalog + brand pack **before** generating.
4. Produce through brand-image-system media-job. Score the export. Public send stays human-gated.

## Plugins / config (already on this machine)

Do not add paid providers. Current Hermes surfaces that serve this library:

- Builtin: `web`, `browser` (browser-use), `vision`, `image_gen`, `video_gen`
- Plugins enabled: `image_gen/xai`, `video_gen/xai`, `superpowers/.hermes-plugin`
- MCP enabled: `figma` (plus Notion/Linear/Vercel — not taste sources)
- Empty / not the config surface: `%LOCALAPPDATA%\hermes\desktop-plugins\`

Configure **here** (catalog + adapters), not by stuffing random desktop-plugins into an empty folder.
