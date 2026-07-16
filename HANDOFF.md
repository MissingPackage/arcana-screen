# HANDOFF — ArcanaScreen

Aggiornato: 2026-07-16, iterazione 9: verifier iter.8 PASS (con controllo negativo); D12 tranche 1 su PR #89. Nota operativa: probe detached possono lasciare vite-preview zombie su :4173 (e2e rossi con ERR_CONNECTION_REFUSED) — pkill vite prima di diagnosticare regressioni.

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

1. **D12 tranche 2** — letterali theme-dependent di index.css (surface/ink/
   line, analisi dark per riga): ultima slice non-gated. Media, spezzabile
   per blocchi di componenti shell.
2. Merge attesi: D1 (#83→#84), D8 (#85), D8b (#86 + chiudere #80/#82),
   D4b (#87), D11b (#88), D12b (#89). Ruling: D3, D9, D10.
3. Merge-gated: D13 (test axe dark in suite — rosso finché le PR dark non
   mergiano), riesame acceptance-matrix.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. Merge su dev e decisioni di scope: solo l'utente.
