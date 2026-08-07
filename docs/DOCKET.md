# DOCKET — decisioni e residui

Convenzione: una riga per item, `D<n> [data] [tipo]`.

**Chi decide (aggiornato 2026-08-07, direttiva utente):** i ruling di tipo
`[decisione]`, `[design]`, `[ci]` e `[deps]` li prende **il loop**, che li
esegue e li riporta — non si chiedono all'utente. Restano dell'utente solo i
`[merge]` su `dev` e i cambi di scope. Quando Linear è raggiungibile, migrare
gli item aperti.

## Aperti

- D20 [2026-08-07] [merge] Mergiare **PR #99** (bump combinato react/react-dom
  19.2.8 + types) e poi CHIUDERE #93 e #94 come superate — sono lo stesso
  guasto di D7: ciascuna da sola disallinea react e react-dom, tutte le suite
  muoiono all'import, `quality=FAILURE` su entrambe e nessuna delle due potra'
  diventare verde. Gate della #99 in locale: `test:ci` 136/136, e2e 37+3 con 0
  failed (37 e non 41 perche' il branch parte da `dev` e non contiene il gate
  dark, che vive su `test/dark-axe-critical`).
- D18 [2026-08-07] [merge] Mergiare `test/dark-axe-critical` (gate dark + ripristino
  della fix D11). Gate: `test:ci` 136/136, matrice e2e 41+3 con 0 failed.
- D15 [2026-08-07] [docs] `docs/specs/acceptance-matrix.md` è stantia: cita
  ancora "WebKit CI pending" e "long suspension open", entrambi chiusi il
  2026-07-16. Riesame delle 16 `partial` / 3 `missing` / 2 `red` / 2 `blocked`
  alla luce di quanto è stato realmente mergiato.
- D19 [2026-08-07] [ci/proposta] Nessun gate copre il FOUC all'idratazione: il
  rimedio D17 nasconde e riespone `body` a ogni caricamento, e un flash sarebbe
  invisibile sia ai test unitari sia ad axe. Valutare un controllo (screenshot
  al primo frame, o asserzione che il tema sia già applicato prima del primo
  paint) — oppure evitare del tutto il rimedio sul percorso di rehydrate, dove
  probabilmente non serve perché gli elementi nascono già con la classe.
- D16 [2026-08-07] [security] Il repo ha 7 secret creati il 2025-04-26 per il
  workflow project-board eliminato in D10: `TOKEN` (verosimilmente un PAT),
  `PROJECT_ID`, `STATUS_FIELD_ID`, `IN_PROGRESS_OPTION_ID`,
  `COMPLETED_OPTION_ID`, `MAYBE_OPTION_ID`, `NEW_OPTION_ID`. Nessun workflow li
  usa più. Revocare un credenziale è azione dell'utente: il loop non tocca i
  secret. **Consiglio: revocare `TOKEN`** — è un PAT fermo da 15 mesi con scope
  ignoto e nessun consumatore.

## Chiusi

- D14 [2026-08-07 → 2026-08-07] [deps] Recidiva dello split bump react
  risolta con un bump combinato manuale sul branch `deps/react-19.2.8`, come fu
  la PR #86 per 19.2.7 → **PR #99**. Branch creato **da `origin/dev`** e non
  impilato su `test/dark-axe-critical`: e' l'applicazione diretta della lezione
  di D11, dove una PR impilata su un'altra non ancora mergiata ne ha revertito
  la fix al merge. Verificato che `react` e `react-dom` risolvano alla stessa
  versione nel lockfile — e' esattamente il controllo che il guasto di D7
  richiedeva e che nessuno faceva. Il merge e la chiusura di #93/#94 → D20.

- D17 [2026-08-07 → 2026-08-07] [bug/webkit] **CHIUSO.** WebKit non ri-risolve i
  `var()` dei discendenti quando una custom property cambia su un antenato: dopo
  il toggle dark la griglia Prepare restava inchiostro light su fondo scuro
  (1.16:1 sui pulsanti del notebook) fino a un reload. Escluse per misura tre
  ipotesi: non è la cascade (la custom property è già corretta su `body`), non è
  l'alias gotcha di CLAUDE.md (gli alias sono già ri-dichiarati), non è
  l'indirezione a due livelli (regola col token diretto `var(--as-ink-muted)`:
  fallisce identicamente). Otto rimedi falliti, uno funziona: detach/reattach di
  `body` in `applyThemeToDOM`. Costo misurato su tutta la matrice: focus,
  selezione di testo e scroll dei contenitori interni **tutti preservati** — la
  regressione di accessibilità che temevo non esiste. L'esenzione WebKit è stata
  rimossa dal gate dark: ora stretto su tutte e quattro le lane. Gate: `test:ci`
  136/136, e2e 41+3 con 0 failed; controprova di non-vacuità: disattivando il
  rimedio WebKit torna rosso con le stesse violazioni. Due precisazioni dal
  loop-verifier, entrambe recepite: (a) `applyThemeToDOM` è chiamata anche da
  `onRehydrateStorage`, quindi il rimedio gira **a ogni caricamento** oltre che
  a ogni toggle — il gate di performance all'avvio resta verde, ma un controllo
  di FOUC all'idratazione non è coperto da nessun gate (→ D19); (b) la lettura
  di `offsetHeight` **fra** le due scritture di `display` è portante: misurato,
  rimuovendola il gate dark torna rosso su WebKit. Il commento nel codice ora lo
  dice esplicitamente, perché elencava la lettura fra i rimedi falliti e si
  prestava a essere cancellata come codice morto.

