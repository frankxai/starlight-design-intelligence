# Starlight Intelligence typography

Apply [the portfolio standard](../../TYPOGRAPHY.md).

- Instrument Sans 400/500/600/700 carries headings, body, navigation, and controls.
- Instrument Serif 400 is a short editorial accent. The inspected web layout
  loads italic only; load a real normal face before requesting roman serif text.
- IBM Plex Mono 400/500 carries code, identifiers, and technical receipts. Prose,
  navigation, and ordinary labels remain in Instrument Sans.
- Use sentence case, tracking 0 for body, around -0.025em for sans display, 1.6
  prose line height, and 60–70ch reading measure. Let precise hierarchy and
  well-designed evidence carry institutional authority.
- Fallback: Arial/system-ui, Georgia, and ui-monospace respectively; verify reflow.
- The old Manrope references in `starlight-intelligence-web/design/tokens.json`
  conflict with its font loader. Reconcile those downstream tokens before claiming
  that the web implementation and this kit are synchronized.

Selection status: principal families match inspected web layout; rendered
production fonts and downstream token reconciliation remain unverified.
