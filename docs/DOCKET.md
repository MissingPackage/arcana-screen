# DOCKET — decisioni e residui

Convenzione: una riga per item, `D<n> [data] [tipo]`.

**Chi decide (aggiornato 2026-08-07, direttiva utente):** i ruling di tipo
`[decisione]`, `[design]`, `[ci]` e `[deps]` li prende **il loop**, che li
esegue e li riporta — non si chiedono all'utente. Restano dell'utente solo i
`[merge]` su `dev` e i cambi di scope. Quando Linear è raggiungibile, migrare
gli item aperti.

## Aperti

- D33 [2026-09-25] [bug/layout] **Header del Run a 390px: "Search" ed
  "Edit party" fluttuano sopra lo switcher dello Screen.** Visto sullo
  screenshot a 390x844 (Pixel 5) di `dev` @ `0504ca6`, identico prima e dopo il
  bump della toolchain, quindi preesistente. Le due etichette sono testo senza
  contenitore visibile, sovrapposto al combobox "Current screen". Diverso dal
  caso chiuso in `docs/verification/2026-07-13-recovery.md` (quello era sul
  bottone Combat). Non corretto: sta nella stessa shell che la seconda fix
  scartata di D27 ha rotto, quindi va guardato insieme al ruling su D27.

- D32 [2026-09-25 → 2026-09-25] [bug/trust] **Falso "Save issue" dopo un
  reload senza Screen.** FirstRun persiste `{ screens: [] }`; il validatore di
  `safeStorage` esigeva almeno uno Screen, quindi aprire l'app e ricaricare
  mostrava "Stored screen data was invalid" e archiviava un payload
  `arcana_invalid_payload_*` inutile. Riproducibile su desktop e mobile: 1
  payload archiviato prima della fix, 0 dopo. Corretto in `ed4db34`: essere ben
  formato ed essere degno di snapshot sono due controlli separati. Test di
  regressione: fallisce sul codice vecchio, passa sul nuovo.

- D31 [2026-09-25 → 2026-09-25] [deps] **RULING preso dal loop: la PR #111
  (gruppo development-tooling, 24 bump) sostituita dalla #112.** La #111 non si
  installava (ERESOLVE: eslint 10 contro il peer di eslint-plugin-jsx-a11y
  6.10.2). Entrati Vite 8, Vitest 5, jsdom 30, Playwright 1.63, Tailwind 4.3,
  @types/node 26. Quattro versioni trattenute con `ignore` in `dependabot.yml`:
  eslint 9 (peer jsx-a11y), typescript 5.9 (typescript-eslint vuole <6.1),
  react-hooks 5 (la 7 porta ~10 errori veri del React Compiler: setState in
  effect, JSX in try/catch in SimpleTable, quindi è una leva di refactor, non
  un bump) e axe 4.13 (vedi D27). `tsconfig.app` lib da ES2020 a ES2022:
  `.at()` compilava solo perché lo dichiarava @types/node 22. Prima, sempre su
  `dev` (`b4ba008`): advisory high nuove su js-yaml e browserslist, recidiva di
  D21/D30. npm 10.9.8 crasha nel peer-set di vitest (`edgesOut` null), quindi il
  lockfile va rigenerato con `npx npm@11 install`; `npm ci` di npm 10 lo
  installa senza errori. CI della #112 verde su tutti e cinque i job.

- D30 [2026-08-13 → 2026-08-13] [deps] **RULING preso dal loop: audit fix
  lockfile-only per `nanoid`.** Recidiva esatta di D21: advisory **nuova**
  (GHSA-2v37-7h3g-55p8, high) pubblicata contro una versione già pinnata
  (`nanoid` 3.3.17, transitiva), quindi il gate `check:security` è diventato
  rosso **senza che nessuno toccasse le dipendenze** — verificato che
  `dev` stesso fosse rosso (exit 1) prima di attribuirlo alla PR #104.
  `npm audit fix --package-lock-only`, senza `--force`: **3 righe di
  lockfile**, `package.json` invariato, 3.3.17 → 3.3.18. `check:security`
  torna a exit 0, `test:ci` 136/136. Corretto su `dev` e non dentro la PR
  #104: è la lezione di D11/D14 — una fix impilata dentro una feature PR
  è esattamente ciò che, al merge, ha già revertito una fix una volta.
  Nota ricorrente: **`test:ci` non è il gate CI**; l'audit gira solo in CI,
  quindi un verde locale non ha mai implicato un verde su GitHub.

