# v0 and native product implementation

v0 is a design and source-import workspace. Product repositories keep their code,
tokens, component APIs, state contracts and releases. This workflow extends the
existing brand handoff and experience standard. FrankX's Product Foundry keeps its
study catalogue and product roadmap.

## Prepare one brand

Export the existing committed brand handoff, then project its verified bytes into
v0 import inputs. Use new output directories outside public Git:

```sh
npm run export:brand -- --brand gencreator --revision 268aaa97f2fa9124d89c2dc5b4a6e694fab434ff --out /private/gencreator-handoff
node scripts/export-v0-import.mjs --brand gencreator --bundle /private/gencreator-handoff --out /private/gencreator-v0
```

The adapter emits `IMPORT.md`, `import-packet.json` and `v0.reference.json`.
These are review inputs. The reference configuration uses an empty starter until
v0 constructs and verifies an installable starter. A generated packet is not a
saved design system, an adopted product pin or a working application.

`v0.reference.json` is a reference draft, not a native import command. In the
Design Systems import form, enter the listed GitHub repositories and supply the
commit links, `IMPORT.md` and hashed bundle as focused inputs. Alternatively,
attach those inputs to the existing brand chat and ask v0 to resolve the pinned
sources, build the starter, and produce its documented saved-skill `v0.json`.
The adapter checks commit syntax; v0 must resolve each repository, commit and
consumer path before the import can be accepted.

`v0-imports.json` contains dated consumer inputs for six existing sites. Refresh
the product revision and reconcile its instructions before an import. The shared
handoff owns brand prose and gates; the real consumer supplies fonts, providers,
global styles, dependency versions, component APIs and working states. Do not copy
the old universal dark/glass prompt into another brand.

GenCreator's adopted July pack conflicts with its accepted Territory B decision.
The current shared `SOURCE_AUTHORITY.md` records that resolution. Preserve the
adoption pin until its product owner reviews the change. Starlight's public site,
AgenticIncome and the Academy have no adoption contract at the recorded revisions;
their packets retain the reconciliation requirement. SIS public-site ownership
is also outside the existing central handoff's registered consumer list.

## Connect and preserve existing work

Authenticate the native `https://v0.app/api/mcp` server with OAuth and choose the
intended Vercel team. Test an authorized chat-list call and confirm its billing
scope. Keep credentials in the supported credential store. A configured server,
an authenticated identity and a successfully exercised capability are separate
observations.

Inventory accessible chats, follow pagination, resolve their URLs with
`chats.getUrl`, and match actual Vercel project IDs to verified product repositories.
Keep private chat inventories in private evidence. Preserve original chats and
visibility. The older v1 catalogue and current MCP listing have different coverage;
an absent chat is not proof of deletion or automatic migration.

Import from the existing Vercel project or repository. Verify imported Git HEAD,
base branch and write ownership. Use one isolated study branch and one writer.
Record brand, source revision, existing product/design issue and review status in
chat metadata. Publishing independent chats can create extra Vercel projects;
reuse the current product project.

## Import and use a design system

Review existing saved team skills before adding one. Import the pinned shared
source, its actual consumer and focused source evidence. Figma frames are optional
references; reuse existing brand files and respect access/quota limits. Keep each
brand separate and select its skill explicitly rather than making one visual
system the cross-brand default.

Inspect the starter's real fonts, providers, CSS, dependency versions, component
props and phone states. Save the skill only after reviewing the starter and its
source resolution. Record the saved revision and source hashes. A new skill
revision does not update existing apps automatically.

## Execute the product pilot

1. Capture the current desktop and phone journey and bind the production source
   where verified. Preserve capture provenance and private artifacts.
2. Compare three materially distinct directions and the current native Next.js
   baseline. Choose for task completion, clarity and integration/recovery cost.
3. Refine the existing useful product in assigned paths. Keep source, permissions,
   durable behavior, exact-revision review and export contracts under native code
   ownership. Reuse actual components instead of pasting an untouched generated app.
4. Verify the useful journey plus missing, denied and interrupted states. Inspect
   reflow, keyboard focus, touch targets and reduced motion at the exact candidate.
5. Link chat, selected skill revision, branch, source SHA, preview and independent
   review in the existing product issue. Run that repository's release checks.
6. Promote only through the product's authorized release path. Record scoped
   production evidence and rollback; keep remaining gaps visible.

No webhook, background generation queue or additional orchestration service is
required for this workflow. Admit one bounded generation, inspect the result and
its actual usage, then decide the next action. Preserve failed attempts and stop
owned workers at handoff.

## References

- [v0 Design Systems 2.0](https://v0.app/docs/design-systems-2)
- [v0 MCP server](https://v0.app/docs/api/v2/guides/mcp-server)
- [Existing toolchain boundary](design-toolchain.md)
- [Existing experience standard](experience-standard.json)
- [Existing brand handoff exporter](../scripts/export-brand-handoff.mjs)
- [Existing product outcome gate](../evals/product-outcome-release-standard.md)
- [Existing web release gate](../evals/web-release-gate.md)
