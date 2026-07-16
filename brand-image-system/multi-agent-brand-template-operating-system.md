# Multi-Agent Brand Template Operating System

Created: 2026-07-02

Purpose: align Codex, Claude Code, MCP tools, Antigravity, Hermes, Grok CLI, browser capture, Figma, Canva, Remotion, and image generation around one repeatable brand, design, social, website, infographic, and asset workflow system.

## Executive Decision

The answer is not "better prompts." The answer is a shared brand template runtime:

```text
Portfolio source of truth
  -> Brand pack
  -> Workflow pack
  -> Media job
  -> Tool route
  -> Deterministic template renderer
  -> Visual QA and evidence
  -> Approval and learning
```

Every agent should load the same source files, generate from the same job schema, write artifacts into the same local mirror, and prove outputs with the same QA gates. Agent-specific files such as `AGENTS.md`, `CLAUDE.md`, `GROK.md`, Antigravity instructions, Hermes job templates, and MCP resource definitions should be generated from the canonical runtime instead of hand-maintained independently.

## External Research

No single public GitHub repo solves exactly this problem: multi-brand, multi-agent, multi-channel visual strategy with website, social, infographic, image generation, and approval workflows. The right setup combines mature patterns from design systems, design tokens, visual testing, and agent orchestration.

Use these as references:

- W3C Design Tokens Community Group Format: https://www.designtokens.org/tr/drafts/format/
  - Relevant pattern: platform-agnostic JSON tokens, references, groups, metadata, and interchange between tools.
- Style Dictionary: https://styledictionary.com/info/tokens/
  - Relevant pattern: one token source transformed into platform-specific code outputs.
- GitHub Primer: https://primer.style/product/
  - Relevant pattern: foundations, primitives, components, patterns, icons, and contribution governance in one product design system.
- Shopify Polaris: https://polaris-react.shopify.com/
  - Relevant pattern: foundations, content, patterns, components, tokens, and icons tied to a specific product/business context.
- IBM Carbon Design System: https://carbondesignsystem.com/
  - Relevant pattern: open source design system with code, design tools, resources, human interface guidance, and community governance.
- Storybook visual testing: https://storybook.js.org/docs/writing-tests/visual-testing
  - Relevant pattern: visual baselines and pixel review as a normal part of component and UI QA.
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/
  - Relevant pattern: agents, handoffs, guardrails, MCP tool use, sessions, human-in-the-loop, and tracing.
- LangGraph: https://docs.langchain.com/oss/python/langgraph/overview
  - Relevant pattern: durable, long-running, stateful workflows with persistence, human-in-the-loop, memory, and observability.
- Microsoft AutoGen: https://microsoft.github.io/autogen/stable/
  - Relevant pattern: event-driven multi-agent systems and conversational single/multi-agent application patterns.
- CrewAI: https://docs.crewai.com/
  - Relevant pattern: crews, flows, guardrails, memory, knowledge, observability, and human-in-the-loop triggers.

Interpretation: design-system repos teach how to make taste reusable; token tools teach how to make style portable; visual testing teaches how to prevent regression; agent frameworks teach how to coordinate handoffs and guardrails. Starlight needs a local system that combines all four.

## Local Audit

### What Already Exists

The local estate already has strong ingredients:

- `C:\Users\frank\starlight\repos\AGENTS.md`
  - Estate-wide rules now point cross-brand media work to this brand image system.
- `C:\Users\frank\starlight\repos\starlight-agent-config\core\estate\repo-estate.control.json`
  - Canonical local estate manifest and lane policy.
- `C:\Users\frank\starlight\repos\design-agent-standards`
  - Premium asset standard, agentic design loop, outcomes, image/logo best practices, evidence schema, validator.
- `C:\Users\frank\starlight\repos\starlight-design-intelligence`
  - Design operating system, brand packs, evals, anti-slop checks, generated asset quality gate, skills.
- `C:\Users\frank\starlight\repos\starlight-design-intelligence\brand-image-system`
  - Current canonical image system, brand operating units, source map, social channel matrix, benchmark plan, governance, monthly strategy.
- `C:\Users\frank\starlight\repos\_intelligence`
  - Premium web OS, brand worlds, page/scene intelligence, agent checklists, visual QA prompts.
- `C:\Users\frank\starlight\repos\agentic-ops-hub`
  - Multi-brand agent operating system, social team OS, social image workflow docs, Slack approval channels, ops ledger.
- `C:\Users\frank\starlight\repos\agentic-creator-os`
  - Cross-platform adapter patterns for Claude Code, Grok, Antigravity, Cursor, Windsurf, Gemini, and generic context files.
- `C:\Users\frank\starlight\repos\gencreator.ai`
  - Brand Social System with deterministic contracts, route/API, template sheet, MCP exposure, tests, and design-loop evidence.
