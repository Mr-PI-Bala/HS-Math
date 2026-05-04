# Change Log

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
