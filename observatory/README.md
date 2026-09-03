# Design Observatory

This directory is the portfolio’s governed reference-research layer. It records what was observed, what was inferred, where the evidence came from, what rights apply, and which abstract patterns may influence an original FrankX/Starlight direction.

## Retrieval path

1. Resolve a product in `portfolio/domains/<domain_id>.yaml`.
2. Resolve its one `brand_id` in `brand-image-system/runtime/brands/` and `brand-packs/`.
3. Read only the profile’s approved `pattern_id` values.
4. Follow `observatory/retrieval-index.json` to the latest supporting `snapshot_id` metadata.
5. Use the nominated direction only after Frank selects it; keep the other two intact.

## Layout

- `registry/targets.yaml`: first-wave targets, five selected surfaces, and capture policy.
- `targets/<target_id>/target.yaml`: validated target contract.
- `targets/<target_id>/snapshots/`: hash-only snapshot manifests.
- `targets/<target_id>/extraction.yaml`: observed facts, inferences, confidence, anti-patterns, and saturation.
- `patterns/`: rights-safe abstract pattern cards.
- `source-ledger.jsonl`: append-oriented provenance and rights ledger.
- `wave-1-status.yaml`: honest coverage and access gaps.
- `selection-packet.md`: three directions and one nomination per active domain.

No competitor-derived production UI belongs here or in product repositories. Raw screenshots, HTML, crawler payloads, font files, source code, and third-party assets are prohibited from Git.
