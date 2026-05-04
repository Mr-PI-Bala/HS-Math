# Low-Level Design (LLD)

## File Map
- index.html: complete UI, state handling, rendering, keyboard and interactions
- cfg/manifest.json: list of deck file references
- cfg/decks/*.json: deck and card content
- cfg/progress.json: repository source-of-truth progress template
- AGENTS.md: project-level instruction and delivery workflow
- inputs/*.md: documentation and lifecycle tracking

## Core JS State (index.html)
- decks[]
- progressData { cards, deckStats, actionsSinceExport, lastExported }
- queue[]
- queueIdx
- revealed
- includeOptionalCards
- sessionEnded
- actionHistory[]
- hintLevel

## Queue Pipeline
1. Read selected category and status filter
2. Partition each deck into core/optional via coreCount or default 14
3. Include optional only when toggle is enabled
4. Apply status filtering
5. Reset queue index and render

## Card Rendering
Front:
- Question text
- Hint ladder panel with 3 slots
- Hint button / H key progression
- Hint reveals are non-flip actions and stay on question side
- Compact hint progress indicator near hint button
- Hint slots are clamped and expandable on click

Back:
- Question recap
- Answer text
- Real-world example footer
- Steps list on right panel
- Bold memory tip at bottom-right
- Answer/example/steps/tip are clamped with click-to-expand popup

## Layout Density Rules
- Top toolbar (category/filter/current) rendered as a slim single row above workspace.
- Left dashboard and right control rail use compact typography and spacing.
- Action buttons and keyboard hint row are condensed to preserve vertical card space.
- Primary layout objective: maximize flashcard viewport area while retaining controls.

## Interaction Handlers
- Click card: flip reveal/hide
- Hint button / H: reveal next hint level
- Strong/Review: mark and advance
- Right Arrow: skip
- Left Arrow: previous card
- Up Arrow: strong
- Down Arrow: review
- Shift+Down: next category
- Shift+Up: focus/open category dropdown
- Space: reveal then next
- Escape: hide answer
- Backspace: undo last action
- Esc closes expanded popup first, then fallback card-hide behavior

## Overflow Expansion Model
- Clamped content regions keep card layout stable.
- Clicking a clamped region opens modal-style detail panel.
- Detail panel closes on outside click or Escape.

## Persistence and Export/Import
- saveProgress() writes to localStorage
- exportProgress() writes JSON blob
- copy-export writes JSON to clipboard
- import parses uploaded JSON and normalizes schema
- reset clears progressData to defaults

## Undo Model
- actionHistory stores mark/skip actions
- undoLastAction() reverts card status and deck-level counters
- re-renders queue and dashboard after rollback

## Hand-Crafted Card Fields
- steps: string[]
- tip: string
- hints: string[3]
- example: string

Fallback behavior auto-generates when these fields are absent.
