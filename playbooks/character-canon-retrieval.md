# Character canon retrieval

Load identity evidence before character generation. This protocol governs retrieval and provenance; it does not approve new brand identities, change the existing brand packs, or imply downstream adoption.

## Source routing

For Mini Frank, his companions, vendor mascots or brand-character studies, use the owner's installed `mini-me-storyboard` skill. Read its `references/character-canon-index.json` and relevant `references/character-registry.json` records. Use the actual bundled images at the paths in the index; never depend on another conversation's temporary attachment path.

When the private skill is unavailable, resolve the authorized private source-of-truth index or content/asset registry through the caller's connected source. This public repository contains only the retrieval protocol: no private asset bytes, Library IDs, or authorizations. Read `playbooks/content-asset-atlas.md` for portfolio asset relationships.

## Authority and status

- Preserve the approved likeness and cast source sheets plus the identity bible.
- Keep native first-party artwork, generated external renditions, custom companions, new brand candidates, and harness instruments as separate classes.
- Treat candidates as candidates until explicit owner selection. Do not introduce a new Arcanea character into story canon through a generated image.
- Resolve character, edition, role, provider/model, harness, and brand separately. Visual stories are not runtime or release evidence.
- Apply the current owning brand pack and repository design contract. Dated source snapshots remain evidence, not a replacement for current authority.

## Retrieval receipt

Before generation, record:

```json
{
  "reference_revision": "2026-10-09.2",
  "character_ids": ["host.frank", "custom.nilo"],
  "assets_loaded": ["mini-frank-model", "mini-cast-model"],
  "asset_hashes_verified": true,
  "output_class": "approved-canon-continuity",
  "integration_status": "not_asserted"
}
```

Only report `asset_hashes_verified: true` after comparing actual bytes to the index. If the asset is missing or its hash fails, recover the exact archived source or report the missing reference. Never generate a plausible substitute and describe it as canon.

When the installed skill supports it, run `python scripts/resolve_character.py --character <stable-id> --verify` from that skill's root, inspect the returned files, and attach them to the generation call. The resolver returns status as well as paths so a visually attractive proposal cannot silently become an approved identity.

## Production development

For turnarounds, acting, brand-angle or motion development, also load the installed skill's production-foundations reference and run its resolver with `--production` when supported. Selected development studies remain separate from approved identity anchors. A static pose sheet or 2D timing prototype is not a rig, articulated animation, or release-ready video. Follow the current brand's logo and motion contracts; generated mascot art cannot establish a vector logo master.

## Cross-runtime adoption

A file's existence is not enforcement. Repository agents need a scoped `AGENTS.md` hook; skill-capable agents need the installed retrieval-first skill; other runtimes need the same index loaded at task startup. Existing sessions may need to reload their instructions. Log the retrieval receipt with each generated result.

This protocol preserves the existing release gates and rights policies. It does not publish vendor mascots, approve public usage, install desktop pets, or claim every portfolio repository has adopted the hook.
