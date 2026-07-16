# HANDOFF — ArcanaScreen

Aggiornato: 2026-07-16 (sessione: adozione design system + prima iterazione product-loop)

## Stato corrente

- Branch `dev` @ `60ba9d7`: adottato il layer di token del progetto Claude Design
  "Arcana Screen Dungeon Master" (`arcana-screen/src/styles/tokens.css`), body
  font Inter → Work Sans, fix dei token mai definiti (`--as-wine`, `--as-display`)
  e del contrasto dark-theme di eyebrow/popover. Pushed su origin/dev.
- Branch `test/webkit-e2e-gate` @ `9fd61b6` (+ commit docs): **fix del bug
  cross-browser WebKit** — `upgrade-insecure-requests` nel meta CSP accecava
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

1. **Prova Timer dopo sospensione lunga/background** (ROADMAP Sequenza immediata
   item 2, seconda metà — l'unica parte ancora aperta dell'item). Slice: test
   e2e/harness che simula sospensione (clock skew / page freeze) e verifica il
   ricalcolo da timestamp.
2. **Conferma lane WebKit nella CI GitHub**: push/PR del branch
   `test/webkit-e2e-gate` esercita il workflow `Quality gate` con la matrice
   browser. Osservare il run, chiudere l'item 2 prima metà anche in CI.
3. Righe acceptance-matrix non verdi legate a WebKit (`docs/specs/acceptance-matrix.md`)
   da riesaminare dopo il merge del fix.
4. Residui design-system: vedi docket D3–D5.

Item 1 e 3 della Sequenza immediata (sessioni con DM reali, PWA su device
reali) restano human-gated: non decidibili in loop.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. Merge su dev e decisioni di scope: solo l'utente.
