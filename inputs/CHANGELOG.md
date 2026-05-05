# Change Log

## [Unreleased] - 2026-05-04
### Fixed
- ArrowLeft keyboard shortcut now navigates to previous card (was not wired).
- ArrowUp/ArrowDown now mark strong/review in one keypress (no longer require reveal first).
- Reduced overlap between top-right card status badge (NEW/REVIEW/STRONG) and hint progress indicator.
### Updated
- Keyboard legend uses compact Unicode symbols (→ ← ↑ ↓ ⇧ Spc Esc ⌫) to save space.
- Legend is split into Swipe Gestures and Keyboard Commands sections.
- Swipe gestures are supported on center study area for touch devices (up=strong, down=review, left=previous, right=skip).
- Right rail sections (Legend, Session Controls, Data Controls) are now collapsible; Legend open by default, others collapsed.
- Top controls are aligned as Category / Card Filter / Current State directly above flashcard workspace.
- Top stats now show total as Total(core, optional) for quick breakdown context.
- Left sidebar now focuses on categories only; redundant dashboard block removed.
- Left sidebar deck cards now use collapsible stack sections; active deck remains open by default.
- Auto-export cadence now uses a user-entered card threshold and persists through local save/export/import.
- Added touch-only swipe hint chip for first two cards with dismiss persistence.
- Added Advanced Controls section at bottom of right rail for geeky tuning workflows.
- Advanced Controls include auto-export toggle + interval and swipe settings in one place.
- Added auto-detect device profile (iPad/iPhone/Android/desktop) with custom override.
- Swipe sensitivity settings now expose Min Distance, Axis Ratio, and Tap Guard with explanatory guidance.
- Advanced controls persist via local save and are included in export/import payload.
- Frontend code was modularized from monolithic `index.html` into `styles/main.css` and `scripts/app.js` for easier debugging.
- Added `cfg/content_quality_rules.json` and `cfg/content_quality_metrics.json` as reusable artifacts for ongoing deck-quality cleanup.
- Added `scripts/quality_metrics.py` for per-deck/aggregate quality audits.
- Added `scripts/enhance_cards.py` for repeatable offline batch enhancement with metrics history logging.
- Advanced Controls now include buttons to export deck bundles, import enhanced bundles, and export deck snapshots.

## [v1.0.5] - 2026-05-04
### Fixed
- Clicking the next unrevealed hint slot now behaves like H/Hint button and reveals that hint.
- Out-of-order hint slot clicks keep current hidden-state behavior (no forced reveal jump).

### Updated
- PRD now explicitly documents UX stability principle (fixed context, flashcard-first space priority).
- PRD backlog marks hand-crafted card pedagogy expansion as highly desirable.
- Added dedicated principles source file (`inputs/PRINCIPLES.md`) and linked it in AGENTS/README workflow.

## [v1.0.4] - 2026-05-04
### Fixed
- Reduced left dashboard footprint by roughly 50 percent to prioritize card width.
- Reduced right control rail footprint by roughly 50 percent to prioritize card width.
- Condensed top controls into a single skinny row (Category, Card Filter, Current).
- Condensed bottom action row and keyboard hint strip to preserve vertical card area.
- Expanded effective flashcard viewport by shifting recovered space to center card area.

## [v1.0.3] - 2026-05-04
### Added
- AGENTS.md with required project instruction workflow.
- inputs/HYGIENE_CHECKLIST_TEMPLATE.md for reuse across projects.
- README PR hygiene checklist section.

### Fixed
- H/h keyboard hint trigger now works reliably without needing hint button click.
- Hint button no longer bubbles click to card flip (question side remains visible while revealing hints).
- Hint exhaustion now shows explicit guidance instead of repeated reveal behavior.
- Answer card right-panel overflow/spacing cleaned up for better readability.
- Hint/answer/example/steps/tip content now stays inside card boxes with clamped previews.
- Click-to-expand popup added for long content regions with close on outside click/Escape.
- Added compact hint progress indicator next to hint button.

## [v1.0.1] - 2026-05-04
### Added
- Inputs documentation system under inputs/:
  - PRD.md
  - HLD.md
  - LLD.md
  - REQUEST_LOG.md
  - CHANGELOG.md
- Feature/process documentation baseline for requirements traceability.
- Documentation process for new asks -> PRD/Request Log -> Implementation -> HLD/LLD updates.

### Updated
- README.md with docs index section pointing to inputs folder artifacts.

### Notes
- This is a documentation/process patch baseline on top of functional v1.0.

## [v1.0] - 2026-05-04
### Added
- Static HS Math flashcard app with browser-first architecture.
- Multi-deck support via JSON manifest.
- HS/AP/MS/bonus category coverage.
- Core + Optional stacked deck logic.
- Dashboard and per-deck progress tracking.
- Reveal/hide answer flow and status marking.
- Keyboard shortcuts and right-side legend.
- 3-level hints on question side (button + H).
- Steps/tips/examples on answer side.
- Export/import/copy progress controls + auto-export option.
- Session controls (End Session, Reset Progress).

### Data
- cfg/progress.json source-of-truth template.
- Deck schema supporting optional pedagogical fields.
