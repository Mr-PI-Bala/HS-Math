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
    algebra.json
    geometry.json
    trigonometry.json
    precalculus.json
```

## Progress workflow

Progress is stored in **localStorage** during your session. To persist it across devices or commits:

1. Click **⬇ Export** — downloads `progress.json`
2. Copy/move it to `cfg/progress.json` and commit
3. On a new device, click **⬆ Import** and pick `cfg/progress.json`

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
| `S` | Mark Strong |
| `R` | Mark Review |
| `→` | Skip card |

High School Math Flash Card and Interview Prep App
