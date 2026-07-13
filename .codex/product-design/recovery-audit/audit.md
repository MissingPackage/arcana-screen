# ArcanaScreen recovery audit — 12 July 2026

## Scope

Compare the current main-app Combat Run experience at 1440×1024 with the selected Horizon 0 `Context-First Run` visual target, and verify whether Horizon 1/2 completion claims are supported by automated tests and functional specifications.

## Evidence

1. `01-current-run.png` — current main application, Combat screen, Run mode.
2. `02-current-vs-target.png` — current application on the left, selected Horizon 0 target on the right.
3. `../horizon-0-prototype/reference/selected-run-target.png` — approved visual source.

## Verdict

Horizon 1 and Horizon 2 should not be treated as complete. Browser smoke checks prove that selected interactions can execute, but they are not a regression suite, moderated usability tests, or design-fidelity QA against the approved target.

## Structural findings

1. The current Run layout is a vertical widget stack. The target is a fixed cockpit: initiative occupies roughly 62% of the workspace, contextual capture/reference roughly 38%, and dice/timer live in a compact bottom dock.
2. Run still exposes encounter setup and administrative controls (`Add combatant`, all setup fields, edit, reorder, remove and reset). The target reserves Run for conducting the encounter and makes the next live action visually dominant.
3. The main app does not inherit the selected target's typography, iconography, parchment content plane, spacing rhythm, row density, status treatment, header anatomy or utility dock.
4. Information hierarchy is inverted: setup forms dominate the current viewport while the active encounter and next-turn action are secondary or below the fold.
5. At 1440×1024 only two combatants fit in the current viewport. The approved target shows seven scan-friendly rows plus the next-turn action, context and utilities.

## Quality findings

1. The application package has build and lint scripts but no test script or test dependencies.
2. No application unit, component, integration or end-to-end test files are present.
3. No executable functional specifications or acceptance-test matrix exists for Horizon 1 or Horizon 2.
4. The Horizon 0 notes explicitly called its gates hypotheses ready for testing, but the roadmap later marked them approved/completed without the moderated tests listed in those notes.

## Corrective sequence

1. Reopen Horizon 1 and Horizon 2 as `implemented, not accepted`.
2. Freeze feature expansion and write executable acceptance specifications for the Screen lifecycle, Prepare/Run, Capture/Reference, Initiative and Timer flows.
3. Install the automated test harness and begin with failing tests for store transitions, persistence/recovery, timer timekeeping and critical user flows.
4. Port the selected Horizon 0 design system and Run composition into the main application, reusing the existing state model where it passes the new tests.
5. Perform same-viewport design QA against the selected target and fix every P0–P2 mismatch.
6. Only then run moderated usability gates and decide whether Horizon 1/2 can be accepted.

## Evidence limits

The visual comparison covers the current Combat Run state at the reference viewport. It does not establish full accessibility compliance, cross-browser reliability or usability. Those require automated checks plus keyboard, assistive-technology and moderated task testing.
