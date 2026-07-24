---
name: motion-and-interaction
description: "Use for premium motion and interaction design across FrankX, Starlight, Arcanea, and product UI: choreography, timing, state transitions, reduced-motion behavior, brand motion identity, and design-to-engineering handoff."
---

# Motion And Interaction

Use this skill when an interface needs to feel intentional over time. Motion should clarify state, hierarchy, causality, brand, or story. If it only adds activity, cut it.

## Workflow

1. Identify the surface: app flow, dashboard, landing page, onboarding, gallery, content page, video, or social asset.
2. Define the first read before animation.
3. Name the job of motion: orient, reveal, confirm, explain, focus, show causality, show progress, show spatial relationship, or create one brand memory.
4. Pass the still-frame gate. Do not animate a weak composition.
5. Pick the brand and surface mode.
6. Write the beat sequence: setup, trigger, primary move, support, hold, resolution.
7. Name the hero object, stable anchor, what remains still, and what the user controls.
8. Choose the lightest runtime that preserves the intent.
9. Specify timing, easing, interruption, mobile choreography, performance budget, and reduced-motion equivalent.
10. Verify actual desktop, mobile, reduced-motion, and runtime capture.
11. Score with `evals/motion-purpose-gate.md`.

## Defaults

- Product UI: short, causal, interruptible motion.
- Dashboards: animate deltas and status changes, not layout chrome.
- Launch pages: use one signature motion idea; avoid many unrelated effects.
- Arcanea surfaces: allow cinematic reveal, glyph, portal, and artifact motifs when tied to meaning.
- Starlight/SIS surfaces: use evidence, trace, signal, and constellation motifs with restraint.
- Partner/editorial pages: keep prose still; let one real artifact or causal sequence carry the motion.

## Runtime Selection

- CSS for hover, focus, simple state changes, and low-risk transitions.
- Motion for React for component choreography, presence, layout transitions, and React scroll work.
- GSAP only for authored pinned/scrubbed timelines that simpler runtimes cannot express.
- Rive for interactive vector state machines.
- Lottie/dotLottie for portable non-interactive vector sequences.
- Three.js only when 3D is central to the proposition and visually verified.
- Remotion for rendered evidence, explainers, and exact media exports.
- Generated media tools produce source material; they do not approve or finish it.

For substantial motion, complete `templates/SITE_MOTION_SPEC.md` before implementation.

## Output

Return: motion thesis, first-read diagnosis, still-frame verdict, motion map, runtime choice, reduced-motion plan, implementation tasks, required QA proof, and gate score.
