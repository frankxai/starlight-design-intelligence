# Skills Bridge

`starlight-design-intelligence` is the canonical source. Skills installed into Codex, Claude, plugins, or product repositories are derived distributions.

## This Repo Owns

- Brand packs.
- Visual identity doctrine.
- Motion and material language.
- Brand-specific examples.
- Generated-asset evals.
- Internal/private strategy when safe to keep local.
- Runnable skills.
- Hook guidance.
- Brand routing.
- Evidence templates.
- Cross-agent runtime instructions.

## Rule

Agents read and execute the skills in this repository. A personal skill or plugin may mirror a versioned skill, but must not become a competing source of truth.

Do not copy private brand doctrine into public curation repos. If a public-safe version is needed, summarize principles without private strategy, private memory, client material, or unreleased product specifics.

## Bridge Flow

1. Agent receives a visual/design task.
2. Agent loads `skills/world-class-web-release/SKILL.md` for high-value web surfaces.
3. Agent reads the relevant brand pack here.
4. Agent chooses source, asset tier, typography, and motion posture.
5. Agent creates or updates the release-evidence manifest.
6. Agent produces, inspects, scores, independently verifies, and hands off.

## Editorial distribution

`CREATOR.md`, `editorial/`, `brand-packs/*/COPY.md`, `skills/frank-workstyle/`, and `skills/frank-brand-editor/` are canonical.

`plugins/starlight-editorial-os/` is a generated distribution for personal Codex and ChatGPT workflows. Run `npm run editorial:sync` after changing the canonical source. CI runs `npm run editorial:check` to prevent drift.

Product repositories receive thin adapters and a pinned editorial contract. Their local files declare the brand and content roots. They do not copy the full doctrine by hand.
