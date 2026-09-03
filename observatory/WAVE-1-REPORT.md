# First Reference Wave Report — 2026-09-02

## Result

- 17 targets registered.
- 85 selected public surfaces observed in a browser and represented by hash-only manifests.
- 81 surfaces returned usable content.
- 4 source defects retained rather than hidden: Anthropic product overview returned an empty client state, Cosmos signup returned an empty client state, and League Universe homepage plus champions category rendered 404 content.
- 11 rights-safe pattern cards: 7 approved, 1 candidate, and 3 anti-patterns.
- 11 active domain profiles, each with exactly one brand pack, exactly three original directions, and one nomination.
- 85 screenshot and HTML artifact pairs have hashes and content addresses; all remain `pending-private-storage`.

## Target coverage

| Target | Selected | Browser-observed | Usable | Source defects | Exact 1440/390/320 |
|---|---:|---:|---:|---|---|
| Linear | 5 | 5 | 5 | — | Pending |
| Stripe | 5 | 5 | 5 | — | Pending |
| Vercel | 5 | 5 | 5 | — | Pending |
| Raycast | 5 | 5 | 5 | — | Pending |
| Anthropic | 5 | 5 | 4 | product overview empty | Pending |
| Google DeepMind | 5 | 5 | 5 | — | Pending |
| Runway | 5 | 5 | 5 | — | Pending |
| Cosmos | 5 | 5 | 4 | signup empty | Pending |
| Canva | 5 | 5 | 5 | — | Pending |
| beehiiv | 5 | 5 | 5 | — | Pending |
| Kajabi | 5 | 5 | 5 | — | Pending |
| Maven | 5 | 5 | 5 | — | Pending |
| Reforge | 5 | 5 | 5 | — | Pending |
| League Universe | 5 | 5 | 3 | homepage and champions 404 | Pending |
| Circle | 5 | 5 | 5 | — | Pending |
| Luma | 5 | 5 | 5 | — | Pending |
| Othership | 5 | 5 | 5 | — | Pending |

## Access limitations

- `FIRECRAWL_API_KEY` was not configured. The unauthenticated endpoint rejected capture, so no branding bundle is claimed.
- Private R2 credentials were not configured. Raw browser bytes were not committed; pending manifests preserve hashes, byte counts, MIME types, dimensions, and content addresses.
- The available cloud browser exposed a fixed 1363 × 936 CSS viewport at DPR 1 and could not be resized. Its API did not expose reliable HTTP response status, so those manifests use `status: null` with `status_source: browser-api-unavailable`.
- Local Playwright could launch but external target navigation was blocked by the execution network policy.
- Exact 1440 px, 390 px, and 320 px evidence is therefore 0 of 255 required surface/viewports. `npm run validate:observatory -- --strict-coverage` fails with all 255 gaps.
- Menu interaction, click outcomes, and reduced-motion emulation were not available in the completed cloud pass. Resting animation/transition declarations and accessibility structure were observed, but responsive and reduced-motion findings remain low-confidence and unapproved.

## Next evidence operation

Run `npm run capture:reference -- --target=<target_id> --out=/secure/capture-staging` in an environment with browser network access. Configure Firecrawl for hybrid branding/HTML capture and R2 upload separately. Work target-by-target until strict coverage passes; prioritize Reality Architect’s selected source set only after Frank chooses its direction.
