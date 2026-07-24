# Connected Asset Management System (DAM + Usage Tracking)

## Architecture (Foundations 2026-07-02)
- **Canonical Strategy + Registry**: starlight-design-intelligence/brand-image-system/runtime + asset-registry.json (or DB)
- **Working Mirror**: `$STARLIGHT_ASSET_ROOT/jobs/YYYY/MM/<job-id>/` plus
  `$STARLIGHT_ASSET_ROOT/approved/`. The variable must resolve to an explicit
  absolute path; no machine-specific fallback is allowed.
- **Central Visual DAM (recommended OSS)**:
  - **Immich** (self-hosted): Excellent for images/videos with AI search, facial/object recognition, albums per brand/profile/campaign. Great for browsing "used assets".
  - **ResourceSpace** (open source full DAM): Advanced metadata, permissions, collections, AI tagging. Self-host or cloud.
  - **Alternative/Desktop**: Eagle (paid, superb for creative assets, tags, smart folders) or Photoprism.
- **Website Assets**: Vercel Blob storage or each site's `public/assets/` or `app/assets/`. Never direct upload — always via approved registry entry.
- **Buckets/Storage Best Practices**:
  - Vercel Blob: For Next.js sites (frankx.ai, gencreator.ai, arcanea.ai). Programmatic upload from approved jobs.
  - S3-compatible (MinIO self-host or R2): Central raw + versions.
  - Git LFS or large file handling for repos.

## Usage Tracking (Always Up to Date)
- Every approved asset gets an entry in `asset-registry.json` (or Airtable/Notion/Supabase):
  - id, brand, workflow, jobId, filePath (local + blob url), formats/crops, score, approvedAt
  - usedIn: array of { site: "frankx.ai", profile: "linkedin/frankx", postId or slug, date, context }
- Process:
  1. Media job completes + evidence + 30-pt score → human review.
  2. Approve → register in DAM + registry with initial usedIn=[].
  3. When scheduling/posting (social or site update): Update registry usedIn entry (script or manual with PR).
  4. Sync: Cron or manual script copies approved assets to target Vercel sites / GitHub folders + updates manifest.
  5. Validation: Before publish, check registry for freshness and usage.

## Sync & Freshness
- Script example (to be built): `sync-approved-to-vercel.sh` or Node script using Vercel SDK + registry.
- Per-site best practice: `public/assets/frankx/2026-07-command-layer/` with manifest.json linking back to registry id.
- Obsidian or central doc for "Asset Usage Map" across profiles.

## Recommended Setup Steps
1. Self-host Immich or ResourceSpace (Docker easy).
2. Point local mirror approved/ to DAM ingest.
3. Implement registry as JSON first, then move to DB.
4. Vercel projects: Use @vercel/blob client in jobs or separate sync job.
5. For GitHub: Assets in LFS or referenced by URL; never commit large binaries without reason.

This ensures everything is connected, traceable, and always up-to-date. No more lost assets or stale versions.

## Quality Enforcement
Only world-class, ultra-tasteful assets (liquid glass + Vercel/GitHub craft + insightful) reach the DAM. Everything else stays in review/rejected.
