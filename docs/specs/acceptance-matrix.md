# Recovery acceptance matrix

Status values: `missing`, `red`, `partial`, `green`, `manual-pass`, `blocked`.

| Capability                   | Unit                     | Component/integration                    | Browser                                                                  | Design QA                             | Current status |
| ---------------------------- | ------------------------ | ---------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------- | -------------- |
| Screen create/resume/switch  | green                    | green                                    | manual-pass create/resume/reload                                         | partial                               | partial        |
| Rename/duplicate/delete/undo | green                    | green rename                             | manual-pass rename/duplicate/delete; Undo click open                     | partial                               | partial        |
| Prepare/Run                  | green                    | green mode distinction                   | desktop manual-pass                                                      | manual-pass                           | partial        |
| First run/templates          | green                    | green General/Combat/Blank               | manual-pass isolated clean origin                                        | manual-pass                           | manual-pass    |
| Focus continuity             | green                    | green                                    | manual-pass including reload                                             | manual-pass against four sources      | manual-pass    |
| Notebook persistence         | green widget/store       | green edit/format/autosave               | Focus/reload/promotion manual-pass                                       | manual-pass Narrative/Social          | manual-pass    |
| Quick Capture                | green                    | green capture/review/promotion           | manual-pass capture/edit/promote/delete/Focus/reload                     | manual-pass all Focuses               | manual-pass    |
| Quick Reference              | green validation/storage | green                                    | link targets inspected                                                   | manual-pass Social/Exploration/Combat | manual-pass    |
| Narrative                    | green                    | green beat/outline/pacing/drawer         | manual-pass interaction/reload                                           | manual-pass                           | manual-pass    |
| Social                       | green                    | green edit/attitude/clock/reset          | manual-pass interaction/reload                                           | manual-pass                           | manual-pass    |
| Exploration                  | green                    | green moment/clue/log/clock/counter      | manual-pass interaction/reload                                           | manual-pass                           | manual-pass    |
| Combat                       | green                    | green turn/HP/temp/conditions/reset/undo | manual-pass full round/reset/undo/reload                                 | manual-pass                           | manual-pass    |
| Dice                         | green                    | green formula/error/modes                | manual-pass formula/error/advantage/disadvantage                         | manual-pass utility dock              | manual-pass    |
| Timer                        | green                    | green controls/duration/completion       | green automated: reload plus 12-minute suspension, full matrix           | manual-pass utility dock              | manual-pass    |
| Theme/reduced motion         | green                    | partial                                  | green automated persistence/computed durations                           | partial                               | green          |
| Export/import/recovery       | green                    | partial validation UI                    | green on the full matrix, WebKit included                                | n/a                                   | partial        |
| Responsive                   | n/a                      | green reflow                             | manual-pass at 1487×1058, 768×1024, 390×844 including overlap regression | manual-pass captured comparisons      | manual-pass    |
| Accessibility/input          | n/a                      | green jsx-a11y and alternatives          | keyboard/200%/44px green; light-theme axe green on all four projects, WebKit included; dark-theme axe scan not yet in dev | partial moderated audit               | partial        |
| Browser matrix               | n/a                      | n/a                                      | green on all four projects, WebKit included, in CI                       | n/a                                   | green          |
| Performance budgets          | green asset gate         | n/a                                      | green startup and mode switch                                            | n/a                                   | green          |
| Privacy/security             | green audit/config       | n/a                                      | green no cross-origin runtime request                                    | n/a                                   | green          |
| Release/rollback             | green workflow syntax    | n/a                                      | production deploy not executed                                           | n/a                                   | partial        |

No horizon can be marked accepted while a required row is `missing`, `red`, `partial` or `blocked`.

## Revisione 2026-08-07 (docket D15)

La matrice era ferma a prima dei merge del 2026-07-16 e citava ancora due gate
come aperti che aperti non erano:

- **Timer**, "long suspension open" → la prova è automatizzata nella suite
  `@critical` dal PR #84: clock fittizio, sospensione di 12 minuti, reload a
  timer attivo, completamento a 00:00. Verde su tutta la matrice.
- **Export/import** e **Browser matrix**, "WebKit CI pending" → il lane WebKit
  è verde in CI dal PR #83, che ha corretto il bug `upgrade-insecure-requests`
  nel meta CSP.

Conteggio effettivo delle 22 righe, colonna *Current status*: **11
`manual-pass`, 8 `partial`, 3 `green`** — e **zero** `missing`, `red` o
`blocked`. Una lettura precedente ne contava tre, due e due: erano occorrenze
nella legenda e nella frase di chiusura, non celle della tabella.

Ciò che tiene ferme le righe `partial` non è quasi mai il codice:
- *Screen create/resume*, *Rename/duplicate/delete*, *Prepare/Run* → il browser
  è coperto solo da `manual-pass`, cioè evidenza datata e non ripetibile;
- *Export/import* → resta la UI di validazione parziale;
- *Accessibility/input* → manca l'audit moderato con persone reali;
- *Release/rollback* → il deploy di produzione non è mai stato eseguito.

Fuori da `dev`, in attesa di merge: la scansione axe in tema dark su tutte e
quattro le lane, il fix WebKit del cambio tema e `color-scheme`
(branch `test/dark-axe-critical`). La riga *Accessibility/input* si potrà
aggiornare solo dopo quel merge, non prima.

Evidence for the current statuses is recorded in `docs/verification/2026-07-13-recovery.md`. `manual-pass` is dated evidence, not a substitute for the repeatable automated suite required before release.

**Real-state re-check 2026-07-14 (evidence-based, not aspirational):** unit 86/86 green; Playwright e2e `test:e2e:critical` = 25 passed + 2 intentional skips on Chromium desktop/mobile and Firefox; the 9 WebKit failures are only because WebKit cannot launch on the Fedora dev host (missing system libraries) — a CI gate, not an app defect. The axe accessibility gate was in fact RED (93 muted-text contrast violations introduced by the Prepare re-skin) and was fixed 2026-07-14 (`--ink-muted`/`--as-muted` → `#586678`). Many rows above remain `manual-pass` and should be promoted to automated Playwright coverage before release.
