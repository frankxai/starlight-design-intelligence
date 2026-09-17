# Mobile-First Elevation & Touch Experience Standard (2026)

> **Canonical Location**: `C:\Users\frank\starlight\repos\starlight-design-intelligence\MOBILE_FIRST_ELEVATION_STANDARD.md`  
> **Repository**: `starlight-design-intelligence` (Origin: `https://github.com/frankxai/starlight-design-intelligence.git`)

---

## 1. Mobile Quality Mandate: Zero Mobile Compromises

Over 65% of visual impressions and user interactions occur on mobile devices. A web surface or product that looks stunning on desktop but feels clumsy, cramped, or un-optimized on mobile is **unacceptable**.

Every site, app, dashboard, and landing page built across Frank's estate **MUST** pass the Mobile-First Elevation Standard before shipping to production.

---

## 2. Core Mobile UX Principles & Rules

### A. Touch Target Ergonomics (Minimum 44x44px)
- All interactive buttons, links, icons, and form inputs MUST have a minimum clickable/touchable area of **44x44px**.
- Spacing between adjacent touch targets MUST be at least **8px** to prevent accidental mis-taps.

### B. Thumb-Zone Navigation (Bottom Sheet & Floating Nav)
- Avoid hard-to-reach top-left hamburger menus on mobile viewports.
- Prefer **Floating Bottom Navigation Bars** or **Bottom Sheet Drawers** that sit comfortably within the natural thumb sweep zone.

```
┌─────────────────────────────────────────┐
│              MOBILE VIEWPORT            │
│                                         │
│   [ Hero Title & Fluid Clamp Headline ] │
│   [ Liquid Glass Product Card ]         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 🏠 Home   🔍 Search   ⚙️ Config │   │ ◄── Floating Thumb-Zone Bar
│   └─────────────────────────────────┘   │     (bottom-4 inset-x-4)
└─────────────────────────────────────────┘
```

### C. Fluid Typography Clamps
Never use fixed pixel text sizes that overflow mobile screens or break lines awkwardly. Use CSS `clamp()` fluid scales:
```css
h1 {
  font-size: clamp(2.25rem, 5vw + 1rem, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

body {
  font-size: clamp(0.95rem, 1vw + 0.5rem, 1.125rem);
  line-height: 1.6;
}
```

### D. Zero Horizontal Scroll & Overflow Protection
- Root containers (`html`, `body`, `#root`, `main`) MUST enforce `overflow-x: hidden`.
- All images, videos, and canvas elements MUST specify `max-width: 100%; height: auto;`.
- Tables and code blocks MUST wrap inside horizontally scrollable container cards with subtle scroll indicators (`overflow-x: auto; -webkit-overflow-scrolling: touch;`).

### E. Touch Feedback & Spring Compression
Mobile interactions require instantaneous visual feedback:
```css
.mobile-touch-target {
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.mobile-touch-target:active {
  transform: scale(0.96);
  filter: brightness(0.95);
}
```

---

## 3. Responsive Breakpoint Testing Suite

Before handoff, agents MUST test rendered layouts across all 5 standard viewports using Playwright or CDP Multiplexer:

| Breakpoint Name | Width | Target Device | Mandatory Check |
|---|---|---|---|
| **Mobile Compact** | `320px` | iPhone SE / Small Android | Check zero horizontal overflow, single-column stacked layout. |
| **Mobile Standard** | `375px` | iPhone 13/14/15, Pixel | Verify bottom nav thumb reach, font legibility. |
| **Mobile Large** | `414px` | iPhone Max, Galaxy Ultra | Verify glass card padding and grid column balance. |
| **Tablet Portrait** | `768px` | iPad / Tablet | Verify 2-column grid transition and navigation collapse. |
| **Desktop Ultra** | `1440px` | Mac / Monitor | Verify max container width (`max-w-7xl`) and ambient glow spotlight. |

---

## 4. Mobile QA Checklist for Agents

- [ ] Tested at `320px` and `375px` with zero horizontal scroll bar.
- [ ] All buttons and links have ≥ 44x44px touch targets.
- [ ] Primary navigation is accessible within the bottom thumb zone.
- [ ] Headings use `clamp()` fluid typography.
- [ ] Tap highlight default blue box disabled (`-webkit-tap-highlight-color: transparent`).
- [ ] Touch active scale (`active:scale-[0.96]`) implemented.
- [ ] Tested with reduced motion enabled (`@media (prefers-reduced-motion: reduce)`).
