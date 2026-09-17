# Image Model Router — Reverified 2026-08-17

Model choice is per asset role, not a global winner.

| Lane | Best current role | Receipt rule |
| --- | --- | --- |
| Codex `image_gen` | premium source stills and reference-aware edits available inside the active Codex task | record `runtime-best-available` unless the tool exposes a named model |
| OpenAI GPT Image 1.5 | API image generation/editing, high-quality output, transparency, and reference-preserving composition | record exact API model and settings |
| xAI Grok Imagine Image 2.0 | 1K/2K source frames and controlled aspect-ratio variations | run an authenticated smoke test; do not substitute old `grok-imagine-image-quality` history as a current receipt |
| Google Nano Banana Pro (`gemini-3-pro-image`) | complex visual tasks, multi-reference brand consistency, and precision control | use when the executing harness proves access |
| Google Nano Banana 2 (`gemini-3.1-flash-image`) | fast scalable variations with 4K and reference consistency | use for breadth after the master direction is approved |
| Deterministic renderer | all logos, titles, claims, UI, charts, status, prices, and channel crops | always preferred for semantic/public layers |

Official capability references:

- OpenAI Images API: https://developers.openai.com/api/reference/resources/images
- xAI image generation: https://docs.x.ai/developers/model-capabilities/images/generation
- Google Gemini image generation: https://ai.google.dev/gemini-api/docs/image-generation

Current local receipts:

- Codex image generation: available; a new Arcanea codex source was produced in this experiment.
- Grok standalone CLI: installed but unauthenticated.
- Hermes xAI OAuth: worked historically in the audited session; not treated as current until a new smoke test succeeds.
