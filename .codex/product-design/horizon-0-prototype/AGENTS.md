# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable Horizon 0 decisions

- The selected visual target is the refined `Context-First Run` mock.
- Run mode must not reserve persistent space for recent screens; recent screens and lifecycle actions open on demand from the active screen switcher.
- The live encounter is the primary content. Initiative occupies roughly two-thirds of the workspace and quick capture/reference occupy the remaining third.
- Dice and timer remain immediately available in a compact bottom utility dock instead of full-height widgets.
- Quick capture is raw and immediate; Quick Reference is prepared, structured, and glanceable.
- Prepare exposes tool library, layout controls, configuration, and structural actions. Run removes that chrome and protects layout while leaving live tool actions available.
- The Horizon 0 prototype must cover create/resume, rename, duplicate, delete with undo, template choice, Prepare/Run transition, quick capture, and the core tool-set decision.
