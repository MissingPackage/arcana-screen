# Horizon 0 — Prototype decisions and test gates

This prototype turns the roadmap’s four decision gates into one connected flow. These are product hypotheses ready for testing, not evidence that the gates have already passed.

## Wireflow

1. Entry state resumes the last-used Screen or starts creation.
2. Creation previews General, Combat, Blank, and candidate Exploration templates.
3. A new or duplicated Screen opens in Prepare.
4. Prepare exposes the tool library, layout controls, sizes, configuration, and structural removal.
5. Run hides editing chrome, keeps state stable, protects the layout, and prioritizes initiative, capture, reference, dice, and timer.
6. The active-screen switcher exposes recent Screens and rename/duplicate/delete only on demand.

## D0.1 — Screen flow

Prototype decision: **Screen is the primary object**. `Profile` terminology is removed. Resume, create, switch, rename, duplicate, and delete-with-undo are connected in the same model.

Gate test:

- Ask a tester to resume `Cripta di Vhal` without explanation.
- Ask them to duplicate it for a new encounter, rename the copy, and return to the original.
- Ask them to delete the copy and recover it.
- Pass when the mental model needs no explanation and resume takes only a few seconds.

## D0.2 — Prepare and Run

Prototype decision: **Run is a protected operating mode, not merely a lock toggle**. It removes structural controls and changes information hierarchy; Prepare restores library, sizing, configuration, and removal.

Gate test:

- Ask the tester to add or remove a tool, then start the encounter.
- During Run, ask them to advance initiative, capture a note, roll, and start the timer.
- Observe whether they look for editing controls or make a structural change accidentally.

## D0.3 — Capture, Note, and Reference

Prototype hypothesis: **distinct but interoperable surfaces in one context column**.

- Capture is raw, one-line, shortcut-accessible, and timestamp-ready.
- Quick Reference is prepared, structured, and glanceable.
- The prototype sends a capture directly into Encounter Notes to demonstrate interoperability without a global knowledge base.

Gate test:

- Dictate a name or consequence during Run and measure capture time.
- Ask for the cover rule and one prepared encounter fact without global search.
- Compare this packaging with a future post-session review prototype before promoting `CAP-04`.

## D0.4 — MVP tool set

Prototype recommendation:

- Keep Initiative Tracker, Dice Roller, Timer, Quick Capture, and Quick Reference in the default Combat flow.
- Keep Simple Table and Counter visible as candidates but disabled by default until each demonstrates a distinct job.
- Keep Exploration as a candidate template rather than a committed template.
- Defer dice history, timer presets, sound, onboarding checklist, global sound settings, and i18n infrastructure from this visual slice; their absence must be tested rather than interpreted as a final rejection.

## Candidate disposition after this prototype

| Candidate | Current recommendation | Evidence still needed |
|---|---|---|
| `MOD-04` layout lock | Promote as Run’s visible protection cue | Test whether users understand it without explanation |
| `CAP-03` capture shortcut | Promote | Keyboard discoverability test |
| `CAP-04` post-session review | Keep candidate | Dedicated review flow |
| `NOT-03` light formatting | Defer | Reference/note authoring test |
| `TPL-03` Exploration | Keep candidate | Compare against General with exploration tasks |
| `ONB-03` checklist | Defer | First-run test after template selection |
| `DIC-04` dice history | Defer | Observe recall/reuse needs during a session |
| `TIM-03` timer presets | Defer | Observe repeated timer setup |
| `TIM-04` optional signal | Defer | Accessibility and live-session test |
| `TAB-01` Simple Table | Keep candidate | Distinct-job test against references/notes |
| `CNT-01` Counter | Keep candidate | Distinct-job test in non-combat scenes |
| `SET-04` global sounds | Defer | Only revisit if audible utilities are promoted |
| `SET-07` i18n infrastructure | Defer product commitment | Separate engineering sequencing decision |

## Exit status

- Information architecture and Screen model: prototype ready for validation.
- Complete create/resume → Prepare → Run wireflow: complete.
- Visual target for shell and core tools: selected and implemented.
- Capture/note/reference packaging: prototype hypothesis selected.
- Final MVP-candidate promotion list: blocked on moderated tests above.