- `C:\Users\frank\starlight\repos\AnimeLegends`
  - Deep brand/design research, AnimeLegends-specific visual language, social templates, and media/IP systems.

The GitHub org count is larger than the older local audit: `gh repo list frankxai --limit 300` returned 295 repos on 2026-07-02. The local multi-brand doc referenced 267 repos from 2026-06-18. The repo estate manifest should be refreshed before any new broad governance migration.

### Main Gaps

1. The standards are strong, but too much is still prose-only. Agents need machine-readable brand and workflow contracts.
2. There is no single generated adapter layer for Codex, Claude Code, Grok CLI, Antigravity, Hermes, and MCP. Multiple instruction files exist, so drift is likely.
3. Brand pack coverage is incomplete. FrankX, SIS, Arcanea, and Vibeclubs have central packs; GenCreator and AnimeLegends have strong local brand docs but should be compiled into central runtime packs. AI CoE, Agentic Income, Reality Architect, Research, Tooling/OSS, and incubators need normalized packs.
4. Workflow types are not yet formalized as reusable templates across social, website, header, infographic, carousel, OG image, video source frame, deck, and proof capture.
5. The overlay failure happened because exact text/layout was created as a utility overlay, not as a designed template renderer. Generated image tools should not be asked to create exact text, charts, claims, UI, or diagrams.
6. Tool benchmark results are not mature enough. Hermes should remain blocked for image generation until backend and verified output path exist.
7. Visual QA exists, but it is not forced uniformly by generated adapter files, hooks, or CI.
8. Generated assets, prompt logs, approval packets, benchmark outputs, and approved deploy assets still need stricter folder rules.

## Target Architecture

Keep the current canonical location:

```text
C:\Users\frank\starlight\repos\starlight-design-intelligence\brand-image-system
```

Add the runtime layer inside it:

```text
brand-image-system/
  README.md
  source-map.md
  brand-operating-units.json
  social-channel-matrix.csv
  agent-governance.md
  tool-benchmark-plan.md
  multi-agent-brand-template-operating-system.md
  runtime/
    schemas/
      brand-pack.schema.json
      workflow-pack.schema.json
      media-job.schema.json
      qa-evidence.schema.json
      agent-adapter.schema.json
    brands/
      frankx/
        brand.json
        tokens.tokens.json
        voice.json
        prompts.json
        examples.json
        do-not.json
      sis/
      arcanea/
      gencreator/
      animelegends/
      ai-coe/
      agentic-income/
      reality-architect/
      research-intelligence/
      tooling-oss/
    workflows/
      social-static/
      social-carousel/
      short-video/
      website-hero/
      website-header/
      infographic/
      og-image/
      product-proof/
      deck-slide/
      motion-source-frame/
      brand-identity/
      research-to-content/
    adapters/
      codex/
        AGENTS.fragment.md
      claude-code/
        CLAUDE.fragment.md
      grok-cli/
        GROK.fragment.md
        grok-media-job.md
      antigravity/
        instructions.fragment.md
      hermes/
        media-job-template.json
      mcp/
        resource-contract.md
        tool-contract.md
    renderers/
      social-card/
      carousel/
      website-hero/
      infographic/
      og-card/
      proof-deck/
    qa/
      visual-scorecard.md
      crop-checks.md
      text-and-claim-checks.md
    benchmarks/
      tool-results.csv
      model-notes.md
```

Keep working artifacts outside Git:

```text
C:\Users\frank\brands\image-system
  jobs/
    2026/
      07/
        <job-id>/
          brief.md
          media-job.json
          prompts.md
          source/
          generated/
          overlays/
          crops/
          screenshots/
          evidence.json
          review.md
          approval.md
  approved/
  rejected/
  benchmarks/
  reports/
```

Only approved, inspected, publication-ready assets move into a brand repo, usually under that repo's `public/`, `assets/`, or campaign-specific content folder.

## Brand Pack Contract

Every brand needs both human-readable docs and a compiled machine-readable pack.

Minimum files:

```text
brand.json
tokens.tokens.json
voice.json
prompts.json
examples.json
do-not.json
```

Minimum fields:

- `brandId`
- `brandOperatingUnit`
- `canonicalRepoPaths`
- `audiences`
- `positioning`
- `voice`
- `visualPrinciples`
- `colorTokens`
- `typeTokens`
- `layoutTokens`
- `motionTokens`
- `imageDirection`
- `socialRules`
- `websiteRules`
- `infographicRules`
- `claimRiskRules`
- `approvalRoute`
- `doNotUse`
- `exampleArtifacts`
- `sourceDocs`
- `updatedAt`

The compiled pack should not replace the existing `brand-packs/<brand>/*.md` docs. It should make those docs executable by agents and renderers.

## Workflow Pack Contract

