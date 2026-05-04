# Change Log

## [Unreleased] - 2026-05-04
### Fixed
- ArrowLeft keyboard shortcut now navigates to previous card (was not wired).
- ArrowUp/ArrowDown now mark strong/review in one keypress (no longer require reveal first).
### Updated
- Keyboard legend uses compact Unicode symbols (→ ← ↑ ↓ ⇧ Spc Esc ⌫) to save space.
- Right rail sections (Legend, Session Controls, Data Controls) are now collapsible; Legend open by default, others collapsed.

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
