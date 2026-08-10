# Portfolio Design Toolchain Boundary

Status: canonical policy  
Last verified: 2026-08-10  
Machine-readable companion: portfolio/design-toolchain.json

## Executive decision

There is one portfolio design authority, not one visual costume.

The Empire Registry in agentic-ops determines what a brand, domain, and repository are. Starlight Design Intelligence determines how approved brands should look, move, explain themselves, and pass quality gates. Each product repository owns its local implementation contract and must pin the applicable central brand pack.

Figma, Canva, Google Drive, a DAM, and Vercel are execution surfaces. None is allowed to become an unreviewed second authority.

## What each system owns

| System | Owns | Must not own |
| --- | --- | --- |
| Starlight Design Intelligence | Brand packs, portfolio contracts, quality gates, source-of-truth tool policy | App-specific deployed code or private media binaries |
| Agentic Ops | Brand/domain/repository/lifecycle registry and exclusions | Design tokens, components, or Figma source |
| Product repositories | Local code tokens, components, implementation contracts, release evidence | Portfolio-wide brand policy |
| Figma | Per-brand foundations, component design, key flows, design QA | Raw token authority or a cross-brand mega-library |
| Canva | Brand Kits, locked content templates, decks and campaign variants | Product UI or canonical tokens |
| Google Drive | Working originals, legal/rights evidence and human operating material | Runtime public delivery or product design authority |
| Selected DAM | Approved shared media, rights/provenance, derivatives and usage | Unreviewed source drafts or code contracts |
| Vercel / Blob | Site delivery, product proof, app-owned uploads and exports | Portfolio-wide asset master library |

## Current evidence

- The central design authority, schemas, brand packs, evals, and portfolio contract mesh already exist in this repository.
- The existing FrankX workspace now has a validated one-mode foundation: four collections, 60 variables, 14 text styles, and five effect styles. Arcanea remains a separate unmodified overlay; generic vendor kits are references, not a system.
- Canva has an Arcanea Brand Kit and an organised content folder spine. It is a capable production layer but has not been established as a multi-brand product-design system.
- Google Drive contains the human Empire operating index and source/evidence material. It is the correct working-source layer, not the production delivery layer.
- The current asset registry is a control-plane seed. A connected Cloudinary account contains a small FrankX namespace and a mostly sample/pilot inventory, but it has not yet proven an estate-wide metadata, transformation, delivery, or usage-tracking workflow.
- Vercel is already an active portfolio runtime across multiple brand and product projects. Its role is delivery and release evidence, not cross-portfolio source-media authority.
- Keep Cloudinary as a controlled pilot. Do not add a second DAM or migrate media until it passes a single-brand metadata, approval, transformation, delivery, and usage-tracking proof.

## Figma boundary

Use a separate Figma visual system per active brand. Do not rename or merge the FrankX and Arcanea spaces into a global file.

The first Figma build is deliberately small. FrankX Phase 1 is complete: its foundations were created directly from the local source contract, semantic values alias primitives, scopes and WEB code syntax were validated, and styles match the documented core type/effect set.

1. Commit a generated Figma projection and provenance record that can replace the one-time bootstrap.
2. Validate one actual desktop and one mobile flow.
3. Add one high-frequency component family only after the foundation proves out.
4. Map its code API and collect visual evidence before publishing it.
5. Treat Figma changes as projections of versioned sources, not primary token edits.

Retain the current single-mode Starter-plan foundation. Select a plan supporting shared libraries and multi-mode workflows before publishing or attempting cross-brand libraries.

## Content and media boundary

Canva begins after a brand pack is approved. It produces locked templates, decks, social variants, and campaign working exports. Google Drive keeps editable originals and rights material. The selected DAM holds approved, publication-ready media and tracks each live use. Vercel serves only the assets a particular application needs.

A media asset moves through this path:

Working original and rights record -> review -> DAM plus registry -> approved transformation or site path -> recorded live usage.

## Agent workflow

1. Resolve the current Empire Registry commit and selected brand pack.
2. Identify the owning product repository and surface.
3. Change the source contract in a reviewed pull request.
4. Generate tool-specific projections rather than copying values by hand; the validated FrankX bootstrap is a transition state, not a second authority.
5. Validate actual desktop, mobile, reduced-motion, and asset-rights evidence.
6. Publish only after the appropriate human approval for brand identity, external assets, spend, or high-risk release actions.
7. Record the source commit, Figma reference where relevant, asset IDs, and release evidence.

## Icons and external references

Lucide is the default product UI icon set. Phosphor is optional for editorial use after licensing and stylistic review. Company marks must use approved originals. Reference leading design systems for pattern learning, but do not copy distinctive identity, illustrations, proprietary assets, or publish a third-party kit as ours.

## Immediate execution order

1. Keep Starlight Design Intelligence as the only cross-brand design authority; do not create another canonical repository.
2. Reconcile each product's local design source with its selected central brand pack.
3. Turn the verified FrankX Figma bootstrap into a committed generated projection and Code Connect or equivalent code-mapping pipeline.
4. Select one DAM strategy and wire its registry-to-delivery flow before bulk asset migration.
5. Enrol the current high-priority brands with the required fields in design-toolchain.json.
6. Scale Figma, Canva templates, and media delivery one brand and one real flow at a time.

## Non-negotiable rules

- No raw token is edited only in Figma, Canva, or CSS.
- No media asset is public without rights, provenance, approval, and usage metadata.
- No component matrix is built before a real product flow proves its need.
- No generic reference kit becomes an owned brand library.
- No new brand receives a full design system before its registry record and central brand pack are established.
