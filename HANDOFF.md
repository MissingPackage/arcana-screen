# HANDOFF — ArcanaScreen

Aggiornato: 2026-07-16, iterazione 6 del product-loop (D4 chiuso via PR #87; loop verso stop-by-design)

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

Lavoro non-gated ESAURITO salvo D11 (contrasto dark del toggle Prepare/Run
nell'header + axe dark della shell Prepare + sweep profonda index.css — slice
media, ultima candidata). Tutto il resto è gated:

- Merge: D1 (#83 → #84), D8 (#85), D8b (#86 + chiudere #80/#82), D4b (#87).
- Ruling: D3 (color-scheme), D9 (dependabot groups), D10 (workflow
  project-update mai eseguito).
- Post-merge: riesame righe acceptance-matrix.

Se D11 non viene autorizzata/prioritizzata, il loop si ferma by design al
prossimo giro.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. Merge su dev e decisioni di scope: solo l'utente.
