# Publication map

Status: proposed editorial integration, not deployed pages. Existing hubs below returned HTTP 200 during the September 9 inspection. HTTP checks are not complete browser or interaction QA.

One shared evidence corpus supports distinct reader tasks. Do not duplicate an article across sites with a changed brand name.

| Brand | Verified hub | Article / guide purpose | Existing repository convention |
|---|---|---|---|
| FrankX | [Blog](https://www.frankx.ai/blog), [guides](https://www.frankx.ai/guides), [research](https://www.frankx.ai/research) | Production judgment: accepted assets, change requests, source validation and useful editorial work | `content/blog/*.mdx`; `content/guides/*.mdx` in the FrankX site repository |
| Starlight | [Lab notes](https://starlightintelligence.ai/notes), [gallery](https://starlightintelligence.ai/constellation/gallery) | Evidence: requested edits versus protected regions, explicit uncertainty, role readability | `app/notes/<slug>/page.tsx` plus `lib/notes.ts` in the commercial web repository |
| Arcanea | [Blog](https://www.arcanea.ai/blog), [gallery](https://www.arcanea.ai/gallery) | Canon and continuity: correct sources, fixed relationships, proposed appearances, creature anatomy | `apps/web/lib/blog-data.ts` and the existing blog routes |
| GenCreator | [Research](https://gencreator.ai/research), [learn](https://gencreator.ai/learn) | Practical making: prototype reference, one change at a time, reviewed publication crop | `content/research/NN-slug.mdx` with hypothesis, method, takeaway and draft metadata |

Suggested new article slugs are `image-generation-brand-benchmark`, `image-generation-character-benchmark`, `character-consistency-image-benchmark`, and `image-generation-production-workflows`, respectively. These are proposals, not verified URLs; do not link to them until deployed and checked.

## Integration cautions

- FrankX guide handling does not establish that `draft: true` hides an imported file. Verify loader behavior before copying unpublished drafts into a public content tree.
- Starlight uses explicit routes and an index; markdown frontmatter alone does not create a page.
- Arcanea's existing BlogPost schema does not provide a publishing gate merely because an editorial draft contains `draft: true`.
- GenCreator's list loader excludes drafts. Confirm direct-route behavior as well before importing unreleased material.
- Exact experimental prompts, permitted source references, selected images, alt text and review must accompany published results. A text-only summary does not complete the evidence package.
- Public character and identity selection remains separate from article preparation. Do not publish internal concepts as canon or replace an existing logo automatically.

## Secondary audiences

| Brand | Distinct useful follow-up | Current routing boundary |
|---|---|---|
| Akamoto | Persona continuity across gesture and setting | Vercel home verified; no custom domain established in this audit. Do not equate persona identity with the Arcanea mentor of the same name. |
| Energetic Income | Explain an actual offer without invented financial proof | Publication home unresolved. Agentic Income is not an established alias. |
| Anime Legends | One reviewed mascot across three story beats | Main domain live; review mascot references and target route before publication. |
| VibeClubs | Show actual shared creative progress | Main domain live; practical playbook approach fits better than generic announcement news. |
| Reality Architect | Illustrate a supplied process while keeping its diagram exact | Main domain live; separate explanatory art from factual process labels. |
| AI CoE | Where generated scenes help workshops and exact diagrams remain necessary | Academy naming/positioning needs reconciliation before a branded article. |
| Tooling / OSS | Publish reproducible preservation tests including failed attempts | Sanitize sources and release a permitted evidence package; no new domain required. |
| Starline | Establish audience and visual territory | Domain and repository unresolved; do not merge it into Starlight by name similarity. |

## Release sequence

Choose the strongest completed reader task, attach its evidence, obtain independent editorial/visual review, verify metadata and draft behavior, then deploy through the site's existing path. Check the actual article and hub link before public distribution. Record what remains untested. No checkout, final identity, performance superiority, conversion gain or revenue claim should be inferred from this qualitative pilot.
