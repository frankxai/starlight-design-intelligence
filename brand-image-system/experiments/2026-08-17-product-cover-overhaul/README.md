# Product Cover Overhaul — 2026-08-17

## Objective

Replace the failed Hermes product-visualization pass with a brand-locked, form-specific system that can produce truthful cover masters, a complete internal portfolio overview, and launch-ready derivatives without asking an image model to invent identity or product facts.

## Audited baseline

- Hermes session `20260817_112400_8870aa` did its substantive reasoning with Grok 4.6.
- xAI image output used `grok-imagine-image-quality` at 2K, not Grok 4.6.
- Four landscape source frames and ten portrait product-object images were generated.
- A separate PIL renderer produced 57 sparse covers with typed brand labels and one generic composition system.
- The generated source images were largely disconnected from the final covers.
- Baseline decision: **restart**.

Full findings: `runtime/adapters/hermes/AUDIT-2026-08-17.md`.

## System change

1. Resolve product truth, release state, product form, brand pack, canonical logo, and exact copy.
2. Choose the asset tier and visual mechanism for the product form.
3. Use real proof when it exists.
4. Use a premium image model only for source illustration or physical-artifact material.
5. Render canonical identity, public text, diagrams, status, and crops deterministically.
6. Inspect actual exports and score six dimensions out of five.
7. Write every route, prompt version, output path, score, and decision to the experiment ledger.

## Benchmark wave

The first wave deliberately tests four different forms:

| Brand | Product | Form | Primary route |
| --- | --- | --- | --- |
| FrankX | Venture Signal Sprint | timeboxed decision sprint | deterministic signal/decision instrument + canonical logo |
| GenCreator | CreatorPack / owned-work loop | versioned creator pack | deterministic source → constellation → approved artifact mechanism + canonical wordmark |
| Starlight Intelligence | Sovereign Intelligence Starter Kit | sovereign kit | existing high-quality proof media + exact kit/proof composition; no invented logo |
| Arcanea | World Bible / Project Context Kit | portable world-context kit | premium generated codex source + canonical wordmark + deterministic product chrome |

## Tracked artifacts

- `product-asset-portfolio.json`: the 47-product slate inherited from the Hermes Product Funnel OS, classified by form, release state, and required asset families.
- `prompt-system.v2.json`: versioned prompting and rendering contract.
- `experiment-ledger.json`: baseline and candidate routes, outputs, scores, and decisions.
- `design-loop-evidence.json`: premium asset gate evidence.
- `C:\Users\frank\brands\image-system\jobs\2026-08-17\product-cover-overhaul-v2\`: generated source media, canonical asset copies, editable masters, PNG/WebP exports, and overview.
- `portfolio-matrix-all-47-2560x1800.png`: the complete visual inventory with every product name, form, source status, brand, and public/validation/internal classification.

The portfolio file is complete for the 47-item catalog supplied to Hermes. It is not a claim that every repository idea or unpublished artifact in the estate has been productized.

## Release boundary

This package creates local design candidates only. It does not deploy, publish, send, price, or create checkout paths. Products marked hold, rights-blocked, or unverified remain internal-only and must not receive launch theater.
