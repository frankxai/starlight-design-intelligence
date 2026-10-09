# Design atlas reconciliation

Status: implemented read-only planning adapter; not a running designer service.

The canonical portfolio and product owners remain in `portfolio/core-surfaces.json`.
An atlas is a source-derived inventory of screen templates at one product commit,
not certification of its domain, application behavior or design quality.

## Implemented slice

`portfolio/screen-atlases/gencreator.json` records 77 App Router page templates
(70 static routes and seven dynamic templates) from the authenticated, untruncated
GitHub tree at `8d2dc80834e097c51dfdf99f5248bdb3e7657430`.
Every screen remains `source-known` and Figma `unmapped`. This is not a route crawler:
rewrites, public HTML, CMS-created pages, intercepting routes, auth states and APIs
need separate inventory and scenario evidence. A default scenario is a capture
nomination; it does not claim the route has a valid public default state.

Homepage source imports `app/components/home/HomepageClient`; `/workspace` uses
`CreationWorkspace` and hardcoded dark colors. Do not apply an EDITION LAB foundation
projection to all routes as though they already share its composition or identity.
Classify migration scope from the owning product decisions before altering a route.

## Compute affected screens

```sh
npm run design:impact -- atlas.json change.json 40 > impact.json
```

Change input:

```json
{
  "repository": "example/product",
  "base_commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "head_commit": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "files": [{"path": "app/pricing/page.tsx", "status": "modified"}]
}
```

Obtain the complete diff at exact SHAs from Git or GitHub. Preserve old paths for
renames and include removed files. GitHub compare responses cap their file list;
verify completeness against the PR file inventory or local Git before planning.
An omitted changed path cannot be detected by this adapter.

The planner checks source owner/base revision, matches exact files and contained
directory prefixes, expands shared dependencies, deduplicates screens, and nominates
1440/390 viewport captures per declared state. Unknown changes nominate the entire
inventory and block unattended execution until dependency mapping is reviewed.
New routes require inventory refresh. Dynamic templates require concrete test
fixtures. Capture-budget excess returns a blocker and nonzero CLI exit; it never
silently drops screens. It performs no network request, Figma edit, purchase,
deployment, baseline acceptance or external message.

This is a conservative manually reviewed dependency map, not complete static import
analysis. The seed maps `app/components/`, `components/` and `lib/` globally to avoid
false negative shared changes. Narrow it only after verifying real dependencies.

## Connect the loop in the owning product

1. On a PR, normalize its full file inventory and compute impact at the exact base/head.
2. Resolve the preview's deployment metadata and run `verify-preview-binding.mjs`.
3. Resolve each scenario's auth, fixture data and URL in the owning test suite. Bind
   captures to repository, head SHA, deployment, route, state, viewport and timestamp.
4. Compare screenshots in the same browser/OS/font environment. Treat visual changes
   as review signals; do not approve a new baseline because a build succeeded.
5. Review keyboard use, actual artifact creation, save/reload, recovery and export.
6. Update the observed-production section in Figma separately from proposed and
   approved compositions. Keep node IDs/file keys in a private reference ledger;
   the atlas uses opaque references after mappings have actually been verified.
7. A Figma change nominates an owning product PR. Preserve its existing component API
   and source tokens; Code Connect is an optional plan-dependent mapping adapter.

The existing GitHub CI tests this planner. Downstream triggers, webhooks, capture jobs,
private Figma mappings and recurring execution are not installed by this change.
Do not create another orchestration service to pretend those capabilities exist.

## Human quality and reuse

Use the existing brand packs and three-direction process for flagship redesigns.
Design a recognizable artifact and customer task before adding decoration. Distinguish
real control states from illustrations. Check text reflow and actual fonts; a stacked
desktop frame is not proof of mobile suitability. Native variable/components alone
do not prove a customer can complete the task.

Reuse the eight existing Lucide vectors from the prepared portfolio package, with
their license and provenance. Use shadcn/Radix or the product's existing primitives
after inspecting its implementation; no new dependency is installed here. Use
community UI kits as references unless their modification and redistribution rights
are recorded. Interface icons do not authorize new brand marks.

Sources read 2026-10-07 (Amsterdam):
- [Figma design-system guidance](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma MCP access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/)
- [Vercel environments](https://vercel.com/docs/deployments/environments)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Lucide license](https://lucide.dev/license)

## Limits and rollback

Native Figma remains quota-blocked on Starter; no new canvas or library is claimed.
The prior generated imports must be regenerated with the corrected adapter before
execution. Keep typography/gamut/runtime limits from their original source reviews.
Revert this bounded code change to remove the planner and adapter fixes; no production
site, database, account permission or brand identity is altered.
