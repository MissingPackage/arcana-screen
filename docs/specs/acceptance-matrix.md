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
| Accessibility/input          | n/a                      | green jsx-a11y and alternatives          | green automated: keyboard/200% and axe in **both themes** on all four projects, WebKit included; 44px touch targets on the mobile project only | partial moderated audit               | partial        |
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

Conteggio delle 22 righe, colonna *Current status*, **prima** delle correzioni
di questa revisione: **11 `manual-pass`, 8 `partial`, 3 `green`** — e **zero**
`missing`, `red` o `blocked`. Una lettura precedente ne contava tre, due e due:
erano occorrenze nella legenda e nella frase di chiusura, non celle della
tabella. Promuovendo *Timer* e *Browser matrix* la revisione porta il conteggio
a **12 `manual-pass`, 6 `partial`, 4 `green`**, che è il valore corrente della
tabella qui sopra.

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

## Revisione 2026-08-13 (§next-decidable 1 — riga *Accessibility/input*)

Quel merge è avvenuto: il gate axe dark è in `dev` con la **PR #103**, insieme
ai fix D11/D17/D3. La condizione che la revisione precedente aveva posto è
soddisfatta, quindi la colonna *Browser* della riga *Accessibility/input*
passa da "dark-theme axe scan not yet in dev" a **green automated in entrambi i
temi su tutte e quattro le lane**.

Cosa copre davvero il gate dark (`e2e/critical-flows.spec.ts:91`), perché la
cella non prometta più di quanto si misuri: shell Prepare, i **quattro Focus**
in Run e lo stato **dopo reload**, con il tema attivato dal vero controllo di
UI e `prefers-reduced-motion` emulato — senza quest'ultimo axe campiona colori
a metà transizione e produce violazioni fantasma diverse a ogni engine (D13).

Un limite che la cella ora dice esplicitamente: il gate **44px** non gira su
tutte e quattro le lane. `e2e/critical-flows.spec.ts:240` ha un
`test.skip(!project.name.includes("mobile"))`, quindi i target tattili sono
misurati **solo su chromium-mobile** — sono i 3 skip della matrice. È l'unica
delle tre prove della cella a non essere cross-browser, e scriverlo evita di
leggere "verde su quattro lane" come se valesse anche per i target.

La riga resta **`partial`**, non diventa `green`: manca l'**audit moderato con
persone reali**, che nessuna suite automatica sostituisce. Il conteggio delle
22 righe quindi non cambia e resta **12 `manual-pass`, 6 `partial`, 4
`green`**, zero `missing`/`red`/`blocked`.

*Correzione portata da questa revisione:* la revisione del 2026-08-07 dichiarava
"11 `manual-pass`, 8 `partial`, 3 `green`" come conteggio **effettivo**, ma
quelli erano i numeri **prima** delle sue stesse promozioni di *Timer* e
*Browser matrix* — il docket (D15) li riportava correttamente come "8 → 6,
11 → 12, 3 → 4", la prosa della matrice no. Verificato ricontando le celle
della colonna, non a memoria.

Prova ri-eseguita il 2026-08-13 su workstation Fedora, non citata dalla CI:
`test:ci` 136/136 e matrice `@critical` **41 passed + 3 skip, 0 failed** —
chromium-desktop/mobile e firefox nativi, **webkit nel container Playwright
`v1.61.1-noble`** (su questo host webkit non parte per librerie di sistema
mancanti: limite dell'host, non difetto dell'app). Dettaglio e trappole in
`docs/verification/2026-08-13-accessibility-matrix.md`.

Evidence for the current statuses is recorded in `docs/verification/2026-07-13-recovery.md`. `manual-pass` is dated evidence, not a substitute for the repeatable automated suite required before release.

**Real-state re-check 2026-07-14 (evidence-based, not aspirational):** unit 86/86 green; Playwright e2e `test:e2e:critical` = 25 passed + 2 intentional skips on Chromium desktop/mobile and Firefox; the 9 WebKit failures are only because WebKit cannot launch on the Fedora dev host (missing system libraries) — a CI gate, not an app defect. The axe accessibility gate was in fact RED (93 muted-text contrast violations introduced by the Prepare re-skin) and was fixed 2026-07-14 (`--ink-muted`/`--as-muted` → `#586678`). Many rows above remain `manual-pass` and should be promoted to automated Playwright coverage before release.

> **Superata dalle revisioni 2026-08-07 e 2026-08-13** per i numeri: le unit
> sono 136/136 e la matrice `@critical` è 41+3 con 0 failed, WebKit incluso.
> Il paragrafo resta come traccia storica del momento in cui il gate axe era
> rosso. Ciò che invece regge ancora è la sua conclusione: molte righe sono
> `manual-pass` e vanno promosse a copertura automatica prima della release.
