# HS-Math Principles

## Purpose
Canonical, evolving principles for UX and engineering decisions in this repository.

## UX Principles
- Maintain visual context and perspective stability.
- Avoid dynamic layout/context jumps that cause eye strain or distraction.
- Flashcard is the kingpin and should receive the dominant share of usable space.
- Supporting controls remain compact, consistent in location, and predictable.
- Long content should stay inside its box by default and expand only on deliberate user action.

## Interaction Principles
- Keyboard and pointer actions should be parity-aligned where practical.
- Progressive disclosure should be explicit (for example hints 1 -> 2 -> 3).
- Out-of-order actions should not produce surprising jumps.
- Status/action feedback should be concise and non-blocking.

## Engineering Principles
- Keep data editable as local JSON/markdown-friendly structures.
- Prefer deterministic behavior over clever but unstable UI transitions.
- Optimize for maintainability: clear state flow, predictable handlers, explicit docs.
- Every user ask must be traceable in Request Log, PRD, HLD, LLD, and Change Log.

## Promotion Path To Default Environment
- Project-local source of truth: this file (`inputs/PRINCIPLES.md`).
- Project instructions entrypoint: `AGENTS.md` references this file.
- Cross-project seed: `inputs/HYGIENE_CHECKLIST_TEMPLATE.md` and this principles format should be copied into new repos.
- Personal persistent memory: key reusable rules are stored in `/memories/` for future sessions.