- D27 [2026-08-13, riscritto dopo diagnosi] [bug/responsive] **P0 — sotto gli
  820px il Run non ha un contenitore che scorra: ogni Focus lascia controlli
  fuori dallo schermo, irraggiungibili.** Nato come "il pulsante Next Turn a
  390px", si è rivelato molto più largo quando l'ho misurato davvero.

  **Meccanismo (corretto: la prima stesura lo attribuiva al dock, sbagliando
  bersaglio).** `.app-shell` (index.css) è una colonna flex alta `100dvh` con
  `overflow: hidden`, e `index.css:738` rende `.app-content > .run-workspace`
  un item `flex: 1`. L'altezza del workspace è quindi decisa dall'algoritmo
  flex, non dal CSS della sessione: la regola `@media (max-width: 820px)` in
  `session.css` che dice `height: auto; grid-template-rows: auto auto auto auto`
  **non vince mai**. Misurato: la riga 2 della griglia riceve lo spazio
  *avanzato* (`720 − 57 − 223 = 440px`) mentre il suo contenuto è **1695px**;
  il contenuto trabocca `visible` e il dock, che è la riga 4 e dipinge dopo, ci
  finisce sopra. Il dock sta dove deve: **l'elemento da correggere è il
  contenitore di scorrimento che non esiste.**

  **Ampiezza del guasto** (misurata su tutti e 4 i Focus × 3 larghezze, contando
  i controlli il cui centro cade sotto il viewport o è coperto da un altro
  elemento):

  | | Narrative | Social | Exploration | Combat |
  |---|---|---|---|---|
  | 390×844 (Pixel 5) | 9 fuori schermo | **11** | 4 | 3 + 5 coperti |
  | 768×1024 | 4 | 9 | 2 | 1 |
  | 820×1180 | 2 | 6 | 2 | 1 |

  Overflow non scorribile: **578→1561px** a seconda del Focus. Non è un difetto
  di Combat né di contrasto: **l'intera modalità impilata sotto gli 820px è
  inservibile**, e il tablet-landscape/laptop 13" è il device dichiarato "al
  tavolo" dal ledger.

  **Due tentativi di fix, entrambi scartati — perché la prossima iterazione non
  li rifaccia:**
  1. `.run-workspace { overflow-y: auto }` a ≤820: rende Next Turn raggiungibile
     scorrendo, **ma le righe restano schiacciate** (440px) e il dock continua a
     coprire in permanenza una banda della lista. Mezza fix.
  2. `.app-content { overflow-y: auto }` + workspace `flex: 0 0 auto`: risolve
     l'altezza **ma rompe la shell** — l'header intercetta i click sul Focus
     selector (`screen-manager__primary` sopra il selettore), e tocca anche
     Prepare. Regressione peggiore del bug.
  La strada giusta va **disegnata**, non indovinata: o il Run diventa una
  colonna che scorre con dock in fondo al flusso (e allora la shell deve
  cedere lo scroll senza che l'header si sovrapponga), o resta viewport-locked
  e ogni pannello scorre internamente anche sotto gli 820 (cioè si rinuncia
  all'impilamento). **È un ruling di design con conseguenze su entrambe le
  modalità: non lo prendo da solo.**

  **Aggiornamento 2026-09-25:** axe 4.13 vede il difetto anche nella scansione
  del Run su `chromium-mobile`: il dock è dipinto sopra il notebook e i nomi
  degli strumenti del dock risultano a 1.06–1.29:1 sul pergamena. Per questo
  `@axe-core/playwright` è trattenuto a 4.12 (D31); va sbloccato con la fix.

  **Contraddizione da sanare insieme:** la riga *Responsive* della matrice di
  accettazione dichiara `manual-pass at 1487×1058, 768×1024, 390×844 including
  overlap regression` — cioè manual-pass **esattamente alle due larghezze qui
  misurate come rotte**. Il file è di PR #101, ancora aperta: la correzione va
  fatta lì o subito dopo il merge, non in parallelo.

- D28 [2026-08-13] [design] **RULING preso dal loop: i toggle condizione stanno
  nel live editor, non sulla riga.** Il §next-decidable chiedeva "sulla riga
  combattente, riusando le `.condition-chips`". Motivo dello scostamento: i
  controlli in-riga sono già stati provati e rimossi — alla iter. 15 erano
  13×19px, sotto il minimo WCAG 2.5.8 di 24px, e alla iter. 18 il tie-reorder è
  stato spostato nell'editor esattamente per questo; la riga in compact è ~38px
  e non regge controlli da 24px. **Ciò che il ruling costa, detto per intero:**
  l'editor è la stessa posizione contro cui il DM ha un P1 ancora aperto
  (ledger iter. 18: "lontani dalla riga toccata, editor in fondo, fuori dallo
  scroll"), quindi la slice sposta il gap in un punto già contestato. Misurato
  in **entrambi** i contesti, perché danno numeri diversi e citarne uno solo
  come "a 390px" è esattamente l'imprecisione che il verifier ha contestato: su
  `chromium-mobile` (Pixel 5, 390×844) i toggle cadono a `top: 1026` in un
  viewport da 844 e misurano **44×44px**; su un chromium nudo a 390×844,
  `top: 966` e **41×26px**. In entrambi i casi su telefono non è "un tap", è
  scorri-e-tap — ma sul device vero i target sono 44px, non 25,5. La chiusura
  naturale è il P1 già a ledger —
  **editor ancorato alla riga selezionata / pinnato in alto** — che vale sia
  per i toggle sia per Earlier/Later. Non promosso a fatto compiuto: il DM
  potrà bocciare la posizione.

- D26 [2026-08-13] [docs/a11y] **Stessa specie di overclaim del 44px, ma
  pre-esistente**: la cella *Accessibility/input* dice "keyboard/200%", mentre
  `e2e/critical-flows.spec.ts:145` si intitola "200% reflow **equivalent**" e
  verifica soltanto l'assenza di scroll orizzontale a un viewport di 640px —
  più debole del reflow WCAG 1.4.10, che è l'equivalente a 320px. Non
  introdotto da D24 e quindi non assorbito nella slice (residue-routing). Da
  chiudere in due modi possibili: restringere la dicitura della cella come si è
  fatto per i 44px, oppure irrobustire la prova a 320px e tenere la dicitura.
  Trovato dal loop-verifier.

- D25 [2026-08-13] [ci/ops] **Trappola d'ambiente, misurata: la matrice
  `@critical` completa dentro un solo container Playwright dà falsi rossi.**
  Quattro progetti insieme (44 prove, 11 worker, un solo server `preview`) →
  **14 failed** sparsi su firefox, webkit e chromium-mobile; **gli stessi test
  rilanciati un progetto per volta nello stesso container passano tutti**. È
  contesa di risorse, non regressione. Chi verifica WebKit da Fedora deve
  separare i progetti o limitare `--workers`, altrimenti legge un rosso che non
  esiste — ed è un rosso convincente, perché cade proprio sui gate axe. Da
  valutare: fissare `workers` nel `playwright.config.ts` per il caso container,
  oppure documentarlo nel runbook. Evidenza:
  `docs/verification/2026-08-13-accessibility-matrix.md`.
- D16 [2026-08-07] [security] Il repo ha 7 secret creati il 2025-04-26 per il
  workflow project-board eliminato in D10: `TOKEN` (verosimilmente un PAT),
  `PROJECT_ID`, `STATUS_FIELD_ID`, `IN_PROGRESS_OPTION_ID`,
  `COMPLETED_OPTION_ID`, `MAYBE_OPTION_ID`, `NEW_OPTION_ID`. Nessun workflow li
  usa più. Revocare un credenziale è azione dell'utente: il loop non tocca i
  secret. **Consiglio: revocare `TOKEN`** — è un PAT fermo da 15 mesi con scope
  ignoto e nessun consumatore.

## Chiusi

- D29 [2026-08-13 → 2026-09-25] [design/coverage] **"Lo stato non è mai solo
  colore": completato**, branch `fix/state-not-only-colour`. Worklist rimisurata
  su `dev` (i numeri di riga di agosto erano slittati). (a)+(b) stato leggibile a
  macchina: beat (`aria-pressed` + `aria-current="step"`, spunta in Phosphor al
  posto del glifo), outline del notebook (`aria-current="location"`), momenti di
  esplorazione (`aria-current="step"`), pillola attitudine (nome accessibile con
  lo stato), pin dei riferimenti (`aria-pressed`, testo fisso "Pin" + icona
  piena/vuota: il vecchio Pin/Unpin rompeva label-in-name), toggle della sidebar,
  help dei widget e review di QuickCapture (`aria-expanded`), "Review captures"
  (`aria-haspopup="dialog"`). (c) Visivo: 19 regole di stato su 28 erano solo
  colore; 14 hanno già il segnale altrove (stella piena, testo, radio nativo,
  contenuto rivelato), 5 corrette con il token `--as-state-mark` (barra nel
  colore del testo) o con la sottolineatura (toggle Prepare/Run: la barra navy
  si fondeva col telaio navy, verificato a 3x). **Guardia:**
  `src/styles/stateCues.test.ts` legge i CSS e fallisce su ogni nuova regola
  di stato solo-colore; sul CSS vecchio indica esattamente i 5 siti. La frase di
  `design-qa.md:33` ora è vera e cita il test.

- D23 [2026-08-07 → 2026-09-25] [merge] PR #101 (acceptance-matrix) mergiata su
  richiesta dell'utente, insieme a #104 (toggle condizioni).

- D24 [2026-08-13 → 2026-08-13] [docs] **Riga *Accessibility/input* promossa**
  (§next-decidable 1). La revisione del 2026-08-07 aveva posto una condizione
  esplicita — "si potrà aggiornare solo dopo quel merge" — e il merge di #103
  l'ha soddisfatta: la colonna *Browser* passa a verde automatico in entrambi i
  temi su tutte e quattro le lane. La riga **resta `partial`**: manca l'audit
  moderato con persone reali. Prova rifatta in locale invece di citare la CI:
  `test:ci` 136/136, matrice **41 passed + 3 skip, 0 failed**, webkit nel
  container `v1.61.1-noble` (su Fedora non parte per librerie mancanti).
  Corretto per strada un errore di conteggio nella prosa del 2026-08-07, che
  dava "11 manual-pass, 8 partial, 3 green" come conteggio *effettivo* mentre
  erano i numeri **prima** delle sue stesse promozioni: ricontate le celle,
  sono **12 / 6 / 4** — come il docket D15 già diceva correttamente. Il branch
  è stato aggiornato da `dev` perché la CI della PR era rossa su
  `check:security` per l'assenza di #100, non per il suo contenuto.
  **Nota di protocollo:** il loop-verifier ha bocciato la prima stesura della
  cella, che accorpava il gate **44px** alle prove cross-browser mentre gira
  `test.skip`-ato su chromium-mobile soltanto. Overclaim corretto **prima del
  push**, ed è esattamente il caso per cui il gate esiste: era un errore in
  senso favorevole a sé stesso, in una cella che serve a impedire proprio
  quello.

- D22 / D20 / D18 [2026-08-07 → 2026-08-07] [merge] **Mergiati tutti e tre in
  `dev` su autorizzazione esplicita dell'utente**, in quest'ordine e ciascuno
  con la CI verde come precondizione: **#100** (sblocco di `check:security`),
  **#99** (react 19.2.8 combinato), **#103** (gate axe dark + fix D11/D17/D3,
  aperta da `test/dark-axe-critical`). #99 e #103 sono state aggiornate da `dev`
  prima del merge e il lockfile riconciliato con npm invece che dal merge
  testuale — verificato che react e react-dom restassero allineati e che
  `check:security` restasse a 0. Coda di D20: **#93 e #94 si sono chiuse da
  sole**, dependabot le ha ritirate appena react ha raggiunto 19.2.8 in `dev`;
  non è stato necessario chiuderle a mano.

- D15 [2026-08-07 → 2026-08-07] [docs] Acceptance-matrix riallineata (**PR
  #101**). Era ferma a prima dei merge del 2026-07-16: citava come aperti la
  prova Timer post-sospensione (automatizzata dal PR #84) e il lane WebKit
  (verde in CI dal PR #83). Effetto: `partial` 8 → 6, `manual-pass` 11 → 12,
  `green` 3 → 4. **Correzione di un errore mio**: avevo riportato "3 missing,
  2 red, 2 blocked" nel digest dell'iterazione 11 — sono zero tutte e tre. Quel
  conteggio veniva da un grep che pescava la legenda e la frase di chiusura
  invece delle celle. Il quadro di accettazione è migliore di come l'avevo
  descritto. Registrato anche cosa tiene ferme le righe `partial`: quasi mai il
  codice — evidenza browser solo `manual-pass`, UI di validazione incompleta,
  audit moderato mancante, deploy di produzione mai eseguito.

- D21 [2026-08-07 → 2026-08-07] [deps/ci] Gate di sicurezza sbloccato con
  **PR #100**. Quattro advisory pubblicate contro versioni già pinnate
  (`brace-expansion`, `js-yaml`, `undici` high; `postcss` moderate): non erano
  le dipendenze a essere cambiate, erano le advisory a essere nuove — ecco
  perché il rosso è comparso senza che nessuno toccasse nulla. `npm audit fix`
  senza `--force`: solo lockfile, 6 pacchetti transitivi patch/minor, 0
  aggiunti, 0 rimossi, `package.json` invariato. `check:security` passa da
  exit 1 a exit 0; l'audit di produzione era già 0 e resta 0, quindi il rischio
  era confinato al tooling. Gate: `test:ci` 136/136, e2e 37+3 con 0 failed.

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
