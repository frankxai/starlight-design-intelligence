# Hermes Integration with Brand Image System

**Rule**: All visual production work must go through the brand-image-system runtime.

## When Working on Visual Assets
1. Load the brand pack from `runtime/brands/<brand>/`
2. Load the workflow pack from `runtime/workflows/<workflow>/`
3. Create and validate a `media-job.json` with `npm run validate:media`; schema-only
   validation cannot approve an asset
4. Use only allowed production routes (HTML/Satori renderer preferred)
5. Never use raw `image_gen` tool for final public text or claims
6. Write outputs under the explicit absolute `STARLIGHT_ASSET_ROOT`; stop if unset.
7. Record QA score, inspected output paths, evidence, and named human approval.
   The selected workflow's numerical ship bar is binding.

## Profile Recommendations
- Use `arcanea` profile for creative execution
- Use `starlight` profile for orchestration
- Load `brand-image-system` and `todo-discipline` skills

## Blocked Actions
- Direct generative overlays with exact text
- Bypassing the renderer for Tier A assets

This fragment should be included in any Hermes AGENTS.md or profile instructions related to visual work.
