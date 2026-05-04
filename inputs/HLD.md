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
- Auto-export action threshold handling

4. UX and Navigation
- Sidebar dashboard for category counts
- Toolbar with current category + filters
- Right rail for grouped controls and legend
- Keyboard mapping for high-speed operation
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
- Desktop: left dashboard + main content + right controls
- Mobile/tablet: collapses to single-column readable flow

## Operational Baseline
- Version baseline tags: v1.0, v1.0.1+
- Documentation baseline maintained under inputs/
- Project governance instructions maintained in AGENTS.md
