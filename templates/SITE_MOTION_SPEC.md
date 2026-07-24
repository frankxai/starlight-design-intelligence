# Site Motion Specification

Complete this before implementing meaningful site or app motion.

## Context

- Brand and surface mode:
- Repository and route:
- Recipient:
- Primary task:
- Experience thesis:

## First Read

Within two seconds:

- What this is:
- Who it is for:
- Hero object or state:
- Primary action:
- Trust signal:

## Motion Thesis

- Named job:
- What becomes easier to understand:
- What becomes more memorable:
- Why a static treatment is insufficient:

## Still-Frame Gate

- Static composition:
- Hero object:
- Stable anchor:
- Supporting elements:
- What stays still:
- What is removed:
- Verdict and reviewer:

## Beat Sequence

1. Setup:
2. Trigger:
3. Primary move:
4. Secondary support:
5. Hold:
6. Resolution:

Record initial, active, and resting state for every affected element.

## Timing and Control

- Duration or scroll range:
- Easing or spring:
- Stagger budget:
- Interruption behavior:
- Loop behavior:
- User control:

## Runtime

- Chosen runtime:
- Why this is the lightest qualified runtime:
- Fallback:
- Components and assets:

## Mobile and Reduced Motion

- Mobile re-composition:
- Reduced-motion behavior:
- Information that remains visible:
- Static replacement:

## Performance and Accessibility

- Layout-shift risk:
- Paint/composite risk:
- Focus and keyboard impact:
- Pause/stop requirement:
- Budget and measurement:

## Required Proof

- desktop first/final frames;
- mobile first/final frames;
- reduced-motion state;
- decoded, ordered initial/active/resting frame sequences for desktop and mobile;
- exact CSS viewport and device-pixel-ratio metadata for every sequence;
- at least 0.1% decoded-pixel change between adjacent shipped-motion frames;
- two matching, time-separated reduced-motion frames;
- implementation checks;
- preview URL.
