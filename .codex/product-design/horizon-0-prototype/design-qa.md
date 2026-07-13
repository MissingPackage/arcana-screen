# ArcanaScreen Horizon 0 — Design QA

## Comparison target

- Source visual truth: `reference/selected-run-target.png`
- Final implementation screenshot: `qa/implementation-run-final-v2.png`
- Viewport: 1440 × 1024
- State: `Cripta di Vhal` · Run mode · Round 3 · `Ser Kael` active · timer at 60:00
- Full-view comparison evidence: `qa/comparison-run-final-v2.png`
- Focused header evidence: `qa/comparison-header-final.png`
- Focused context-panel evidence: `qa/comparison-context-final-v2.png`

## Findings

No actionable P0, P1, or P2 mismatch remains.

- [P3] Reference text remains slightly lighter and more compact than the generated target.
  - Location: Quick Reference condition descriptions and encounter notes.
  - Evidence: the focused context comparison shows the same hierarchy, content, and section proportions, with a slightly lighter optical weight in the implementation.
  - Impact: minor fidelity difference only; scanability and contrast remain clear.
  - Follow-up: increase reference body weight from 400 to 500 only if user testing shows the denser target is easier to scan.

- [P3] Combatant glyphs are intentionally simpler than the target’s illustrative symbols.
  - Location: Initiative combatant icons.
  - Evidence: both use circular single-color markers, while the implementation uses one consistent Phosphor icon family.
  - Impact: slightly less decorative character; interaction hierarchy and recognition remain intact.
  - Follow-up: evaluate a curated icon subset after the information model is validated.

## Required fidelity surfaces

- Fonts and typography: Cinzel and Inter are bundled locally. Display/body hierarchy, weight, line height, wrapping, and truncation were checked at the reference viewport; no blocking mismatch remains.
- Spacing and layout rhythm: header, 62/38 main split, seven-row initiative area, context column, and compact bottom utility dock match the selected composition. No body overflow exists at 1440 × 1024.
- Colors and visual tokens: deep navy, warm parchment, muted gold, slate secondary text, green health/saved states, borders, and active-state contrast map to the source. State is never communicated by color alone.
- Image quality and asset fidelity: the source contains no required raster imagery. All visible interface glyphs use one real icon library; there are no placeholder images, custom inline SVGs, CSS drawings, or emoji.
- Copy and content: screen name, mode labels, encounter state, reference headings, combatants, primary action, capture prompt, and utility labels match the selected target and remain coherent outside the mock.

## Interaction and responsive verification

Primary interactions tested in the in-app browser:

- resume the last screen;
- create from General, Combat, Blank, and Exploration template previews;
- transition from creation to Prepare and from Prepare to Run;
- open the on-demand screen switcher;
- rename and duplicate a screen;
- delete with recoverable undo;
- advance initiative while preserving encounter state;
- save quick capture into encounter notes;
- change die, roll with a modifier, start/pause/reset the timer;
- add and remove core/candidate tools in Prepare.

Responsive checks:

- 1440 × 1024: reference comparison state, no overflow, dock aligned to viewport bottom.
- 1024 × 768: primary action and utility dock remain visible; context becomes internally scrollable.
- 768 × 1024 and 390 × 844: single-column reflow, no horizontal body overflow, controls remain reachable.

Browser console: zero application errors. Development-only Electron CSP warnings were observed from the host shell, not from the prototype.

## Comparison history

### Pass 1 — blocked

- P2: initiative rows and Quick Reference left too much unused vertical space compared with the visual target.
- P2: utility dock was shorter than the target and changed the main-region proportions.
- P2: reference source copy did not match the target.
- Fixes: rows now fill the encounter region, reference spacing and notes hierarchy were expanded, dock height was aligned, and source copy was corrected.
- Post-fix evidence: `qa/comparison-run-v2.png`.

### Pass 2 — blocked

- P2: at 1024 × 768, minimum row heights pushed `Next Turn` behind the persistent utility dock.
- P2: compact capture copy crowded the phone layout.
- Fixes: compact row sizing was introduced, horizontal combatant overflow was removed, and the shortcut hint is hidden below 480 px.
- Post-fix evidence: browser captures at 1024 × 768, 768 × 1024, and 390 × 844.

### Pass 3 — passed

- P2 reference-density drift was corrected by increasing condition and cover typography and rhythm.
- Full-view and focused comparisons contain no remaining actionable P0/P1/P2 mismatch.
- Final evidence: `qa/comparison-run-final-v2.png` and `qa/comparison-context-final-v2.png`.

## Implementation checklist

- [x] Match selected Run visual target.
- [x] Keep recent screens on demand rather than persistent in Run.
- [x] Separate Prepare editing chrome from protected Run state.
- [x] Keep capture/reference distinct and interoperable.
- [x] Keep dice/timer in the compact utility dock.
- [x] Verify core workflow, responsive reflow, build, and console.

## Follow-up polish

- Consider a 500-weight reference body variant during moderated testing.
- Validate whether bespoke combatant symbols improve scan speed enough to justify a curated asset set.

final result: passed
