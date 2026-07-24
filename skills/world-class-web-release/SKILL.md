---
name: world-class-web-release
description: "Use for any high-value website, landing page, homepage, partner page, product surface, brand experience, or redesign where language, typography, imagery, motion, implementation, and production proof must feel distinctive and human. Also use when upgrading a web-design quality system or release gate."
---

# World-Class Web Release

World-class is a release property, not a styling adjective. A surface passes only
when its language, composition, type, imagery, motion, engineering, and production
evidence tell one coherent story.

## Required Sequence

1. **Reconstruct context.** Read the repository contract, brand pack, existing
   surface, source material, prior decisions, and known constraints. Name the
   recipient, their knowledge state, the job of the surface, and the consequence.
2. **Capture current truth.** For a redesign, capture the existing desktop and
   mobile states. For a greenfield route, capture the host site's desktop and
   mobile context. Gather real workflows, artifacts, quotations, results, and
   authorized imagery. Stop when a referenced existing surface cannot be captured.
3. **Write the experience thesis.** State one recipient, job, promise, primary
   action, signature proof, and intended feeling.
4. **Compare exactly three directions.** Each must materially differ in
   composition, typography, imagery, interaction, and motion posture. Select one
   before implementation.
5. **Build the static composition.** Resolve hierarchy, pacing, typography, proof,
   responsive behavior, and conversion before motion.
6. **Pass editorial articulation.** Use `skills/editorial-articulation/SKILL.md`.
   Read every sentence aloud. Reject name-swappable or taxonomy-led copy.
7. **Earn motion.** Use `skills/motion-and-interaction/SKILL.md`. Motion must
   orient, explain, confirm, reveal causality, or create one brand memory.
8. **Compare and verify.** Capture desktop, mobile, interactions, and reduced
   motion. Test accessibility, reflow, loading, performance, links, claims,
   privacy, analytics, and failure states as applicable.
9. **Separate responsibility.** Maker, verifier, and approver are distinct for
   public flagship releases.
10. **Prove production.** Record commit, checks, preview, production URL,
    post-deploy verification, the paths covered by the evidence, and exact rollback
    in the release manifest. Generate this receipt after deployment. Keep the
    manifest outside the production commit—such as a CI artifact or a later
    receipts commit—because a commit cannot contain its own SHA. Store blocking
    evidence beside the manifest and
    content-address every artifact with SHA-256, byte size, MIME type, and
    dimensions when applicable. Shipped motion requires decoded, ordered PNG frame
    sequences with distinct initial, active, and resting states, exact CSS
    viewport/DPR metadata, at least 0.1% decoded-pixel change between adjacent
    frames, and a separately sampled reduced-motion stability sequence; a filename,
    URL, or unchecked media container is not proof.
    Font-file checks establish only the container
    signature. Computed-font reports and responsive specimens establish that the
    intended family and weights actually rendered. Remote URLs are references, not
    release evidence.

The manifest must validate against
`schemas/web-release-evidence.schema.json`. It records three distinct direction
artifacts, item-level scores, reviewed-copy hash, selected font and computed-font
proof, required engineering reports, production commit, and rollback evidence.

Validate it:

```bash
npm run validate:release -- path/to/release-evidence.json --repo-root /path/to/owning-repo
```

## Hard Stops

Do not build, merge, or promote when an applicable condition is true:

- an existing URL has no current desktop and mobile capture;
- recipient evidence is invented, inferred as fact, or copied from generic language;
- a named partner surface lacks privacy and consent classification;
- the first viewport hides the person, product, workflow, or offer;
- typography has no role, specimen, source, license, or mobile proof;
- motion has no named job or reduced-motion behavior;
- proof consists only of claims, repository names, frameworks, or diagrams;
- mobile is merely stacked desktop;
- the same identity made, verified, and approved the release;
- production cannot be inspected or rolled back.
- the production receipt is embedded in the production commit it claims to prove.

## Output

Return the experience thesis, selected direction, working preview, changed
artifacts, editorial/visual/type/motion/accessibility/performance/privacy/
engineering evidence, independent verdict, production proof, and rollback.

Do not substitute a plan, score, CI result, or attractive screenshot for the
complete release.
