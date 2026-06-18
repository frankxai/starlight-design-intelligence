# Arcanea Brand Design System & Cinematic Guidelines

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
- **Display & Lore:** High-contrast elegant serif (Playfair Display / Serif). 72px – 140px. Generous tracking on all-caps; lowercase for intimate narratives.
- **UI / Modern Data:** Inter or JetBrains Mono. 28px – 42px. Used for code readouts, numbers, and nodes.
- **Voice / Captions:** Inter, slightly tightened, 22px – 28px. High legibility on dark backgrounds with subtle glow.

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

## 6 · Higgsfield Production Notes

- Use the shared workspace at `C:\Users\frank\starlight\higgsfield\`.
- Reuse `assets\arcanea\dashboard_hero_premium_upscaled.png` and `assets\arcanea\dashboard_hero_premium.mp4` before spending new credits.
- Arcanea prompts must inherit the cinematic language from `repos\arcanea-ecosystem\videos\arcanea-cinematic-hero\design.md`.
- Cinematic stills route to Nano Banana Pro, Soul Cinematic, or Cinema Studio Image depending on whether text/diagrams, character fidelity, or filmic lighting is primary.
- 9:16 motion proofs route to Seedance 2.0 or Kling 3.0 only after cost preflight.