- D13 [2026-07-16 → 2026-08-07] [ci] Gate axe dark nella suite `@critical`
  (branch `test/dark-axe-critical`): scansiona Prepare, i 4 Focus in Run e lo
  stato dopo reload, con il tema attivato dal vero controllo di UI. Due
  scoperte durante l'implementazione, entrambe a verbale nel commit: (1) senza
  emulare `prefers-reduced-motion` axe campiona i colori a metà transizione e
  produce violazioni fantasma **diverse a ogni run e a ogni engine** — è la
  ragione per cui la prima diagnosi ("10 bug dark su WebKit/mobile") era
  sbagliata; (2) la fix D11 era regredita. Evidenza: `test:ci` 136/136, lint 0
  errori, CSS 119.5/130 KiB, matrice e2e **41 passed + 3 skip, 0 failed**
  (erano 37+3), test dark stabile su `--repeat-each=2` × 4 progetti.

- D11 (regressione) [2026-08-07] Il fix del toggle Prepare/Run in dark (PR #88,
  commit 76d4db4) è stato **cancellato dalla PR #89**: il suo branch conteneva
  `ea0d9eb` "move the header-toggle dark fix out of this PR", che rimuoveva
  l'hunk perché apparteneva a un'altra slice — ma il branch era stato creato
  sopra #88 e la #89 è stata mergiata dopo, quindi la rimozione è diventata un
  revert. Ripristinato su `test/dark-axe-critical`. Lezione strutturale: era
  esattamente il tipo di regressione silenziosa che il gate D13 ora intercetta,
  e nessun gate l'aveva vista per tre settimane.

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

- D3 [2026-07-16 → 2026-08-07] [design] **RULING: adottato, e implementato.**
  Il DS lo definiva; la port del token layer l'aveva lasciato indietro. Senza,
  il chrome nativo (scrollbar, caret, autofill, interni dei select) restava
  chiaro sotto dark: stessa classe di difetto di D2/D4/D11. Implementato in
  `tokens.css`: `color-scheme: light` su `:root`, `dark` su `.dark-theme`, più
  `html:has(body.dark-theme)` — senza quest'ultima la scrollbar della finestra
  restava chiara, perché segue l'elemento radice mentre la classe di tema vive
  su `body` (misurato: `html` restava `light` con `body` già `dark`).
  Verifica: su tutte e quattro le lane `body`/`html`/`input` passano tutti da
  `light` a `dark`. Gli input di D2 **non** regrediscono: `.widget-sidebar__search`
  misura 11.23:1 in dark e 14.08:1 in light (l'elemento va nominato, altrimenti
  il numero non è riproducibile). Il ruling prevedeva di rovesciarsi in caso di
  regressione sugli input: non si è verificata.
  CORREZIONE post-verifier: la prima stesura diceva che il tema light è
  invariato "per costruzione, perché `color-scheme: light` è ciò che il browser
  assume comunque". **È falso**: il valore iniziale è `normal`, non `light` —
  misurato, prima del commit era `normal` su html/body/input in entrambi i temi.
  La conclusione regge lo stesso, ma per misura e non per deduzione: con OS dark
  emulato e app in tema light, 16/16 screenshot byte-identici prima/dopo su
  tutte e quattro le lane, e nessun `prefers-color-scheme` nei bundle.
  Limiti noti: (a) axe non ispeziona il chrome nativo, quindi il gate dark è
  necessario ma non sufficiente; (b) la scrollbar della finestra **non** è stata
  osservata a pixel — headless usa overlay scrollbar. Ciò che è provato è il
  `color-scheme` calcolato su `html`; che ne discenda una scrollbar scura è
  un'inferenza, per quanto solida (nulla in `src/` stila le scrollbar).

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
