# HANDOFF — ArcanaScreen

Aggiornato: 2026-07-16, iterazione 2 del product-loop (prova Timer post-sospensione)

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

1. **Righe acceptance-matrix non verdi** (`docs/specs/acceptance-matrix.md`):
   riesaminare le righe `missing/red/partial/blocked` dopo il merge dei fix,
   distinguendo implementazione da approvazione prodotto (ROADMAP Sequenza
   immediata item 4). Nessuna riga TIM esiste: la prova timer vive in ROADMAP
   M2.5 + docs/verification.
2. Residui design-system (docket D2–D5): il candidato più concreto è D2
   (input bianchi in dark theme), una slice piccola e verificabile con axe.
3. Dependabot PR react/@types-react: Quality gate rosso (docket D7) — triage.

Chiusi in questa iterazione: WebKit CI lane (PR #83 tutta verde, D6) e prova
Timer post-sospensione (test @critical su 4 engine, 37+3 in matrice).
Item 1 e 3 della Sequenza immediata restano human-gated.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. Merge su dev e decisioni di scope: solo l'utente.
