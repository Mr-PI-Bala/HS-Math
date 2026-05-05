# High-Level Design (HLD)

## Architecture
- Single-page static web app in index.html
- Data-driven decks from cfg/manifest.json and cfg/decks/*.json
- Local state persisted to localStorage
- User-managed durability via export/import JSON with cfg/progress.json repository sync

## Major Subsystems
1. Deck Loading
- Fetch manifest
- Fetch each deck JSON
- Build in-memory deck registry

2. Study Engine
- Queue builder by category + status filter
- Core/Optional partitioning
- Current card renderer
- Flip/hint/review/strong/skip transitions

3. Progress Engine
- Card status persistence
- Deck-level action counters
- Undo support for recent action
- Auto-export action threshold handling (user-configurable cadence)
- Persisted advanced control preferences for touch/auto-export behavior

4. UX and Navigation
- Sidebar focused on deck categories
- Toolbar with aligned category + card filter + current state above flashcards
- Top stats row includes total plus core/optional split
- Left and right rails consume full workspace height below top stats row
- Left sidebar deck cards are collapsible stacks (active deck open by default)
- Right rail for grouped controls and legend with collapsible sections
- Right rail Advanced Controls group for device profile and swipe tuning
- Keyboard mapping for high-speed operation
- Touch swipe mapping for iPad/tablet operation on center study area
- Touch-only onboarding hint chip for swipe actions (first two cards, dismissible, persisted)
- Device-profile auto-detect with user override (iPad/iPhone/Android/desktop/custom)
- Hint interaction policy where hints do not force answer reveal

5. Pedagogy Layer
- Right-side answer scaffold: steps and memory tip
- Front-side hint ladder: 3 progressive hints
- Real-world example rendering under answer
- Falls back to generated guidance when handcrafted fields absent
- Overflow-safe clamped presentation with click-to-expand detail panel

## Security and Privacy
- No auth
- No remote data storage
- Local browser persistence only
- User controls export/import artifacts

## Responsiveness
- Desktop: left category sidebar + main content + right controls
- Mobile/tablet: collapses to single-column readable flow with touch swipe support
- Dense desktop mode: side rails and control bands are intentionally slim to maximize flashcard display area

## Operational Baseline
- Version baseline tags: v1.0, v1.0.1+
- Documentation baseline maintained under inputs/
- Project governance instructions maintained in AGENTS.md
