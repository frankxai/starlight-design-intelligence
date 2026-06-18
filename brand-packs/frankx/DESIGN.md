# FrankX Brand Design System & Visual Guidelines

> Source of truth for FrankX's visual identity. Dual-spectrum: Tech (emerald/cyan) and Soul (amber/gold).
> Designed for restraint, technical rigor, and clean editorial long-form content.

---

## 1 · Mood & Aesthetic Principle
- **Core Thesis:** FrankX is the personal authority brand and ecosystem funnel. The aesthetics must be clean, structured, high-restraint, and technical.
- **Mood:** Clean technical luxury. Editorial, precise, minimalist, and authoritative. Think clean grids, subtle borders, high readability, and quiet confidence.

---

## 2 · Color Palette (Dual-Spectrum Obsidian)
All neutrals are obsidian-void blacks and dark grays. Colors are divided into the Tech spectrum (active systems) and Soul spectrum (contemplative thought).

```yaml
colors:
  # Foundation
  void: "#0a0a0b"              # obsidian page background
  space: "#111113"             # primary elevated surfaces
  elevated: "#1a1a1f"          # secondary elevated cards
  border: "#1e1e1e"            # white at 8% opacity over void
  border-strong: "#2f2f2f"     # white at 15% opacity over void
  
  # Tech Spectrum (emerald + cyan) — AI & Technical Rigor
  tech-primary: "#10b981"      # emerald-500: Primary CTAs
  tech-secondary: "#06b6d4"    # cyan-500: highlights, data lines
  tech-glow: "#0f1f1a"         # emerald at 15% over void
  
  # Soul Spectrum (amber + gold) — Soulbook, Warmth, Music
  soul-primary: "#f59e0b"      # amber-500: editorial highlights
  soul-secondary: "#fbbf24"    # amber-400: warm highlights
  soul-glow: "#241b0f"         # amber at 15% over void
```

---

## 3 · Typography
- **Headings & Display:** Poppins/Outfit (bold, clean geometric). Size perfect-fourth scaled (1.333 ratio). 24px - 90px. Tight letter spacing.
- **Body & Captions:** Inter (clean readability). 14px - 18px. line-height: 1.6 - 1.7. Body text must remain highly legible over void backgrounds.
- **Data & Readouts:** JetBrains Mono. 12px - 14px. Tabular numbers for console readouts and metrics.
- **Contemplative Register (Slow-reading):** Source Serif 4/Playfair. Warmer cream ink (`#e8ddd0`). Used only on /canon/ and editorial pathways.

---

## 4 · Grid & Atmosphere
- **Obsidian Grid:** Subtle thin borders (`#1e1e1e`) with clean vertical/horizontal grid lines.
- **Restrained Glows:** Soft background radial gradients of emerald/cyan (tech) or amber/gold (soul) at very low opacity (5–12%).
- **Forbidden Elements:** Garish neon gradients, unaligned text blocks, crowded grids, and default card shadows.

---

## 5 · Higgsfield Production Notes
- Use the shared workspace at `C:\Users\frank\starlight\higgsfield\`.
- Stills for FrankX route to `nano_banana_pro` or `recraft-v4-1` (brand kits) depending on text legibility requirements.
- Video clips for UGC/Gym reels route to `soul_2` using the trained `soul_id` to maintain character consistency.
- All jobs must undergo a simulated pre-flight council review and have their job ids, result urls, and credits logged in `C:\Users\frank\starlight\higgsfield\ledger.jsonl`.
