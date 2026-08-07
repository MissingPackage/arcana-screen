# DOCKET — decisioni e residui

Convenzione: una riga per item, `D<n> [data] [tipo]`.

**Chi decide (aggiornato 2026-08-07, direttiva utente):** i ruling di tipo
`[decisione]`, `[design]`, `[ci]` e `[deps]` li prende **il loop**, che li
esegue e li riporta — non si chiedono all'utente. Restano dell'utente solo i
`[merge]` su `dev` e i cambi di scope. Quando Linear è raggiungibile, migrare
gli item aperti.

## Aperti

- D13 [2026-07-16] [ci] Variante dark del test axe nella suite `@critical` (i
  bug D2/D4/D11 erano invisibili al gate light-only). **SBLOCCATA il
  2026-08-07**: era merge-gated su #85/#87/#88, tutte e tre ora in `dev`.
  Prossimo item del loop.
- D14 [2026-08-07] [deps] D7 si sta ripetendo: dependabot ha di nuovo spezzato
  il bump react in #93 (react 19.2.8) e #94 (react-dom 19.2.8), entrambe
  `quality=FAILURE`. Serve un bump combinato come fu #86, poi chiudere #93/#94
  come superate. Il fix strutturale (D9) è già in `dev` ma agisce solo sui bump
  futuri, non su PR già aperte.
- D15 [2026-08-07] [docs] `docs/specs/acceptance-matrix.md` è stantia: cita
  ancora "WebKit CI pending" e "long suspension open", entrambi chiusi il
  2026-07-16. Riesame delle 16 `partial` / 3 `missing` / 2 `red` / 2 `blocked`
  alla luce di quanto è stato realmente mergiato.
- D16 [2026-08-07] [security] Il repo ha 7 secret creati il 2025-04-26 per il
  workflow project-board eliminato in D10: `TOKEN` (verosimilmente un PAT),
  `PROJECT_ID`, `STATUS_FIELD_ID`, `IN_PROGRESS_OPTION_ID`,
  `COMPLETED_OPTION_ID`, `MAYBE_OPTION_ID`, `NEW_OPTION_ID`. Nessun workflow li
  usa più. Revocare un credenziale è azione dell'utente: il loop non tocca i
  secret. **Consiglio: revocare `TOKEN`** — è un PAT fermo da 15 mesi con scope
  ignoto e nessun consumatore.

## Chiusi

- D9 [2026-07-16 → 2026-08-07] [ci] **RULING: adottato.** Gruppo `react` in
  `.github/dependabot.yml`. Dettaglio che la proposta originale non copriva:
  il gruppo va definito **prima** di `development-tooling`, perché i docs
  GitHub sono espliciti — "if a dependency matches more than one rule, it's
  included in the first group that it matches" — e `@types/react` /
  `@types/react-dom` sono devDependencies, quindi il gruppo per
  `dependency-type: development` le avrebbe catturate per prime staccandole da
  `react`/`react-dom`, riproducendo esattamente il guasto che il fix evita.

- D10 [2026-07-16 → 2026-08-07] [ci] **RULING: eliminato**, non spostato.
  `.github/worklows/project-update.yml` (typo) esisteva dal commit di setup
  342ae79 del **2025-04-26** — 15 mesi, mai eseguito (lo storico run contiene
  solo `Quality gate` e dependabot). Il contenuto ha deciso il ruling: legge
  `process.env.PROJECT_ID` & co. ma lo step **non ha alcun blocco `env:`**, e i
  secret GitHub non diventano variabili d'ambiente da soli → sarebbero tutti
  `undefined` e ogni chiamata GraphQL fallirebbe. Usa inoltre
  `actions/checkout@v3` e `actions/github-script@v6`, major ormai superati nel
  repo. Spostarlo in `workflows/` non avrebbe attivato un'automazione: avrebbe
  attivato un job **rotto per costruzione su ogni push di ogni branch**.
  Strascico → D16 (secret orfani).

- D3 [2026-07-16 → 2026-08-07] [design] **RULING: adottare `color-scheme`.**
  Oggi non compare da nessuna parte in `src/`. Senza di esso il chrome nativo
  (scrollbar, caret, autofill, controlli interni) resta chiaro sotto dark
  theme: è esattamente la classe di difetto di D2/D4/D11, che erano tutti
  "superficie custom scura, pezzo nativo chiaro". Adozione scoped (light di
  default, `dark` sotto `body.dark-theme`), da implementare **dopo D13** in
  modo che sia la suite axe dark a fare da gate. Se la verifica mostra una
  regressione sugli input appena corretti in D2, il ruling si rovescia e resta
  a verbale il perché.

- D1 / D4b / D8 / D8b / D11b / D12b [2026-07-16 → 2026-07-16] [merge] Tutti
  mergiati in `dev` il 2026-07-16 dall'utente: #83 (fix CSP WebKit), #87
  (sweep session.css), #85 (input dark), #86 (react allineato) + #80/#82
  chiuse come superate, #88 (toggle Prepare/Run dark), #89 (token shell).
  Anche #84 (prova Timer post-sospensione) è in `dev`. Il docket era rimasto
  indietro e li dava ancora "attesi": riallineato il 2026-08-07.

- D12 [2026-07-16 → 2026-07-16] [design/coverage] Sweep index.css COMPLETA con
  la sola tranche 1 (PR #89): l'analisi della tranche 2 ha mostrato che è vuota
  — i 4 `#fbf7ee` restanti sono definizioni always-light deliberate o la card
  first-run a palette fissa; i 45 hex unici residui sono tinte senza
  equivalente DS (mapparli sarebbe inventare, non adottare). Copertura token di
  index.css: fatta dove un token esiste.

- D11 (prima metà) [2026-07-16 → 2026-07-16] Toggle Prepare/Run in dark: fix su
  PR #88 (regola dark-scoped sullo stato attivo; era un conflitto di
  specificità 0-3-2 vs 0-3-1). Shell Prepare in dark: 0 violazioni axe.

- D4 [2026-07-16 → 2026-07-16] [design/coverage] Sweep session.css su PR #87:
  hex unici 71 → 44, gold-wash token, axe dark cockpit 0 violazioni
  (evidenza: docs/verification/2026-07-16-dark-theme-sweep.md).

- D5 [2026-07-16 → 2026-07-16] [docs] Numeri budget in ROADMAP riconciliati con
  lo script (560 JS / 130 CSS; attuali: 119.0 CSS, max JS = chunk react, 191.8 su react 19.1.0 / 198.8 su 19.2.7). Correzione post-verifier: la prima stesura citava solo 191.8.

- D7 [2026-07-16 → 2026-07-16] [deps] Gate rosso PR dependabot react: root cause
  `react 19.2.7 vs react-dom 19.1.0` (dependabot ha spezzato il bump in #80/#82,
  ognuna incoerente da sola → tutte le 32 suite morivano all'import). Risolto con
  bump combinato su PR #86, 136/136 verdi. **Recidiva 2026-08-07 → D14**;
  prevenzione strutturale → D9.

- D2 [2026-07-16 → 2026-07-16] [bug/dark-theme] Input bianchi in dark theme:
  fix su PR #85 (`--as-surface-raised`), contrasto misurato a runtime 10.24:1
  (era ~1.35:1). Light theme pixel-identico.

- D6 [2026-07-16 → 2026-07-16] [ci] Lane WebKit nel `Quality gate` GitHub:
  verde su PR #83 (webkit-desktop pass, 1m54s, run 29521841731).
