# Arcanea Brand Design System & Cinematic Guidelines

> **Foundation reset — 2026-08-17:** This pack is a legacy hypothesis, not an approved identity. Preserve canon, but do not use its dark-void palette, portal/sigil language, glows, current font defaults, or cinematic effects as automatic brand rules. The active source is `brand-image-system/foundation-reset/2026-08-17/`; begin with the Living Codex territory and a founder-reviewed black-and-white specimen. Sentence case is mandatory.

> Source of truth for Arcanea's visual universe. "Weaving cosmic threads."
> Designed for an immersive, soulful, and epic world-building experience.

---

## 1 · Mood & Aesthetic Principle
- **Core Thesis:** Arcanea is a creative operating system for world-building. Generating visitable, persistent, ownable universes with history, character rosters, custom music, and visual canon.
- **Mood:** Dark cinematic premium. Epic, soulful, wondrous, and sovereign. Think Denis Villeneuve, refined mythic fantasy, and Refik Anadol data-poetry.

---

## 2 · Color Palette (Dark Premium Arcane)
All neutrals are tinted toward the indigo and gold accent families. Avoid pure grays or unshaded blacks.

```yaml
colors:
  bg: "#05070f"              # Deep void, black with indigo bias
  bg-alt: "#0a0f1f"          # Lifted void layer
  surface: "#121826"         # Dashboard cards and panels
  fg: "#f0e9d9"              # Starlight cream / warm parchment (never pure white)
  fg-muted: "#a8a39a"        # Body copy and captions
  
  # Brand Accents
  accent-gold: "#c5a26f"     # Arcane gold — cosmic threads, sovereignty
  accent-gold-bright: "#e8d5a3" # specularity, specular highlights
  accent-indigo: "#3f2a6b"   # Void-violet — the Fabric, mystery
  accent-crimson: "#6b2a2a"  # Spark of creation, living blood of worlds
  accent-teal: "#2a5c5c"     # Star-teal — memory connections, network graph
```

---

## 3 · Typography
- **Display & Lore:** Arcanea must keep a distinct literary voice. Use Cormorant Garamond as the open production baseline while Canela, GT Alpina, and ABC Arizona Flare remain founder-gated trial candidates. Use sentence case; never default to all-caps fantasy titling.
- **Long-form Reading:** Lora is the open baseline for lore, dialogue, codex entries, and crafted editions. It may be replaced only after a real-language specimen and licensing review.
- **UI / Modern Data:** Inter for controls and compact interface copy. JetBrains Mono only for actual code, aligned data, coordinates, or canonical identifiers.
- **Portfolio Boundary:** Arcanea does not inherit Poppins as its display face or Playfair as its default editorial face. Its typography should feel like living publishing, not FrankX or Starlight in different colors.

---

## 4 · Depth, Elevation, and Atmosphere
- **Multi-plane Parallax:** Simulated 3D layering (foreground sharp, mid-ground characters, background nebulae/void moving at slower speeds).
- **Lighting:** radial gold/indigo glows breathing slowly, god rays, and floating embers/stars.
- **Forbidden Elements:** Sci-fi neon grids, cyan/magenta overload, flat drop shadows, and default AI-generated textures.

---

## 5 · Motion Signature
- **Cinematic Pacing:** Deliberate, slow reveals (0.8s – 2.0s entrances) with long breathing holds.
- **Transitions:** Domain-warp, gravitational lens, and cosmic thread weaving.
- **Camera Movement:** Dolly push, pan, and Three.js orbital sweeps on the World Graph.

---

## 6 · Video & Motion Generation Production Notes

- Use the shared asset workspace at `C:\Users\frank\starlight\assets\arcanea\`.
- Reuse `assets\arcanea\dashboard_hero_premium_upscaled.png` and `assets\arcanea\dashboard_hero_premium.mp4` before generating new visual assets.
- Arcanea prompts must inherit the cinematic language from `repos\arcanea-ecosystem\videos\arcanea-cinematic-hero\design.md`.
- Cinematic stills route to Antigravity Native (`generate_image`) and Nano Banana Pro (`nb-image` / `nb-generate.mjs`), prioritizing text/diagram accuracy, character fidelity, and filmic lighting.
- 9:16 motion proofs route to Veo native pipelines and Seedance / Kling after cost preflight.
