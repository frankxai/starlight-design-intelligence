# GenCreator typography

Apply [the portfolio standard](../../TYPOGRAPHY.md).

Preserve the selected territory; do not assemble a page from both font systems.

- Editorial territory: Instrument Sans 400/500/600/700 for reading and controls,
  Instrument Serif 400 for display. A real italic file is required before using
  italic serif; the inspected editorial loader requests normal only.
- Product territory: Geist for headings and body, Fraunces for sparse editorial
  accents, Geist Mono for code and identifiers. Verify the loaded Fraunces axes
  and style before requesting them.
- Use sentence case. Start body tracking at 0 and sans headings at -0.025em;
  use 1.6 prose line height and a 60–70ch reading measure.
- Fallback: Arial/system-ui, Georgia, and ui-monospace. Inspect long creator names,
  prices, multilingual titles, and real artifact descriptions at phone size.
- Reconcile `brand/design-tokens.json` with the active territory's loaded font
  variables. Its `wide` 0.14em tracking token is not suitable for ordinary labels.

Selection status: both territories exist in the inspected app. This kit clarifies
their boundaries; it does not claim a new territory approval or site migration.
