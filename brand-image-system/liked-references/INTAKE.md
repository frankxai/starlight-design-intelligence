# Intake

How a liked site, Instagram save, or cover becomes a catalog entry.

## Drop zone

`C:\Users\frank\brands\image-system\liked-references\inbox\`

Slack Hermes cannot read channel files while fetch returns 403. Codex and local Hermes **can** read this folder.

Do not search Desktop / Pictures / Downloads / Phone Link. Drop copies here.

## Entry rules

1. One URL or local file per entry.
2. `why` is specific (layout, type, motion, photography) — not “looks premium”.
3. `do_not_copy: true` for third-party work. Deconstruct principles; never clone.
4. Instagram: store canonical post/profile URL, not a phone screenshot, once known.
5. Product covers we own (e.g. Agentic Coding OS) may be local_path + brand_unit.

## Who can ingest

| Actor | Allowed |
| --- | --- |
| Hermes Slack | Add URL entries if Frank pastes links. Cannot hash Slack binaries on 403. |
| Hermes Agent / Codex | Read inbox files with `vision`, write catalog patch, run validator. |
| Humans | Drop files, paste handles, approve public use. |

## Validator

```text
python brand-image-system/liked-references/validate.py
```
