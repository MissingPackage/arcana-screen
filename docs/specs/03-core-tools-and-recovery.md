# Core tools and recovery specification

## Session Notebook

- Stores title, structured sections and lightweight emphasis/list/link formatting.
- Autosave state is visible but not visually dominant.
- Focus transitions never replace the notebook.
- Blank, editing, saved and storage-error states are explicit.

## Quick Capture

- One text field, no required metadata.
- `/` focuses capture unless another editable control has focus.
- Submit records wall-clock timestamp.
- Review supports edit, keep, delete and promote to notebook.
- Empty submissions do nothing and do not create timestamps.

## Quick Reference

- Stores concise prepared text and labeled HTTPS links.
- Invalid URLs produce inline errors and preserve the draft.
- Opening a source does not change the active Screen or Focus.

## Dice

- Supports standard notation, quantity, modifier and advantage/disadvantage.
- Invalid notation produces an inline actionable error.
- Result includes total and legible breakdown.
- No dice history is required for this recovery scope.

## Timer

- Stores configured duration, remaining value, running state and absolute end timestamp.
- Background suspension and reload calculate from wall-clock time.
- Pause freezes the correct remaining duration.
- Reset restores configured duration.
- Completion is announced visually and semantically without requiring sound.

## Recovery

- Persisted state has an application schema version and per-tool/context versions.
- Migrations are deterministic and unit-tested.
- Invalid payloads are rejected without overwriting last known good data.
- Export contains all Screens, Focus state and settings.
- Import provides validation and preview before merge/replace.
- At least one local recovery snapshot can be restored.

## Test clock

All timer, timestamp and snapshot tests use an injected/fake clock. Tests MUST NOT depend on real one-second waits.
