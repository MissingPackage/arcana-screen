# 2026-07-16 — D4: sweep dei letterali residui in session.css + axe dark

## Metodo

Tokenizzazione count-asserted (ogni sostituzione verifica il numero di
occorrenze atteso): tinte ink (#314c64, #526779, #40566c, … → `--as-ink-soft`
/ `--as-ink-muted`), gold wash unificato nel token app-locale `--as-gold-wash`
(#fff8e7 light / #26354a dark) con rimozione dei due gruppi dark ridondanti,
numerazione beat DS-corretta (oro + inchiostro navy, mai bianco su oro),
famiglia gold-ink/strong, hairline navy `--as-navy-line`, superfici paper-deep.
Hex unici in session.css: 71 → 44; i residui sono classi documentate (tinte
chrome-su-navy senza token DS, colori semantici di stato, valori dark,
`#fff` contestuali).

## Verifica

- Axe (wcag2a/2aa/22aa) in **dark theme** su Run/Narrative+Exploration+Combat:
  **0 violazioni nel cockpit** (prima: saved-note, read-aloud edit,
  complete-moment, clock-actions, più i wash chiari rimasti in dark).
  Unico nodo residuo: `.screen-mode__button` nell'header shell (index.css,
  pre-esistente, tracciato come D11).
- `test:ci`: 136/136, lint 0 errori, CSS 119.1/130 KiB.
- E2e branch (chromium desktop/mobile + firefox): 25 passed + 2 skip.
- Matrice completa su merge locale di integrazione con lo stack #83/#84:
  **37 passed + 3 skip, 0 failed** (WebKit incluso).

## Non verificato

- Axe dark della shell Prepare (fuori slice: il cockpit era lo scope D4);
  insieme a D11.
- Su device/engine reali il rendering resta nel gate di accettazione prodotto.