Every workflow should declare what the asset is for, which renderer or tool route is allowed, what output sizes are required, what QA gates apply, and how approval works.

Core workflow packs:

| Workflow | Primary Use | Production Route | QA Gate |
| --- | --- | --- | --- |
| `social-static` | Single post image, quote card, proof card | Deterministic HTML/Satori/Figma/Canva layout plus optional generated source frame | crop, text legibility, brand fit, 30 point score |
| `social-carousel` | LinkedIn/Instagram/X document story | HTML/SVG/Figma/Canva/deck renderer, PDF and PNG export | V2 social confidence 90/100, slide QA, source/claim review |
| `short-video` | Reels/Shorts/TikTok source plan | storyboard, Remotion/browser capture/Grok image-to-video only after approved source frames | hook, subtitles, crop, AI disclosure, approval |
| `website-hero` | First viewport visual | real product proof, generated poster, browser capture, WebGL only with fallback | desktop/mobile first read, asset tier A/B/C, 26/30 |
| `website-header` | Section header or campaign banner | deterministic layout plus generated or captured media | responsive crop, no overlap, no fake text |
| `infographic` | Systems, architectures, diagrams | code/SVG/Figma/Canva/diagram renderer, not raw image-gen text | factual accuracy, source labels, readable text |
| `og-image` | Open Graph/social preview | deterministic branded template | 1200x630 crop, text safe area, brand source |
| `product-proof` | Real proof from app/workflow | browser screenshot, Vercel preview, app capture | real artifact, no fake UI, provenance |
| `deck-slide` | Sales/investor/teaching slide | deck renderer/Figma/Slides | title hierarchy, export inspection |
| `motion-source-frame` | Still frame used for animation/video | generated poster or renderer frame | still-frame score before motion |
| `brand-identity` | Logo/mark/exploration | vector-first, image-gen only for exploration/application | 16px/32px, one-color, lockups, no render-only identity |
| `research-to-content` | Source-backed post/guide | research brief -> claim labels -> content pack -> renderer | source freshness, claim risk, approval |

## Agent Alignment Model

Every agent must consume the same five-layer contract:

```text
1. Estate context
2. Brand pack
3. Workflow pack
4. Media job
5. QA and evidence gate
```

Agent adapters should be generated from the runtime:

- Codex
  - Reads `AGENTS.md`, selected brand pack, selected workflow pack, and media job.
  - Owns file organization, deterministic rendering, critique, validation, and final handoff.
- Claude Code
  - Reads generated `CLAUDE.fragment.md` plus repo-local `CLAUDE.md`.
  - Good for implementation, copy/system reasoning, and long-running repo-specific builds.
- Grok CLI
  - Reads generated `GROK.fragment.md` and `grok-media-job.md`.
  - Used for image/video exploration only when job spec, output path, and QA route are explicit.
- Antigravity
  - Reads generated `.antigravity` instructions, MCP rules, allowlist, and protocol.
  - Used for fleet-style work only if it can write evidence and obey folder rules.
- Hermes
  - Dispatches jobs and status, not unverified creative claims.
  - Image generation remains blocked until backend and verified output path exist.
- MCP
  - Exposes brand packs, workflow packs, media jobs, and approved asset registry as resources.
  - Write tools require artifact paths, prompt/source logs, and evidence.
- Figma/Canva
  - Preferred for editable social templates, brand kits, and designer-facing systems.
- Browser/Playwright/Remotion/Satori
  - Preferred for exact text, charts, UI, screenshots, OG images, carousels, and infographics.
- Image generation
  - Preferred for art-directed source frames, posters, campaign worlds, and mood/source imagery.
  - Not allowed for exact public text, charts, code snippets, UI labels, numbers, or brand logos.

## Folder Rules

Use this routing:

| Artifact | Canonical Location |
| --- | --- |
| Strategy, governance, schemas, workflow packs | `starlight-design-intelligence\brand-image-system` |
| Brand markdown source | `starlight-design-intelligence\brand-packs` or repo-local brand docs listed in `source-map.md` |
| Local generated media, prompt logs, evidence | `C:\Users\frank\brands\image-system` |
| Approved web assets | Relevant brand/site repo, after QA and approval |
| Agent runtime configs, skills, hooks | `starlight-agent-config` or generated adapters from this runtime |
| Slack approval proof | `agentic-ops-hub` packet and relevant Slack channel |
| Private runtime state | `C:\Users\frank\.starlight`, not Git |

Never create a second random image system in another repo. If a repo needs local brand assets, it should point back to this source of truth and import only approved assets.

## Activity Streams

Use the same stream model for social, website, headers, infographics, and reusable assets:

