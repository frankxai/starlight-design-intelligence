# Website Asset Structures & Best Practices (per brand / Vercel site)

## General Rule
Never commit raw generated binaries to the main site repo without going through the runtime → DAM → registry → approved path.

## Recommended Structure (example for frankx.ai-vercel-website)

```
public/
  assets/
    frankx/
      2026-07-command-layer/
        frankx-command-layer-linkedin-square.png
        frankx-command-layer-og.png
        manifest.json   # { "registryId": "frankx-...", "version": "...", "usedIn": [...] }
    shared/
      brand-tokens.css  # exported from runtime tokens
    infographics/
      ...
```

## Per-Site Sync
- Use the sync script (runtime/scripts/sync-approved-to-registry.sh or Node equivalent with @vercel/blob).
- Update manifest + registry usedIn on every publish.
- Vercel Blob: Prefer for dynamic or large assets. Use serverless functions or a small sync job.

## Other Sites
- gencreator.ai, arcanea.ai, etc.: Same pattern under their brand folder.
- Always link back to central registry id for traceability and "always up to date" validation.

This keeps every website in sync with the approved, world-class foundation.
