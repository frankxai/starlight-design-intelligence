# GitHub → Figma → product preview

Keep product-owned tokens and component implementations in their owning repositories. Figma is an editable projection and review space. SDI supplies the adapter, standards, reference patterns and verification protocol; it does not supply a fifth product component runtime.

## Ownership

| Layer | Shared across the estate | Brand/product owned |
| --- | --- | --- |
| Quality | Keyboard behavior, reflow, accessible names, honest states, reduced motion, asset provenance, outcome evidence | The customer task, value claim and commercial acceptance |
| Foundations | Extraction format, source hashes, variable naming and validation | Color, typography, density, shape, motion and image language |
| Components | State vocabulary and review protocol | Implementations, APIs, visual recipes and runtime dependencies |
| Templates | A reviewable delivery manifest and checks | Marketing, editorial, commerce and app-shell compositions |
| Releases | Exact repository/commit/preview binding | Product tests, deployment configuration and rollback |

Do not merge brand libraries into a mega-library. Starlight's public `.ai` product, Academy and operator/protocol site are different consumers. Verify the Vercel deployment's repository metadata before selecting a source. A READY deployment establishes availability of a build, not quality or user value.

## Source-pinned native import

1. Read committed product blobs at an immutable SHA. Record byte SHA-256 and, where available, the Git blob ID. Store private snapshots, account IDs and execution receipts outside this public repository.
2. Prepare `starlight.figma_projection.v1` input: product owner, commit, named surface, readiness, source inventory, selected scalar token locators, typography roles and bounded component models. Each locator selects a scalar via a JSON pointer or one capture on one pinned source line. This is a reviewed adapter, not an automatic parser of arbitrary CSS or TypeScript.
3. Compile against the source snapshot:

   ```sh
   node scripts/compile-figma-projection.mjs input.json source-snapshot output/brand
   ```

   The output is typed DTCG JSON, a normalized projection and native MCP/plugin entry points. Colors support hex, RGB, HSL and numeric OKLCH. OKLCH is projected to sRGB; clipped colors are disclosed and need visual comparison. Rem dimensions require an explicit 16px assumption. Shadows, gradients, CSS cascade, motion and arbitrary layout are not compiled.

   For the local-plugin route, create a development plugin in Figma and keep its assigned `id`. Put the generated `.plugin.js` at `code.js` beside that plugin's manifest. The portable manifest fields are `api: "1.0.0"`, `main: "code.js"`, `editorType: ["figma"]`, `documentAccess: "dynamic-page"`, and `networkAccess: {"allowedDomains": ["none"]}`. A manifest example without the assigned ID is configuration material, not an already installed plugin. The receipt is returned to the caller/logged; save it outside the Figma document. The MCP adapter does not use unsupported plugin-data writes.
4. Inspect the target file before execution. Read the `figma-use` skill before every `use_figma` call; use the library-building skill for native components. Execute one brand in its own file. Separate ink/paper inputs into single-mode collections on Starter. Exact fonts must be installed/available; preflight fails without substitutes.
5. The adapter creates a uniquely named additive page, a local variable collection, text styles, editable color components, bounded action variants and desktop/phone review instances. It binds editable label properties and records source/component mappings. It never changes existing nodes, publishes a library or enables Code Connect. Existing pages return `EXISTS_UNVERIFIED`; partial failures return created IDs rather than a success claim.
6. Save the execution receipt outside the Figma document. Read back variables/aliases, text fonts, component properties, instances, dimensions and missing glyphs; visually inspect the full 1440 and 390 frames. Compare against the owning implementation. Native execution and property tests remain distinct from pixel and runtime parity. Do not publish until accepted. A partial failure or existing projection requires canvas inspection before retry; receipts include implicitly created instance descendants for scoped recovery.

The compiler checks local byte identity and declared Git blob identity. It does not independently prove commit membership, component API semantics, font licensing or CSS cascade. Those must come from the authenticated source review. A dated projection is immutable review material, not a hand-maintained second token authority. Change the source or adapter, regenerate and review a new revision.

## Components and templates

Start with one implemented family per product. Map exact module/export, props, size and actual states; excluded stubs and missing states belong in the backlog. Static reference markup is a migration candidate, not a complete interactive library. Do not fabricate loading, disabled or error behavior because a Figma variant can be drawn.

Use Figma to compose templates from these owned components: a marketing page, an editorial page and an app task with empty/loading/success/failure states. Reuse the owning repository's tested package and existing template studio. Keep authentication, authorization, billing, storage, secrets and data models product-owned. A canvas-to-code capture is review context; production code must reuse the actual component API. Figma Sites can serve a suitable marketing use case; production app behavior remains in the product repository.

## Preview binding and acceptance

Use the existing Git-connected Vercel project. Do not create another project to test a design. Normalize authenticated Vercel evidence to `{source, observed_at, deployment:{id,state,target,repository,commit,project,url}}`; use the exact deployment URL and Git metadata, not the latest alias.

```sh
node scripts/verify-preview-binding.mjs expected.json deployment-receipt.json
node scripts/validate-interface-foundations.mjs --help
```

The binding validator requires a READY preview and matching owner/commit/project. Its result is `IDENTITY_BOUND_ONLY`, not a release verdict. Run the owning product's journey tests and the existing interface foundation inspector against that same deployment. Inspect desktop/phone, keyboard, zoom/reflow, delivered fonts, reduced motion, errors, empty states, export fidelity and honest action destinations. Preserve availability, functional behavior, user value, design distinction and commercial sustainability as separate verdicts under `evals/product-outcome-release-standard.md`.

The validator checks the supplied evidence; it does not contact Vercel, authenticate a receipt, prove freshness or distinguish every project/branch alias syntactically. Populate `url` from the authenticated deployment response's `url` field and retain the original API evidence privately. Do not populate it from an alias list.

Protected previews require the product's existing automation access. Do not expose bypass tokens or weaken deployment protection. Preview evidence stays private where necessary. New source validation is covered by this repository's existing `npm test` CI; this playbook does not claim downstream product workflows have been installed.

## Skills used at the decision point

| Task | Route |
| --- | --- |
| Brand direction or ambiguity | Owned brand pack + brand constitution/strategy; human decision for identity changes |
| Source extraction and external references | Design-system extractor + visual research and direction; abstract useful patterns, record source and rights |
| Native Figma foundations | Figma use + generate library; discover existing assets before creating |
| Implement an accepted flow | Figma design to code + owning product components |
| Type, assets and interactions | Typography art direction + font licensing; motion and interaction only where it explains state or hierarchy |
| Release review | World-class web release + independent verifier + product outcome standard |
| Code Connect | Figma Code Connect after native IDs and compatible plan are verified |

Installed skills are routed narrowly. External skills and community libraries accelerate research; they do not change the brand authority or grant redistribution rights.

## Account and promotion boundaries

Local collections/components are useful on Starter. Publishing shared libraries requires an appropriate paid plan; Code Connect currently requires Organization/Enterprise with Dev or Full seat. Check current official plan documentation before any purchase. Quota exhaustion leaves native execution blocked; prepare the package, then obtain browser fallback approval if the connector cannot execute. Do not upgrade, change permissions, merge, publish identity or promote production as a side effect of setup.

Rollback the bounded code change by reverting its commit. For an unaccepted Figma run, inspect the saved receipt and remove only the objects it created after confirming scope. A source projection is not production promotion. This workflow complements the portfolio experience/template contract and committed-byte exporter integrated through the portfolio design consolidation. Source export and native execution retain separate evidence.
