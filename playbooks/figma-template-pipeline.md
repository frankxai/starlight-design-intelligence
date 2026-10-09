# Figma templates with native implementations

Ship one editable design, one working implementation and one rights-cleared asset set for a specific user job. A rendered mockup is not a website or an app boilerplate. This playbook adds delivery requirements to the existing App Factory design contract; it does not introduce a competing product contract or template catalogue.

## Ownership and source

| Layer | Authority | Delivery |
| --- | --- | --- |
| Brand direction and common quality gates | `frankxai/starlight-design-intelligence` | Exact commit, brand pack path/hash, application mode and unresolved identity decisions |
| Product job, scope and acceptance | Product repository using the [App Factory pointers](../templates/app-factory/README.md) | Filled design contract; real CTA and critical states |
| Visual representation | Product-owned Figma collection | Variables, text styles, component properties/variants, desktop/phone compositions and editability receipt |
| Implementation and runtime | Existing product or governed template child repository | Actual components, routes, responsive rules, data/permission behavior, accessible controls and tests |
| Template catalogue | Existing portfolio or brand catalogue | Link to the implementation owner, version, rights and release evidence; no duplicated generator |
| Assets | Product-owned source and asset ledger | Exact files, immutable hashes, license notices, use/redistribution rights and accessibility treatment |

Use `npm run export:brand -- --brand <id> --out <new-directory> --revision <full-commit-sha>` to obtain committed authority bytes. Keep application projections in the implementation owner. Reconcile its existing token API and decisions before generating Figma; exported brand prose is not a complete component API. Record Figma file/node/revision identifiers in the appropriate private receipt, not this public design repository.

## Build and round trip

1. Select one user job and one native runtime. Reuse the existing implementation. For a website this may be a WordPress core-block theme or an existing Next.js site; an application must add its own routing, authentication, data, permission, error and persistence behavior.
2. Resolve brand semantics, type roles, surface mode and licensed assets from pinned source. Generate CSS/native tokens and Figma input from that source. Do not keep an independently edited color table in the Figma builder. A projection can be a review candidate without becoming a new approved identity.
3. Build Auto Layout components with meaningful names, editable text/instance properties and required states. Use actual vector sources for icons and asset slots with known crop/size rules. Raster assets may fill content slots; never flatten the whole interface into an image and call it editable.
4. Maintain a component map: Figma main component, code module/selector, props, responsive behavior, state coverage and the exact source version. Distinguish mapped tokens from verified runtime parity. A four-state Figma button does not make a WordPress link disabled or an app action permission-aware.
5. Inspect a desktop and phone flow in both tools. Test long text, keyboard/focus, contrast, touch targets, empty/loading/error/permission/offline states where applicable, reduced motion and the primary job. Retain actual exported previews, native runtime receipts and an independent verdict. Source checks and screenshots have different scopes.
6. Package design, native source, exact asset subset/notices, an example content set, editing instructions and separate evidence statuses. Test a new user completing the editing and publishing job before claiming an excellent or validated experience.

Where available, Code Connect can expose actual implementation snippets in Dev Mode. Its current access requires an Organization/Enterprise plan and a Full or Dev seat. An explicit local component map is the fallback; it must not be described as installed Code Connect. GitHub connection suggests component paths and supports mappings; it does not import every repository as an editable Figma library.

## Asset selection

| Asset class | Standard |
| --- | --- |
| Icons | One licensed vocabulary per product; exact SVG subset, consistent optical size/stroke, named action or decorative treatment, full notices |
| Typography | Approved role and actual available font; verify weight, wrapping and fallback. Record web embedding, editable-file sharing and redistribution rights separately; a font name is not a bundled font license |
| Photography, illustration and hero art | Owned or explicitly licensed, specific to the job, intentional crop and responsive renditions. Generated media follows the existing 26/30 exported-asset gate; no identity or Arcanea canon approval is implied |
| Motion | Existing brand motion language with a stated purpose, real exported review and reduced-motion behavior |
| External UI kits and admired sites | Reference evidence for a specific principle. Redistribution rights must be verified for the specific purchased/free resource and its embedded assets before editable source is included |

Finished-output rights and editable-source redistribution are separate. For each included asset record creator/source URL, acquisition or source version, SHA256, exact license and notice, commercial-output permission, editable-source redistribution permission, attribution, geometry/renditions and accessibility. Unknown rights block packaging that asset; they do not justify copying a competitor's kit. Prefer a small coherent asset set that serves the experience.

## Current bounded pilot

The existing Starlight/Arcanea Template Studio RC 0.1.0 has two WordPress launch themes, editable local launch masters, free editorial layouts and a prepared native Figma builder. Extend that package rather than inventing another studio. Its source-delivery extension connects the builder to token JSON, maps its Action and Editorial Artifact studies to actual WordPress sources and embeds the eight already licensed Lucide vectors with file-level provenance.

The Figma studies are not pixel/type/state matches for the themes. The manifest labels those gaps, including a design-only Disabled state and platform font substitutions. Live Figma execution is currently blocked by the Starter MCP quota. WordPress receipts establish only their executed scope; local PPTX editability does not establish native Canva editability. No React/Expo boilerplate, buyer outcome, commerce launch or identity approval follows from this pilot. The implementation repository for the review package remains unresolved; do not claim a proposed source-handoff path was committed.

First prove one Starlight Expert Launch collection end to end. Then extend the same component/asset map to Arcanea Author Launch, keeping its fiction/canon boundary. App shells and forms should follow only when their actual runtime and user job are selected in the existing product owner.

## Official references

- [Figma structure for agent handoff](https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/)
- [Figma MCP tools and prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [Code Connect access and workflow](https://developers.figma.com/docs/code-connect/)
- [Figma Community resource licensing](https://help.figma.com/hc/en-us/articles/360042296374-Figma-Community-copyright-and-licensing)

Access and licensing should be rechecked at adoption. Neither a listing nor an inspiration capture is approval to redistribute source.
