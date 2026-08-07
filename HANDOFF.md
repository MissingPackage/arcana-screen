# HANDOFF — ArcanaScreen

Aggiornato: 2026-08-07, iterazione 15 (**D14 chiusa**: PR #99, bump combinato
react 19.2.8). Iterazioni precedenti: 14 (D3), 13 (D17), 12 (diagnosi D17),
11 (D13). Il loop era fermo by design dal
2026-07-16 (it. 10) in attesa dei merge dell'utente: i merge sono avvenuti
tutti, e HANDOFF/DOCKET erano rimasti indietro di tre settimane. Ruling
`[decisione]`/`[design]`/`[ci]`/`[deps]` presi dal loop (D3, D9, D10).

## Stato corrente

- `origin/dev` @ `5817277` (i due commit dei ruling del 2026-08-07 sono sopra
  `22bb1e2`). Il tip contiene tutte le PR feature del ciclo precedente:
  #83 (fix CSP WebKit), #84 (prova Timer post-sospensione), #85 (input dark),
  #86 (react allineato 19.2.7), #87 (sweep session.css), #88 (toggle
  Prepare/Run dark), #89 (token shell header). Sopra ci sono solo bump
  dependabot di CI actions.
- Applicato il 2026-08-07: gruppo `react` in `.github/dependabot.yml` (D9) ed
  eliminazione di `.github/worklows/` (D10). Motivazioni per esteso nel docket.
- Gate ri-verificati il 2026-08-07 su `test/dark-axe-critical` (che parte dal
  tip di `dev`): `test:ci` 136/136 + lint 0 errori + CSS 119.6/130 KiB; e2e
  **41 passed + 3 skip, 0 failed** su tutta la matrice, WebKit incluso.
- Trappola operativa aggravata: il webServer Playwright è `npm run preview`, che
  serve `dist`. Una modifica a CSS/TS **non** si vede finché non si rifà
  `npm run build`, e `reuseExistingServer` ricicla un preview stantio. Il worktree
  parte senza `node_modules`: `npm ci` prima di qualsiasi gate.
- Recidiva viva: #93/#94 (react/react-dom 19.2.8) sono di nuovo uno split bump
  rotto, entrambe `quality=FAILURE` → D14.

## Attenzione al branch

Il checkout principale `/home/claude/progetti/arcana-screen` è su
`test/timer-suspension-e2e` e il suo `dev` locale è fermo a `60ba9d7`: leggere
i file da lì dà una foto stantia. Ri-ancorarsi da un worktree allineato a
`origin/dev`, o fare `git fetch && git checkout dev && git pull` prima.

## Ambiente (questo host sandbox, non il workstation Fedora)

- sudo passwordless disponibile; Playwright chromium/firefox/**webkit** installati
  con dipendenze di sistema (`~/.cache/ms-playwright`).
- `gh` autenticato (MissingPackage); identità git configurata repo-local.
- Linear MCP **non autenticato** in sessioni non interattive: il docket file
  `docs/DOCKET.md` è il tracker operativo finché Linear non è raggiungibile.
- Nota operativa: vite-preview zombie su :4173 possono dare e2e tutti rossi —
  `pkill -f '[v]ite'` prima di diagnosticare (il pattern nudo `vite` uccide la
  shell stessa).

## §next-decidable (in ordine)

1. **D15** — riesame di `docs/specs/acceptance-matrix.md`, stantia.
2. Ruling dell'utente aperti: **D18** (merge di `test/dark-axe-critical`),
   **D20** (merge della PR #99 + chiusura di #93/#94), **D16** (revoca dei
   secret orfani, incluso il PAT `TOKEN`).

## Ruling di protocollo presi il 2026-08-07 (loop-verifier iterazione 11)

- **Residue-routing, eccezione a verbale.** Il ripristino della fix D11 è stato
  assorbito nella slice D13 invece di finire a docket. Regola confermata con
  un'eccezione esplicita: se il deliverable della slice è un *gate* e il gate è
  rosso per un difetto pre-esistente, il difetto minimo che lo rende verde
  entra nella slice — altrimenti si consegna un gate rosso, che è peggio.
  L'eccezione va sempre giustificata nel corpo del commit.
- **Contraddizione di policy sui branch.** `CLAUDE.md` di progetto dice "commit
  + push su `origin/dev` a ogni unità di lavoro"; la direttiva del loop dice
  "nessun merge su dev, PR-ready è lo stato obiettivo". Vince **la direttiva del
  loop** per il lavoro di slice: si lavora su feature branch e il merge resta
  ruling dell'utente. La riga di `CLAUDE.md` va letta come riferita ai commit di
  documentazione/protocollo fuori dal loop.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. **Merge su `dev` e cambi di scope: solo l'utente.** Tutti gli altri
ruling (design, ci, deps, decisioni tecniche): li prende il loop, li esegue e
li riporta a verbale nel docket — non si chiedono.
