# HANDOFF — ArcanaScreen

Aggiornato: 2026-07-16, iterazione 4 del product-loop (D7 risolto: bump react allineato, PR #86)

## Stato corrente

- Branch `dev` @ `60ba9d7`: adottato il layer di token del progetto Claude Design
  "Arcana Screen Dungeon Master" (`arcana-screen/src/styles/tokens.css`), body
  font Inter → Work Sans, fix dei token mai definiti (`--as-wine`, `--as-display`)
  e del contrasto dark-theme di eyebrow/popover. Pushed su origin/dev.
- Branch `test/timer-suspension-e2e` (stacked su `test/webkit-e2e-gate`):
  prova Timer post-sospensione automatizzata (M2.5 chiusa). PR-ready.
- Branch `test/webkit-e2e-gate` @ `9fd61b6` (+ commit docs), **PR #83, CI tutta
  verde WebKit incluso**: fix del bug cross-browser WebKit — `upgrade-insecure-requests` nel meta CSP accecava
  l'app su host HTTP (WebKit forza l'upgrade anche su localhost). Direttiva
  spostata solo in `public/_headers`. **PR-ready, non mergiato** (policy loop:
  il merge su dev è una decisione utente → docket D1).
- Gate (verificati 2026-07-16, loop-verifier PASS): `test:ci` verde (136/136
  Vitest, lint 0 errori, CSS 119.0/130 KiB); e2e **33 passed + 3 skip, 0 failed
  sull'intera matrice WebKit incluso** — prima volta. Evidenza:
  `docs/verification/2026-07-16-webkit-gate.md`.

## Ambiente (questo host sandbox, non il workstation Fedora)

- sudo passwordless disponibile; Playwright chromium/firefox/**webkit** installati
  con dipendenze di sistema (`~/.cache/ms-playwright`).
- `gh` autenticato (MissingPackage); identità git configurata repo-local.
- Linear MCP **non autenticato** in sessioni non interattive: il docket file
  `docs/DOCKET.md` è il tracker operativo finché Linear non è raggiungibile.

## §next-decidable (in ordine)

1. Osservare la CI di PR #86 (bump react allineato): attesa verde su quality
   + 3 lane; WebKit rosso finché #83 non è mergiata (noto).
2. D5 (slice piccola non gated): riconciliare i numeri di budget in ROADMAP
   (dice 110 KiB CSS, lo script applica 130) — nota: la riga vive su questo
   branch stack, il fix è un edit del ROADMAP già aggiornato qui; verificare
   dove conviene farlo per non creare conflitti.
3. **Righe acceptance-matrix non verdi**: riesame dopo il merge dei fix
   (gated su D1/D8/D8b).
4. Residui design-system: D3 (color-scheme, gated su ruling), D4 (literal
   sweep — slice fattibile).
Quasi tutto il lavoro non gated si sta esaurendo: se D4 non è prioritario,
valutare stop-by-design del loop in attesa dei merge (D1/D8/D8b) e dei ruling
(D3/D9).

Chiusi: D6 (PR #83 CI), Timer (PR #84), D2 (PR #85), D7 (PR #86 — merge in
D8b). PR #85 CI confermata: rossa solo sul lane WebKit, come previsto.
Item 1 e 3 della Sequenza immediata restano human-gated.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. Merge su dev e decisioni di scope: solo l'utente.
