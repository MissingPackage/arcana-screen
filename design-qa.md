# Design QA — Horizon 2 recovery

Date: 13 July 2026  
Reference viewport: 1487×1058  
Sources: Combat, Social, Exploration and Narrative images in `.codex/product-design/horizon-0-prototype/reference/`.

## Comparison evidence

Combined source/implementation comparisons are stored in `.codex/product-design/recovery-audit/`:

- `04-combat-comparison.png`
- `08-social-comparison.png`
- `09-exploration-comparison.png`
- `10-narrative-comparison.png`

The implementation was re-inspected after functional recovery at the same viewport. Mobile and tablet reflow were also inspected at 390×844 and 768×1024.

## P0–P2 disposition

- P0: none open. All four Focuses render and the core live-session paths are operable.
- P1: none open. Focus continuity, persistence, capture review, destructive confirmations/recovery, turn/round state and mobile Focus access are working.
- P2: none open. The source hierarchy, navy/parchment system, typography, utility dock, Focus-specific context and reference content are represented. The mobile header overlap discovered during QA was fixed and re-verified.

## Remaining P3 polish

- Exact pixel density and spacing can be tightened further at very wide desktop sizes.
- Combatant and NPC identity art remains icon-based because no production avatar asset set is available in the repository.
- A few copy and micro-icon choices differ from the exploratory source while preserving the same hierarchy and behavior.

final result: passed
