# Shell and design acceptance specification

## Visual sources of truth

All Run states use the same ArcanaScreen design system and are compared at the 1487×1058 source viewport.

| State | Source |
|---|---|
| Combat | `.codex/product-design/horizon-0-prototype/reference/selected-run-target.png` |
| Narrative | `.codex/product-design/horizon-0-prototype/reference/focus-narrative.png` |
| Social | `.codex/product-design/horizon-0-prototype/reference/focus-social.png` |
| Exploration | `.codex/product-design/horizon-0-prototype/reference/focus-exploration.png` |

## Shared visual language

- Deep-navy command header and utility dock.
- Warm parchment content plane with subtle paper texture.
- Muted gold reserved for current position, active Focus and primary live action.
- Cinzel for brand and section headings; Inter for controls and content.
- Phosphor outline icons or the closest matching supplied icon; no emoji or improvised glyphs.
- Thin separators, 8px radii, minimal shadow and no nested card grid.
- State is communicated by text/shape/position as well as color.

## Header contract

The header contains, in order:

1. ArcanaScreen brand;
2. on-demand Screen switcher;
3. Prepare/Run segmented control;
4. saved state;
5. layout-protection state;
6. overflow actions.

Recent Screens and destructive lifecycle actions open on demand. They never reserve permanent Run space.

## Run composition

- The viewport is a cockpit, not a vertically scrolling widget marketplace.
- The primary live task and universal context remain above the fold at the desktop reference viewport.
- Quick Capture sits immediately above the bottom utility dock or in the top of the context column, as shown by the selected Focus source.
- Dice and Timer remain immediately available in the bottom dock in every Focus.
- Run hides setup forms unless the control is itself a live action required by the selected Focus.

## Prepare composition

- Prepare uses the same header and design tokens.
- It exposes the tool library and structural controls without replacing the active Screen.
- Focus content can be configured, but live state remains intact.
- Entering Run returns to the same Focus and relevant scroll position.

## Responsive contract

### Desktop 1280px and above

- Preserve the source hierarchy and multi-column composition.
- Utility dock remains visible and does not cover primary actions.

### Tablet 768–1279px

- Reflow to a single main column with context following the hero surface.
- Focus selector, capture and utilities remain reachable without horizontal scrolling.

### Phone 390px

- One column, no global horizontal overflow.
- The active live action, capture and current Focus remain reachable.
- Utility controls wrap into touch-sized rows.
- No content is hidden solely because it does not fit the desktop composition.

## Design QA gate

For every Focus:

1. capture reference and implementation at the same viewport and equivalent state;
2. combine them side-by-side;
3. record P0–P3 mismatches;
4. fix all P0/P1/P2 findings;
5. repeat until `design-qa.md` says `final result: passed`.