```text
Signal
  -> Intake
  -> Brief
  -> Brand/workflow classification
  -> Direction board
  -> Source frame or product proof
  -> Deterministic composition
  -> Crop/export set
  -> Visual QA
  -> Approval packet
  -> Publish/manual ship
  -> Learning note
```

Recommended streams:

- `signals`
  - AI lab news, product proof, repo launches, customer questions, platform changes, performance data.
- `briefs`
  - One scoped job, one brand, one workflow, one audience, one desired surface.
- `production`
  - Source frames, screenshots, code renders, Figma/Canva frames, Remotion exports.
- `reviews`
  - Critic notes, crop checks, visual score, claim risk, brand fit.
- `approvals`
  - Human decision packet: approve, approve with edits, revise, hold.
- `published`
  - Final URLs, deployed assets, scheduled/manual publish records.
- `learning`
  - What worked, what failed, prompt/tool notes, reusable template improvements.

For Slack, keep planning in `#social-command`, carousels/proofs in `#social-carousels`, final approvals in `#social-approvals`, design critique in `#design-intelligence`, and brand-specific decisions in the relevant brand room.

## Quality Gates

Minimum gate for every important visual/media asset:

- Brand operating unit selected.
- Brand source read.
- Workflow pack selected.
- Tool route selected.
- Asset tier declared.
- Prompt/source/capture route logged.
- Actual export path exists.
- Actual export inspected.
- Crops checked for intended surface.
- Exact text rendered deterministically.
- Generated image contains no fake text, broken logo, fake UI, or hallucinated claims.
- Score recorded using `OUTCOMES.md`.
- Approval route recorded.

Ship rules:

- Important visual assets: ship only at 26/30 or higher.
- Social carousel candidates: route to approval only at 90/100 or higher per current Social Media Team OS.
- Below 22/30: restart from brief and references.
- 22-25/30: iterate once and document the issue.
- Logos: vector-first, never accepted as only a rendered/generated image.
- Hermes image generation: blocked until backend and first verified output path exist.

## Implementation Roadmap

### Phase 1: Runtime Foundation

1. Add JSON schemas for brand pack, workflow pack, media job, QA evidence, and agent adapter.
2. Compile existing central packs for FrankX, SIS, Arcanea, and Vibeclubs into `runtime/brands`.
3. Import GenCreator and AnimeLegends into central compiled packs without deleting their repo-local docs.
4. Add workflow packs for `social-static`, `social-carousel`, `website-hero`, `website-header`, `infographic`, and `og-image`.
5. Create one deterministic renderer for social card and OG image using HTML/CSS plus Playwright or Satori.

### Phase 2: Adapter Generation

1. Generate `AGENTS.fragment.md`, `CLAUDE.fragment.md`, `GROK.fragment.md`, Antigravity instructions, Hermes job template, and MCP resource contract from the same runtime.
2. Add a hook-doctor check that verifies repo instruction files point to the canonical brand image system.
3. Add a compliance validator that fails a media job when output path, prompt/source log, score, or crop check is missing.

### Phase 3: Workflow Coverage

1. Add carousel renderer and proof deck export.
2. Add infographic renderer with exact text and diagram constraints.
3. Add website hero/header renderer and crop checker.
4. Add product-proof capture workflow for Vercel/local app screenshots.
5. Add short-video storyboard and source-frame workflow, with Remotion/Grok only after still-frame QA.

### Phase 4: Benchmark And Learning

1. Run a fixed benchmark across Codex image generation, Grok CLI, Antigravity native image generation, Figma/Canva, browser capture, Remotion, and any configured Hermes backend.
2. Score by brand fit, artifact rate, text handling, prompt controllability, reproducibility, crop quality, and time/cost.
3. Store results in `tool-benchmark-results.csv`.
4. Update router defaults monthly based on actual outputs, not tool reputation.

### Phase 5: Portfolio Refresh

1. Refresh the GitHub/repo estate registry. Current GitHub org scan shows 295 repos, while older docs mention 267.
2. Classify every active repo by Brand Operating Unit, Shared Service, incubator, or archive candidate.
3. Add missing brand packs for AI CoE, Agentic Income, Reality Architect, Research/Mind Intelligence, Tooling/OSS, and approved incubators.
4. Create a monthly strategy report that links approved/published assets, high-performing templates, rejected patterns, and next-month production bets.

## What To Do Next

The next best implementation move is not another overnight image batch. It is to build the first renderer-backed loop:

```text
FrankX social-static + website-header
  -> compiled brand pack
  -> workflow pack
  -> media-job.json
  -> HTML/CSS renderer
  -> Playwright export
  -> crop check
  -> evidence.json
  -> approval packet
```

Once one brand/workflow loop works end to end, clone the pattern to SIS, Arcanea, GenCreator, and AnimeLegends. That will make every future image, infographic, website header, carousel, and social pack much more consistent than asking each agent to improvise.
