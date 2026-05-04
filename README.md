# HS Math Flashcards

A lightweight, browser-based flashcard app for high school math. No frameworks, no database, no authentication — just HTML, CSS, and vanilla JS.

## Quick start (Codespaces)

```bash
python3 -m http.server 8080
```

Then open the forwarded port 8080 in your browser (Codespaces will prompt you, or find it under **Ports**). The app loads `index.html` at the root.

> The app must be served over HTTP (not opened as `file://`) so it can `fetch()` the JSON decks.

## Running locally

Any static file server works:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code: install the "Live Server" extension and click "Go Live"
```

## Project layout

```
index.html          # The entire app (single file)
cfg/
  manifest.json     # Lists every deck file
  progress.json     # Single source of truth for committed progress
  decks/
    ...13 deck JSON files (HS/AP/MS/bonus)
inputs/
  PRINCIPLES.md     # Canonical UX/engineering principles for this project
  PRD.md            # Requirements and feature scope
  HLD.md            # High-level architecture
  LLD.md            # Low-level implementation details
  REQUEST_LOG.md    # Running list of asks and statuses
  CHANGELOG.md      # Versioned change tracking
  HYGIENE_CHECKLIST_TEMPLATE.md # Reusable process checklist for other projects
AGENTS.md           # Project instruction policy
```

## Documentation workflow

All new asks are tracked in `inputs/REQUEST_LOG.md`, reflected in `inputs/PRD.md`, and after implementation the design docs are updated in:

- `inputs/HLD.md`
- `inputs/LLD.md`
- `inputs/CHANGELOG.md`
- `inputs/PRINCIPLES.md`

## PR hygiene checklist

Before merging, confirm all are done:

- Request captured in `inputs/REQUEST_LOG.md`
- Requirement reflected in `inputs/PRD.md`
- Architecture/design updates in `inputs/HLD.md` and `inputs/LLD.md`
- Release notes updated in `inputs/CHANGELOG.md`
- README user docs updated if controls/flows changed
- Errors checked for touched files

## Progress workflow

Progress is stored in **localStorage** during your session. To persist it across devices or commits:

1. Click **⬇ Export** — downloads `progress.json`
2. Copy/move it to `cfg/progress.json` and commit
3. On a new device, click **⬆ Import** and pick `cfg/progress.json`

Auto-export supports a user-editable interval value (default `5` completed actions).
That interval is saved in local state and included in exported/imported JSON.

## Reading long content

Hints, answers, examples, steps, and tips are visually clamped inside the flashcard for layout stability.

- If text is long, it shows an ellipsis-style preview.
- Click that region to open an expanded popup.
- Click outside popup or press `Esc` to close.

## Utility tools

Top-right utility buttons provide fast access to:

- Desmos calculator popout
- TI-84 emulator popout
- Teacher interview gotchas popup

Note: Browser popup blockers may need to be disabled for these popouts.

## Adding or editing cards

Edit any file in `cfg/decks/` directly — they're plain JSON:

```json
{
  "deck": "Algebra",
  "description": "...",
  "cards": [
    { "id": "alg-016", "front": "Question text", "back": "Answer text\nMultiline works too" }
  ]
}
```

To add a new deck:
1. Create `cfg/decks/mydeckname.json` following the same format
2. Add an entry to `cfg/manifest.json`

## Card statuses

| Status | Meaning |
|--------|---------|
| **New** | Not yet reviewed |
| **Review** | Needs more practice |
| **Strong** | Confident — well understood |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Reveal / next card |
| `→` | Skip card |
| `←` | Previous card |
| `↑` | Mark Strong |
| `↓` | Mark Review |
| `Shift + ↓` | Next category |
| `Shift + ↑` | Focus category picker |
| `H` | Reveal next hint level |
| `Esc` | Hide answer |
| `Backspace` | Undo last action |
