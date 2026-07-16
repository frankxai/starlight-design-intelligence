# Hermes Maximization Plan

**Date**: 2026-07-07
**Status**: Living document — update as we execute
**Owner**: Starlight Swarm + Hermes

## Executive Summary
Hermes has the strongest architectural advantages in the entire agent ecosystem (persistent memory, skills as automatic learning, 23 specialized profiles, cron autonomy, kanban, curator). This plan turns those latent advantages into a decisive moat by making Hermes the **conductor** of the Starlight swarm, with the brand-image-system runtime as the central visual contract.

## 1. Core Principles
- Brand-image-system runtime is the single source of truth for all visual work.
- Hermes profiles replace the "default" single-profile habit.
- Automatic learning loop: every visual job feeds scores back into memory/skills.
- Hermes becomes the swarm conductor via kanban + deliberate delegation.

## 2. Profile Activation Strategy

| Profile | Role | Key Skills | Cron Ownership | Memory Focus |
|---------|------|------------|----------------|--------------|
| starlight | Swarm conductor | gencreator-swarm-evolver, kanban, delegation | Daily evolution + dispatch | Swarm health |
| arcanea | Creative execution | brand-image-system adapter, frontend-ultimate | Nightly renderer jobs | Visual QA + approved assets |
| gencreator / frankx | Core brand + CoE | agentic-passive-income, todo-discipline | Weekly strategy | 6-Pillar intelligence |
| technology-guardian | Tech pillar | coding-agents, hermes-agent, systematic-debugging | — | Renderers & infrastructure |
| strategy-guardian | Strategy pillar | research tools | Monthly research pulse | Strategic reports |
| arena-judge | Evaluation | multi-llm-arena | Continuous eval | Leaderboards |

## 3. Brand-Image-System Integration
- All visual jobs must use `media-job.json` validated against the schema.
- Raw `image_gen` tool is blocked for Tier A assets in arcanea/starlight profiles.
- Deterministic renderer (HTML/Satori/Playwright) is the default path.
- Hermes adapter files live in `runtime/adapters/hermes/`.

## 4. Automatic Learning Loop
- Every completed media job writes structured QA data to Hermes memory.
- Curator runs with `consolidate: true` to turn high-performing patterns into skills.
- Low-scoring jobs (<22/30) automatically generate "lesson" skills.
- Multi-LLM Arena scores renderers and models over time.

## 5. Swarm Coordination
- Enable `kanban.dispatch_in_gateway: true`
- Standard lanes: visual-production, strategy-deep-work, swarm-evolution, code-review
- Hermes creates media-jobs, delegates rendering, routes to approval.

## 6. Config Changes
- `curator.consolidate: true`
- `kanban.dispatch_in_gateway: true`
- Stronger memory settings
- Delegation max depth = 2

## 7. New Crons
1. nightly-visual-production (renderer jobs)
2. weekly-profile-health
3. monthly-learning-consolidation

## 8. Positioning vs Other Agents
- Hermes = Conductor + Memory + Learning Loop + Visual Production System
- Codex / Claude Code = Implementation of renderers and workflows
- Grok CLI / Antigravity = High-volume generation (after renderer proven)
- Multi-LLM Arena = Automatic judge

## Current Status (2026-07-07)
- Hermes adapter created
- First media-job.json created for FrankX social-static
- Deep audit of agent instruction files started
- This plan document initialized

**Next Actions**: Activate arcanea profile, run deeper repo audit, implement first renderer loop.