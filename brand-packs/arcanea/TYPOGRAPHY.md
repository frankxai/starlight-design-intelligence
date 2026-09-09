# Arcanea typography

Apply [the portfolio standard](../../TYPOGRAPHY.md).

- Geist carries product headings, world navigation, labels, and body UI.
- Instrument Serif 400 carries short narrative display accents. Newsreader
  carries sustained lore and book reading when that surface selects a reading
  serif. Scope these families by surface instead of loading every role globally.
- Use JetBrains Mono only for technical content. The current app also imports
  Geist Mono; choose one utility family for a given surface during consolidation.
- Use real lowercase. Cinzel, all-cap fantasy faces, and small-cap styling do not
  satisfy the user's casing preference, even when the source string is mixed case.
- Set sans heading tracking around -0.025em; serif and body tracking at 0. Start
  reading copy at 18–20px / 1.65 and around 65ch. Scale cinematic display against
  the actual phone specimen; never copy video pixel sizes into web UI defaults.
- Fallback: Arial/system-ui for Geist, Georgia for serif, ui-monospace for code.
- Cinematic identity comes from worlds, illustration, pacing, and composition;
  essential reading must remain effortless.

Selection status: families inspected in `arcanea-ai-app`. The older `arcanea`
repository contains superseded typography and conflicting layouts; those are not
the current app authority. This change does not migrate those legacy surfaces.
