# Rendered interface foundations

Inspect the actual DOM after the selected product state is ready. Use the owning
journey's Playwright test and the self-contained `inspectInterfaceFoundations`
function, or run the CLI against an admitted preview or HTML artifact:

```bash
npm run validate:interface -- --url https://your-preview.example/editor --ready-selector '[data-testid="project-editor"]' --commit <full-source-sha> --output <new-receipt.json>
```

The CLI requires a visible readiness selector, checks HTTP success, waits for font
loading and inspects 390px and 1440px layouts under both motion preferences. It
closes its browser contexts and browser even after failure. Exit 0 means these
foundation checks passed; 1 means defects were observed; 2 means inspection failed.
It refuses to overwrite evidence. Store receipts in the existing evidence store.

## Blocking findings

- Interface emoji, including numeric entities, script-inserted text and CSS
  pseudo-elements. Use intentional text or a coherent vector icon family.
- Lorem ipsum and explicit brand/company/product name placeholders.
- Controls without a basic accessible name, forced uppercase styling on controls
  or headings, placeholder navigation links and horizontal viewport overflow.
- SVGs without explicit decorative or meaningful semantics, or keyboard-focusable
  decorative SVGs. Meaningful graphics have `role="img"` and a name. Decorative
  graphics use `aria-hidden="true"` and never receive focus.
- Empty visible surfaces or an incomplete inspection beyond the 20,000-element
  resource ceiling. A readiness failure cannot become a pass.
- Visible embedded surfaces that need their own inspection. Reachable open shadow
  roots are traversed under the same 20,000-element budget, including nested roots,
  root-local labels, text, CSS pseudo-elements and controls. Closed shadow roots
  require separate product testing and cannot be discovered reliably by this check.

Hidden branches, literal code examples and editable user content are excluded from
text checks. Copyright, registered and trademark marks are allowed. Plain text
directional arrows are allowed; an explicit emoji presentation selector on an
arrow is rejected. This is a bounded text-symbol exception, not a tag-name waiver.
Published user
content and editorial emoji need an explicit product-specific decision; inspect
the application chrome separately in that journey. There is no arbitrary DOM
attribute that waives the findings. Repair findings or document a reviewed,
specific exception at the owning product's gate.

## Icon foundation

Preserve a good existing licensed icon family. When a product lacks one, Lucide is
a suitable general interface option: its [accessibility guidance](https://lucide.dev/guide/accessibility)
describes named controls and decorative SVG treatment; retain its [license](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
Inspect the current package version, license and existing implementation before
installation. Import individual icons. Keep grid, optical size, stroke weight and
filled/outline behavior coherent. Use text labels for unfamiliar actions and name
icon-only buttons. A library icon cannot serve as an unreviewed brand logo.

Brand marks remain owned vector assets with approved lockups, clear space,
monochrome and small-size evidence. Review typography, imagery, color, motion,
contrast, keyboard, target sizes, reflow, performance and recovery under their
existing gates. This check deliberately adds no universal visual theme.

## Evidence boundary and adoption

The receipt records DOM hashes including reachable open shadow markup, viewport, motion preference, resolved URL,
timestamp and findings. The source SHA is caller supplied; this inspector does
not resolve deployment identity. Bind it to the verified preview/deployment using
the existing release evidence process. It creates no screenshots or generated
media and does not attest to usefulness, originality, complete accessibility,
working controls or field performance.

Kernel CI runs positive and deliberately failing real-browser fixtures plus CLI
exit, readiness and receipt checks. A product adopts this at its actual journey
and required CI boundary. The kernel workflow's success proves the implementation
works on these fixtures; it does not prove estate-wide adoption. Require separate
controlled-failure evidence for every adopting repository and fresh host.
