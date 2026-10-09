# Content and asset atlas

The screen atlas needs to explain which content and image version a screen uses.
Keep that connection in portable metadata. Existing CMS, storage and learner
systems remain the owners of their data; this adapter does not replace them.

## Boundaries

- `docs/media/media-policy.md` governs storage choice: Blob/Vercel Image for new
  Vercel media, Postgres metadata, Drive recovery. A storage change needs a
  documented workload exception and measured payback.
- Product repositories own lesson/page source, rendered interfaces and learner
  state. Keep learners, emails, submissions, grades and credentials out of this
  registry. `learner_store` identifies the boundary, not a connected service.
- The public kernel contains schemas and synthetic tests. Real private
  repository captures, Figma file identities and execution receipts stay in
  their authorized private store. Do not copy an operational estate registry
  into this public repository.
- A source inspection is `source-reviewed`, not named human approval. A
  pre-existing published page may be recorded as `observed`; this is not
  permission to republish or promote new creative work.

## Records

`starlight.content_asset_atlas.v1` links stable asset/content IDs to checksummed
versions. Content versions contain their exact asset rendition references.
Release records pin content versions. Screens identify route, role, state and
viewport, with a verified Figma mapping or a concrete pending reason. Lessons
link content to objectives without storing learner records.

```sh
node scripts/content-asset-atlas.mjs validate /private/registry.json
node scripts/content-asset-atlas.mjs usage /private/registry.json
node scripts/content-asset-atlas.mjs queue /private/registry.json
node scripts/content-asset-atlas.mjs compare /private/new.json /private/previous.json /private/check.json
```

`compare` prevents previously recorded version payloads and release records
from being changed or removed. Add versions and releases; do not rebind an old
release. The only review update allowed is source-reviewed to approved, keeping
the original evidence URL and metadata while adding a named reviewer and time.
Approved records cannot be downgraded or rewritten. These are supplied review
assertions; authenticating the reviewer remains the owning release process.
Screens referenced by a historical release are immutable in full: route, task
state, role, viewport, content relationships and Figma destination. This includes
an observed release whose screen mapping is still pending. Complete that mapping
under a new screen ID and append a new release; do not rewrite the old observation.
Existing lessons whose content was released also retain their content relationship,
learning objectives, fragment and learner-store boundary. Use a new lesson ID for
changed learning behavior. Unreleased screens may complete their pending mapping.
Persist the previous baseline in version-controlled private storage.
Running `validate` without a baseline cannot establish historical immutability.
Approval evidence is a supplied record, not authenticated by this tool. A
checksum identifies bytes, but a provider URL alone does not enforce retention
or prevent replacement. Verify delivered bytes and use immutable object keys
before promotion.

`usage` derives reverse placements from versioned relationships. It does not
invent usage from file presence. It includes historical content versions, so
it is a dependency report, not a count of active live placements. `queue`
lists pending native Figma work; it does not execute MCP or simulate a sync.

## Prove a slice

1. Inspect the source manifest and named review/rights evidence. Verify source
   bytes at the owning commit and retrieve the delivered rendition checksum.
2. Record a page or lesson with its pinned source and asset references. For
   content with imported data/components, include a separately retained
   dependency snapshot: a hash of the page file is not a whole-app identity.
3. Bind the deployment's repository/commit metadata to the exact URL. Fetching
   HTML establishes an HTTP response, not browser behavior or visual quality.
4. Capture the actual desktop/mobile UI with the existing browser inspector.
   Perform the learner/customer task. Save browser evidence outside Git.
5. Inspect the Figma destination and add/update only Production references.
   Native capture and component reconstruction are distinct operations.
   Save actual file/node IDs; never guess them. Preserve Exploration/Approved.
6. Implement the selected bounded change in the owning product PR. Follow its
   checks, independent review and approval rules, then recapture and append a
   release record. Update private usage/evidence, not an unreviewed global DB.

The tool returns `REGISTRY_VALID_ONLY`. The supplied `evidence-recorded` status is
accepted only with mapping, approval and evidence fields; it remains a
declaration whose authenticity and browser/deployment proof require the
independent release process. Do not infer that structural validation attests
the release. Quota or browser failure leaves the slice incomplete.

This is a relationship adapter, not another asset registration authority.
Existing media-registration work in draft PR #35 owns local byte/VIS proof;
draft PR #41 owns Figma source projections. Neither unmerged draft is assumed
to be present. A future product adoption must consume accepted proof records
from those owners rather than bypass their gates with this metadata schema.

## Tool choice

Preserve Git-backed content when agent/technical editorial work is effective.
Pilot Payload only when recurring editorial permissions, localization or
nontechnical editing justify its runtime/database/storage/email maintenance.
Payload supports Blob and S3-compatible storage, so CMS adoption need not
force asset migration. Mature LMS adoption is a separate decision for grading,
enrollment administration or interoperability requirements. Preserve bounded
local learning when it already serves the learner job.

Calculate annual total cost as license + infrastructure + usage + review and
maintenance effort + one-time migration. Use observed bills and measured
workloads; keep engineering estimates distinct from vendor prices. Comparing
storage unit prices alone is insufficient.
