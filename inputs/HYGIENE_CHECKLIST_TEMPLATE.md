# Hygiene Checklist Template (Reusable Across Projects)

## Requirement Traceability
- Add each new ask to Request Log with status.
- Reflect product-facing requirement updates in PRD.
- After implementation, update HLD and LLD with architecture/detail changes.
- Add release notes entry to Change Log.

## Delivery Discipline
- Validate runtime and lint/type errors before commit.
- Keep commits scoped and named by release/patch intent.
- Tag baseline releases (e.g., vX.Y.Z).
- Push branch and tags together.

## Documentation Discipline
- Keep keyboard shortcuts and UX behavior docs current.
- Record data model changes (JSON schema/fields) explicitly.
- Note migration/compatibility behavior for old data formats.

## QA Discipline
- Verify primary happy path.
- Verify keyboard/touch accessibility behavior.
- Verify import/export and reset/session controls.
- Verify responsive layout on narrow and wide screens.

## PR Discipline
- Include summary, user impact, changed files, and test notes.
- Ensure docs are updated in same PR.
