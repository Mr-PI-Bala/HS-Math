# HS-Math Gotchas

Purpose: Capture recurring implementation mistakes, their root causes, and prevention checks so fixes stay durable.

## How To Use
- Add a new entry immediately after each bug fix or regression.
- Include trigger, root cause, fix, and a concrete prevention check.
- Prefer short, testable statements over narrative.

## Entries

### 2026-05-04 - Arrow shortcuts appeared broken
- Symptom: Left/Up/Down felt unresponsive in study flow.
- Root cause: Shortcut suppression treated all `input` focus as typing context, so focused controls blocked global handlers.
- Fix: Restrict suppression to true text-entry contexts only (`textarea`, `contenteditable`, and text-like input types).
- Prevention check: With focus on category dropdown, status dropdown, and auto-export number input, verify `←`, `↑`, `↓`, `H`, `Space`, and `Backspace` all trigger study actions.

### 2026-05-04 - Up/Down required extra keypress before marking
- Symptom: Up/Down first flipped card instead of marking immediately.
- Root cause: Arrow shortcuts reused reveal-first button logic.
- Fix: Add keyboard-specific mark path for immediate mark-and-advance.
- Prevention check: On hidden-answer card, pressing `↑` marks Strong and advances in one press; pressing `↓` marks Review and advances in one press.

### 2026-05-04 - Left arrow looked dead at queue boundary
- Symptom: `←` appeared non-functional on first card.
- Root cause: Boundary condition had no feedback.
- Fix: Show explicit toast when already at first card.
- Prevention check: At first card index, press `←` and verify visible feedback appears without state corruption.

### 2026-05-04 - Utility popouts failed silently under popup blocking
- Symptom: Desmos/TI-84/interview tools did not open for some users.
- Root cause: Browser popup blocking prevented `window.open` targets.
- Fix: Use fallback behavior (new tab for tools, in-page panel for interview notes) with toast guidance.
- Prevention check: Simulate blocked popups and confirm fallback route opens with user-visible message.

### 2026-05-04 - Keyboard QA lacked visibility into captured shortcuts
- Symptom: Users reported shortcuts as "not working" even when handlers existed.
- Root cause: No direct runtime indicator of captured keys made focus/context issues hard to diagnose quickly.
- Fix: Add user-controlled shortcut-debug overlay toggle in legend panel.
- Prevention check: Enable debug mode, press each documented key, and verify on-screen capture labels match expected actions.

### 2026-05-04 - Hint count chip overlapped with status badge
- Symptom: Hint `x/y` chip visually collided with NEW/REVIEW badge on front card.
- Root cause: Tight top-right layout used similar vertical anchor for both controls.
- Fix: Reduce badge size and move it upward; nudge hint chip lower and add top spacing in hint panel.
- Prevention check: With statuses New/Review/Strong, verify no overlap at desktop and narrow widths.
