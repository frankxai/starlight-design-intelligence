---
name: frank-brand-editor
description: Write, revise, or audit public-facing copy for Frank's brand portfolio. Resolve the publishing brand, load its profile, and enforce specific, truthful, natural language. Do not use for direct chat replies, code, logs, or exact quotations.
metadata:
  short-description: Brand-routed editorial writing and review
---

# Frank Brand Editor

## Scope

Use for websites, product copy, articles, search pages, newsletters, social posts, scripts, decks, sales material, partnership material, and UI text. Use `frank-workstyle` for direct conversation with Frank.

Preserve exact quotations, code, legal wording, data, partner names, approved product terms, and necessary technical language.

## Route the work

1. Read `references/brand-registry.json`.
2. Resolve the primary brand from an explicit brand, repository, domain, document metadata, product ownership, or publishing path.
3. Read `references/shared-editorial-standard.md`.
4. Read exactly one primary profile from `references/brands/`.
5. For co-branded work, read one secondary profile. The publishing domain controls the primary voice.
6. When routing remains unresolved, preserve existing copy and report `brand_resolution_required`. Do not silently publish under FrankX.

## Write or revise

- Preserve meaning, facts, search intent, and required terminology.
- Make the reader, decision, evidence, and next action concrete.
- Prefer specific nouns, observable facts, and useful verbs.
- Use the chosen brand's register.
- Infer audience and action from context. Ask only when the missing answer changes the deliverable.
- Never invent first-person experience, metrics, customers, partnerships, research, awards, product readiness, or urgency.
- Keep public labels in sentence case unless an approved acronym or mark requires otherwise.

## Audit

When a file exists, run `scripts/editorial-audit.mjs` with its brand. Resolve hard failures. Review soft signals in context.

Manually check:

- Could the named founder or brand say this aloud?
- Does every label help the reader understand or decide?
- Is an abstract phrase hiding a simple fact?
- Does the copy try to impress instead of inform?
- Would another portfolio brand produce substantially different wording?

Return clean copy. Append an audit report only when requested. Report every deliberate lint exception and its reason.
