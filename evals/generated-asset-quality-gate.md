# Generated Asset Quality Gate

Use for generated images, logos, motion posters, video stills, social crops, and hero art.

## Required Evidence

- Final surface and dimensions.
- Asset tier and source method from `PREMIUM_ASSET_STANDARD.md`.
- Source prompt or edit instruction.
- References used.
- Brand pack used.
- Actual export inspected.

## Human Decision Gate

An automated or maker-authored score can never approve visual work. It only summarizes evidence.

- Explicit founder rejection overrides every score and sets the decision to `restart`.
- The maker cannot be the final critic of its own work.
- A candidate cannot be approved before it is compared with at least one meaningfully different direction.
- For multi-brand work, the logo-off recognition test and color-swap test are mandatory.
- Record `keep`, `kill`, and the next hypothesis from human review.

## 30 Point Diagnostic Score

- 5: first read and hierarchy.
- 5: brand fit and ownability.
- 5: craft quality, composition, type, spacing, lighting, and crop.
- 5: accessibility, contrast, responsive crop, and reduced-motion support if relevant.
- 5: accuracy, provenance, and lack of artifacts.
- 5: usefulness for the intended surface.

The score is diagnostic, not dispositive. It is useful only after human alignment on the territory.

## Outcome

- 26-30: eligible for human approval.
- 22-25: iterate once with a targeted change.
- 0-21: restart from brief and references.

Any explicit human rejection: restart regardless of score.

## Taste Failure Conditions

Restart when any of these is true:

- The brand can be swapped with another owned brand by changing color and logo.
- The work relies on an inherited AI trope rather than a brand-specific idea.
- Typography is generic, poorly matched, or used as uppercase technical decoration.
- The composition is a recolored template, dashboard cosplay, or a collection of status chrome.
- The candidate has no memorable behavior when the logo is removed.
- A technically clean export is being used to rationalize weak art direction.

Tier D decorative filler, cheap inline SVG hero art, generic 3D primitives, fake UI, and uninspected AI media cannot be approved as primary premium assets.

## Logo Addendum

Approve only after:

- Vector mark works at 16px and 32px.
- One-color version works.
- Lockups are defined.
- Rendered or 3D versions are clearly applications.

## Video And Motion Addendum

Approve only after:

- Still frame works without motion.
- One motion idea is named.
- Reduced-motion fallback exists.
- Text and UI remain stable.
