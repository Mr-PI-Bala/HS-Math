# Product Requirements Document (PRD)

## Product
HS Math Flashcards (static browser app)

## Vision
Provide a high-impact, low-friction study tool for middle school and high school math where Core Mastery concepts are prioritized first and Optional depth appears only after diminishing-return threshold.

## UX Guiding Principle
- Maintain visual context and perspective stability.
- Avoid dynamic layout/window/context jumps that cause distraction or eye strain.
- Flashcard area is the kingpin and should retain the dominant share of screen space.
- Supporting controls remain compact and consistent in location.
- Canonical principles source: inputs/PRINCIPLES.md

## Audience
- Middle school learners
- High school learners
- AP track learners
- Parents/teachers/tutors

## Platform Constraints
- Static app in browser
- Codespaces-compatible
- Works on iPad Safari and Chromebook
- No authentication
- No cloud services
- No database
- Progress is locally saved, export/import driven
- Repository file cfg/progress.json is source-of-truth when committed

## Current Feature Scope (Implemented)
1. Deck/category-based flashcards loaded from JSON manifest.
2. Core and Optional stacked deck model.
3. Category sidebar focused on collapsible deck categories and quick deck switching.
4. Card status tracking (new/review/strong).
5. Action tracking (reviewed/skipped/marks by deck).
6. Reveal/hide answer flip flow.
7. Previous/next/skip navigation.
8. Hint ladder on question side with 3 progressive levels.
9. Answer side with steps + tip + real-world example.
10. Auto-export cadence (user-defined threshold, toggleable, persisted).
11. Export, import, and clipboard copy JSON controls.
12. Session controls: End Session (pause) and Reset Progress (clear data).
13. Keyboard navigation and legend.
14. Swipe gesture navigation on touch devices (center study area).
15. Responsive two-column study layout with right-side control rail.
16. Multiple deck families: HS, AP, MS, and bonus fun/tricks.
17. Hint ladder behavior: H/h and hint button reveal clues without flipping card.
18. Documentation governance via AGENTS.md and inputs workflow.
19. Content containment: long text is clamped within card regions with click-to-expand popup.
20. Compact hint progress badge shown next to hint button.
21. Layout density optimization to maximize flashcard area (slim sidebars, slim right rail, slim top/bottom controls).
22. Collapsible deck stacks on left category rail and collapsible grouped controls on right rail.
23. Touch-only swipe hint chip shown in center panel on first two cards with persistent dismiss option.
24. Advanced Controls panel for auto-export and swipe sensitivity tuning with device-profile auto-detect and custom override.
25. Modularized frontend assets (HTML shell + external CSS/JS) for maintainability and reuse.
26. Quality-control artifacts for deck improvement (`cfg/content_quality_rules.json`, `cfg/content_quality_metrics.json`).

## Category Coverage (Implemented)
- Algebra
- AP Algebra
- Geometry
- Trigonometry
- Pre-Calculus
- AP Calculus AB
- AP Calculus BC
- Statistics and Probability
- Financial Algebra
- Number Sense (MS)
- Pre-Algebra (MS)
- Geometry Foundations (MS)
- Math Fun Facts and Tricks

## Data Model Requirements
Each card supports:
- id (required)
- front (required)
- back (required)
- steps (optional, curated)
- tip (optional, curated)
- hints (optional, 3-level)
- example (optional, real-world)

## Core Mastery Rule
- Core card set target defaults to 14 cards per deck
- Optional cards are cards beyond Core threshold
- Optional cards are hidden by default and enabled via toggle

## Request Intake and Tracking Process
- Every new ask must be appended to inputs/REQUEST_LOG.md with status.
- PRD should capture user-facing requirements and outcomes.
- After implementation, HLD and LLD must be updated.
- Change summary must be recorded in inputs/CHANGELOG.md.

## Open Enhancements Backlog
- Expand hand-crafted hints/steps/tips/examples across all core cards (highly desirable).
- Add robust undo stack details to exported progress if required.
- Optional analytics views per category over time.
