# FrankX typography

Apply [the portfolio standard](../../TYPOGRAPHY.md).

- New editorial direction: Instrument Sans for body, headings, and controls;
  Instrument Serif 400 for occasional short display phrases, with a real italic
  file when italics are used. Compare this pairing with Inter + Playfair Display
  on actual flagship content before changing the site-wide font system.
- Existing technical surfaces: retain Inter 400/500/600/700 and JetBrains Mono
  where already implemented. Poppins is legacy compatibility, not the default
  for new flagship work.
- Books and long essays: consider the existing Source Serif 4 reading role;
  verify files and route scope. Playfair Display is not an interchangeable text
  serif merely because both are serif fonts.
- Use sentence case, body tracking 0, sans heading tracking around -0.025em,
  serif tracking 0, prose line height 1.6, and a reading measure near 65ch.
- Fallback: Arial/system-ui for sans; Georgia for serif; ui-monospace for code.
  Tune metrics from the actual selected files; do not claim metric matching from
  these family names alone.
- FrankX can feel personal, editorial, technical, or musical through composition
  and material. It does not need a new typeface for every subject.

Selection status: new editorial direction proposed; existing app font loaders
inspected; production migration and full visual verification outstanding.
