# Auto-Hooks & Continuous Design Loops Blueprint (2026)

> **Canonical Location**: `C:\Users\frank\starlight\repos\starlight-design-intelligence\AUTO_HOOKS_AND_DESIGN_LOOPS.md`  
> **Repository**: `starlight-design-intelligence` (Origin: `https://github.com/frankxai/starlight-design-intelligence.git`)

---

## Executive Overview

To guarantee that **every single edit, new repository, site, or subdomain created by any AI agent** meets ultra-high-end visual standards without manual supervision, our architecture implements **Automated Pre/Post Lifecycle Hooks** and the **Adversarial Santa Loop**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATED AGENT LIFECYCLE HOOKS                    │
├──────────────────┬──────────────────────────────────┬───────────────────┤
│ Pre-Task Hook    │ Execution Phase                  │ Post-Task Hook    │
├──────────────────┼──────────────────────────────────┼───────────────────┤
│ 1. Read DESIGN   │ 1. Search UI/UX Pro Max          │ 1. Run Anti-Slop  │
│    Taste Kernel  │    (`search.py`)                 │    QA Scanner     │
│ 2. Load Font     │ 2. Apply CSS Starter              │    (`verify_anti_ │
│    Matrix JSON   │    (`CSS_ANTI_SLOP_STARTER.css`) │    slop.py`)      │
│ 3. Load Brand    │ 3. Implement Glassmorphism &     │ 2. Run Adversarial│
│    Pack Tokens   │    Mobile-First Ergonomics       │    Santa Review   │
└──────────────────┴──────────────────────────────────┴───────────────────┘
```

---

## 1. Pre-Task Hooks: Automated Context & Token Injection

Before writing any HTML, CSS, React, or Next.js code:
1. **Design Token Load**: Automatically read `CSS_ANTI_SLOP_STARTER.css` and `WORLD_CLASS_FONT_AND_TYPOGRAPHY_MATRIX.json`.
2. **Brand Pack Selection**: Resolve brand identity (`frankx`, `starlight`, `arcanea`, `agentic-income`, `ai-coe`) and load corresponding tokens from `runtime/brands/<brand>.json`.
3. **Mobile Constraints Check**: Enforce `MOBILE_FIRST_ELEVATION_STANDARD.md` fluid typography and touch target rules.

---

## 2. Mid-Execution Loop: UI/UX Pro Max BM25 Search

During design and code generation:
1. Query `ui-ux-pro-max` search script for domain guidelines:
   ```bash
   python C:\Users\frank\.gemini\config\plugins\acos-frankx\skills\ui-ux-pro-max\scripts\search.py "<style_keyword>" --domain style
   ```
2. Retrieve specific color palette, typography pairing, and stack guidelines (`html-tailwind`, `react`, `nextjs`).

---

## 3. Post-Task Hooks: Automated QA & Santa Convergence Loop

Before accepting any visual output or committing code:

### A. Automated Anti-Slop Scanner
Execute the Python verification scanner:
```bash
python C:\Users\frank\starlight\repos\starlight-design-intelligence\scripts\verify_anti_slop.py -Path <project_dir>
```
- **Score ≥ 90/100**: PASSED — Proceed to handoff.
- **Score < 90/100**: FAILED — Automatically iterate, inject `CSS_ANTI_SLOP_STARTER.css`, and re-run scanner.

### B. The Adversarial Santa Loop (`maker != checker`)
1. **Maker Agent**: Scaffolds and writes component code (Claude Code / Antigravity).
2. **Checker Agent**: Performs independent adversarial review against `DESIGN_TASTE.md` and mobile standards (Codex / Grok).
3. **Consensus**: Output is committed to main/production only after both agents reach consensus.
