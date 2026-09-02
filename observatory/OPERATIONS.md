# Observatory Operations

## Capture

```bash
npm run capture:reference -- --target=linear --out=/secure/capture-staging
```

The output directory must be outside the repository. With `FIRECRAWL_API_KEY`, auto mode combines Firecrawl v2 HTML/branding with browser inspection. Without it, Playwright is the fallback. Credentials are read only from the environment and must never be committed.

Install the pinned browser once with `npx playwright install chromium` in the capture environment.

The capture command creates content-addressed raw files and manifests in external staging. Upload raw files to private R2 at their `sha256/<prefix>/<hash>.<ext>` addresses, add the private `r2://` URI to each manifest, and only then import reviewed metadata. If storage is unavailable, retain `pending-private-storage`; never add the raw file to Git.

## Validate and retrieve

```bash
npm run validate:observatory
npm run validate:observatory -- --strict-coverage
npm run index:observatory
npm run check:freshness
```

The ordinary validator checks schema integrity, provenance, hashes, rights, ownership, brand alignment, directions, pattern status, and the raw-binary boundary. Strict coverage additionally fails until every selected surface has 1440 px, 390 px, and 320 px manifests.

## Refresh

1. Keep the five surface roles stable or review their replacements in the registry.
2. Capture all three exact viewport states.
3. Inspect menus, interaction, motion, reduced motion, and accessibility structure.
4. Upload raw evidence privately or retain pending manifests outside Git.
5. Update facts and inferences separately; never raise confidence without evidence.
6. Review anti-patterns and category saturation.
7. Rebuild the retrieval index and run all tests.
