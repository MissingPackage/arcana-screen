# DOCKET — decisioni e residui

Convenzione: una riga per item, `D<n> [data] [tipo]`.

**Chi decide (aggiornato 2026-09-30, direttiva utente: "sviluppo il più
autonomo possibile"):** il loop prende i ruling `[decisione]`, `[design]`,
`[ci]` e `[deps]` **e mergia su `dev`** le proprie PR e le dependabot, senza
chiedere. Condizioni di merge: la PR punta a `dev` (mai impilata), è
aggiornata sul `dev` corrente (`gh pr update-branch`) e ha **tutti e cinque i
job CI verdi**, WebKit compreso. Merge commit, branch cancellato, poi verifica
con `git merge-base --is-ancestor`. Restano dell'utente: i cambi di scope o di
obiettivo, i secret (D16), il deploy di produzione e ogni cosa pubblica fuori
dal repo. Quando Linear è raggiungibile, migrare gli item aperti.

## Aperti

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

- D44 [2026-10-01 → 2026-10-01] [design] **Il marker di pareggio sparisce
  quando il DM ha deciso l'ordine.** P2 del DM (ledger iter. 18): il marker
  restava per sempre, anche dopo Earlier/Later. Ora il pareggio è "aperto" solo
  finché uno dei due non è stato ordinato a mano (`tieOrdered`, impostato da
  `reorderTiedCombatant` su entrambi); una nuova iniziativa per uno dei due lo
  riapre, e un duplicato nasce in pareggio aperto con la sua fonte
  (`hasOpenTie`). Scartato: dedurre la risoluzione dai `tieBreaker`, che per i
  mostri valgono l'iniziativa e per i PG il modificatore, quindi darebbero un
  ordine arbitrario. Earlier/Later restano disponibili anche dopo. Test di
  dominio.

- D43 [2026-10-01 → 2026-10-01] [feat/bug] **Duplicare un combattente, e il
  turno che non salta più.** Il P1 del DM "clone/duplica" (ledger, iter. 4) non
  era coperto da Qty, che serve all'inizio dello scontro: a metà combattimento
  "ne arriva un altro uguale" chiedeva di riscrivere nome, CA e HP. Ora
  "Duplicate" nell'editor live aggiunge una copia con il primo numero libero
  ("Worg" → "Worg 2"), stessa CA e iniziativa, HP pieni, nessuna condizione
  (`duplicateCombatant`). Sul percorso un difetto vero: `currentIndex` è una
  posizione, e i quattro punti che riordinano (aggiunta, pareggio, modifica
  dell'iniziativa, impostazione in blocco) non lo aggiornavano, quindi inserire
  qualcuno sopra il combattente attivo passava il turno a chi scivolava in quel
  posto. Ora `resortEncounter` fa seguire il turno a chi lo tiene; prima del
  primo Next Turn (round 1, primo posto) agisce la cima del nuovo ordine, perché
  si stanno ancora impostando le iniziative. Test di dominio e di componente;
  mutazione verificata (col vecchio `addCombatant` il turno passa a "Worg 2").
  Factorizzato anche il generatore di id dei combattenti, ora condiviso.

- D42 [2026-10-01 → 2026-10-01] [bug/trust] **Gli snapshot di recupero ora
  riportano anche party, preferenze e tema.** Coprivano solo `arcana_screens`:
  un replace dell'import (che sostituisce party, preferenze e tema subito dopo
  gli Screen) o un ripristino perdevano il resto senza ritorno. Ogni snapshot
  salva ora, accanto agli Screen, i payload di `arcana_party`,
  `arcana_evolution` e `arcana_theme` del momento; il ripristino li reinserisce
  passando dagli store (stessa sanificazione dell'import). Snapshot vecchi senza
  companion: si ripristinano solo gli Screen, come prima. Le chiavi sono ora
  costanti in `safeStorage.ts` usate anche dagli store, e il tema di default è
  esportato da `themeStore.ts`. Testi aggiornati (anteprima del replace,
  sezione Recovery). Test unitario rosso sul codice vecchio. Il Reset resta
  "cancella tutto", snapshot compresi, come dice la sua conferma.

- D41 [2026-10-01 → 2026-10-01] [bug/trust] **Il "merge" di un backup
  sostituiva il party e le preferenze.** Cercando cosa rendesse `partial` la UI
  di validazione dell'import: `importBackup` sovrascriveva roster, densità,
  lingua, accento, template, reference pack e tema **anche** con "Merge with
  current screens", e gli snapshot di recupero coprono solo `arcana_screens`.
  Unire il backup di un altro DM cancellava il proprio party senza ritorno,
  mentre l'anteprima mostrava solo i nomi degli Screen. Ora il merge aggiunge
  ciò che manca (Screen, personaggi, template e pack per id) e lascia intatti
  preferenze e tema; il replace sostituisce tutto, come dice. L'anteprima dice
  l'effetto di ciascuna strategia (`describeImport`), compreso che solo gli
  Screen sono recuperabili dagli snapshot. Test unitario rosso sul codice
  vecchio (il personaggio locale spariva), e2e del backup esteso.

- D40 [2026-10-01 → 2026-10-01] [design] **In compact, fra 821 e 1100px, le
  condizioni stanno sulla riga del combattente.** Residuo misurato di D39: a
  1024×768 compact 7/8, perché le chip su seconda riga rendevano alta 58px
  una riga con condizioni (invece di 38). In compact, fra 821 e 1100px, le chip
  diventano una quarta colonna (`58px | nome 1fr | HP 72px | condizioni ≤ 9rem`,
  a capo solo dentro la cella), condivisa con l'intestazione che torna a
  mostrare "Status"; sotto gli 820px la pagina scorre e la seconda riga resta.
  Sul percorso, una regressione mia di D39: a ~900px "Add combatant" e "Set
  initiative" andavano su due righe e allungavano l'header; ora sotto i 1100px
  Add mostra solo "+" (in entrambe le densità), badge AC e ACTIVE non vanno a
  capo ("ACTIV / E"), e la regola duplicata sotto i 520px è tolta. Misura
  compact: 900/1024/1100px **8/8, righe tutte da 38px**, nessun overflow. L'e2e
  degli otto combattenti ora prova anche 1024×768 (7/8 sul CSS di `dev`).

- D39 [2026-09-30 → 2026-09-30] [bug/design] **La densità compact ora mostra 8
  combattenti su un dispositivo da tavolo.** Era il P0 del DM (ledger iter.
  17: "non arriva a 8 combattenti visibili, il senso stesso del toggle");
  l'iter. 18 lo dava per chiuso con "~8", ma misurato su 8 combattenti: a
  1487×1058 8/8, a **1280×720 5/8** in compact (3/8 comfortable), a 1024×768
  5/8. Causa principale, trovata misurando: la regola del widget legacy
  `.combatant-list { display: grid; gap: 0.6rem }` in `index.css` valeva anche
  per la lista del Run, ~10px vuoti fra ogni riga (67px su 8); ora è limitata a
  `.initiative-tracker`. Poi "Add combatant" è salito nella riga del titolo
  accanto a "Set initiative" (+48px, entrambe le densità; solo "+" sotto i
  520px) e in compact sparisce la riga "Tap a combatant…" (+29px). Risultato:
  **1280×720 compact 8/8** (comfortable 4/8), tablet touch 1180×820 compact
  8/8 (target da 44px). Nuovo e2e `@critical` sul percorso vero (Density dal
  menu, ottavo combattente aggiunto): rosso sul codice di `dev` (5/8 e 7/8).
  Resta: a 1024×768 compact 7/8, perché sotto i 1100px le condizioni vanno su
  una seconda riga (58px invece di 38) per il P0 "condizioni visibili"; vedi
  la leva nella mappa.

- D38 [2026-09-30 → 2026-09-30] [design] **RULING preso dal loop: la Quick
  Reference di Combat spiega le condizioni dei toggle, da un'unica lista.** Il
  ledger (iter. 20): i cinque toggle rapidi (Prone, Poisoned, Concentration,
  Stunned, Restrained) non coincidevano con i cinque del pannello accanto
  (Blinded, Charmed, Frightened, Grappled, Incapacitated), "un DM lo nota
  subito". Scelta: il pannello legge `QUICK_CONDITIONS` e
  `QUICK_CONDITION_RULES` in `encounterModel.ts` (parafrasi delle regole 2024,
  SRD 5.2), quindi spiega sempre ciò che si tocca accanto. Scartati: allineare i
  toggle al pannello (il set dei toggle è quello più usato al tavolo, e
  Concentration sparirebbe) e tenere due liste (la causa del difetto). Costo:
  le cinque definizioni vecchie escono dal pannello rapido; quelle condizioni
  restano scrivibili nel campo libero dell'editor. Test di dominio e di
  componente (riferimento == toggle). Sul percorso: il link della fonte diceva
  "Monster Manual (Basic Rules 2024)" ma porta alle Free Rules; ora "D&D Free
  Rules (2024)".

- D37 [2026-09-30 → 2026-09-30] [bug/ux] **I toast coprivano l'interruttore
  Prepare/Run.** Trovato dal nuovo e2e del ciclo di vita su Firefox: dopo
  "Create screen" il clic su Run andava in timeout perché il toast lo
  intercettava. Misurato in Chromium e Firefox: a 1280px ogni toast (in alto al
  centro, y 16–61) copriva il toggle (y 11–51), per 2–4s le conferme e **15s**
  l'Undo dopo un'eliminazione; al telefono copriva la cima dell'header. Chromium
  passava il test solo per tempi. Ora i toast stanno in basso al centro, sopra
  il dock in Run (`--as-toast-offset`: 130px sopra gli 820px, 76px sotto). Costo
  accettato: in Prepare un toast copre per qualche secondo i pulsanti della
  cornice di un widget in basso, invece del controllo principale.

- D28 [2026-08-13 → 2026-09-30] [design] **RULING preso dal loop, corretto:
  l'editor del combattente si apre subito sotto la riga toccata.** Era il P1 del
  DM (ledger iter. 18: Earlier/Later, HP e condizioni "lontani dalla riga
  toccata, editor in fondo, fuori dallo scroll"). L'editor ora è reso nella
  lista, dopo la riga selezionata; il pulsante della riga è una disclosure
  (`aria-expanded` + `aria-controls` invece di `aria-pressed`); su desktop la
  lista scorre dentro il pannello, quindi l'editor si porta in vista con
  `scrollIntoView({block: 'nearest'})`. Misura, distanza riga → editor: **da
  68–587px a 12–44px** (il resto è la riga stessa), editor in vista a ogni
  larghezza; a 390px prima era fuori schermo. Scartate: editor fisso in cima
  al pannello (resta lontano dalle righe basse) e scroll automatico senza
  spostarlo (sistema la vista, non la distanza). Nuovo e2e `@critical`: prima e
  ultima riga a 1487 e 390px, editor in vista e a ≤16px; sul codice vecchio
  551px. Sul percorso: a 390px la barretta di selezione copriva il nome (senza
  icona) e ora ha spazio.

- D26 [2026-08-13 → 2026-09-30] [a11y] **RULING preso dal loop: la prova di
  reflow va a 320px, e ha trovato due pannelli rotti.** Scelta fra restringere
  la dicitura e irrobustire la prova: irrobustita. Il test ora misura 320×640
  in Prepare e Run, apre ogni pannello dell'header e conta i controlli fuori
  schermo. Trovati, e corretti:
  - **Search**, sotto i 700px, si apriva fuori dal bordo sinistro: 144px a 390
    e a 320 (etichetta, campo e aiuto tagliati, pagina senza scroll
    orizzontale quindi irraggiungibili). Il pannello era ancorato al bordo
    destro del pulsante, che lì sta nella metà sinistra dell'header; ora si
    ancora all'header intero con 1rem per lato.
  - **Help and resources**: le impostazioni (densità, lingua, tema) uscivano
    di 42px a destra **a ogni larghezza, 1280 compreso**: pannello da 12rem,
    righe a griglia con minimo 7rem + 7rem. Ora `min(18rem, 100vw − 2rem)` e
    colonne che si stringono.
  - Focus selector sotto i 380px: "Exploration" andava a capo a metà parola.
    Il 10px progettato per ≤820 non si è mai applicato (lo annullava il reset
    `.arcana-session button { font-size: inherit }`); a 390+ i 16px reali
    funzionano e restano, sotto i 380 si passa a 13px. Tolta la regola morta.
  Test rosso sul CSS vecchio, verde sul nuovo, su tre progetti.

- D36 [2026-09-30 → 2026-09-30] [a11y/tema] **Colori a mano nel tema scuro:
  passata fatta, tre difetti veri corretti.** Invece di tokenizzare 44
  esadecimali alla cieca, una sonda ha aperto in tema chiaro e scuro gli stati
  che la suite non visitava: opzioni dadi con errore e con vantaggio, Oracle
  con risposta, opzioni timer, revisione capture con stella e promozione,
  presenter della read-aloud, NPC coniato e ri-tirato, contatore e indizi di
  Exploration, Combat con danni, condizioni e reset. Axe su ciascuno, desktop e
  mobile. Trovati: pulsanti dell'Oracle `#fff` sotto inchiostro chiaro
  (**1.44:1** in dark) → `--as-surface-raised` (8.46:1); errore dei dadi
  `#a23a32` (**2.19:1** in dark) → `--as-danger-ink` (6.7:1 dark, 7.36:1
  chiaro); notebook narrativo che, allungato dalle capture, scorre senza tab
  stop (`scrollable-region-focusable`, in entrambi i temi) → `tabIndex={0}` con
  nome, eccezione `jsx-a11y` motivata come da documentazione della regola
  (WebKit non rende focalizzabili i contenitori che scorrono). Gli altri
  esadecimali stanno sul navy, scuro in entrambi i temi, o hanno già l'override:
  zero violazioni dopo la fix. I tre stati sono ora nel test axe scuro su tutti
  e quattro i progetti; rosso sul codice vecchio. Limite della sonda, non
  dell'app: su desktop la catena di stati a volte lasciava il selettore dei
  Focus non cliccabile; isolato, il selettore è libero.

- D35 [2026-09-30 → 2026-09-30] [design] **RULING preso dal loop, corretto:
  sotto gli 820px il dock è una barra di una riga fissata in basso.** Roll con
  la formula (es. `d20+1`), risultato, tempo e Start/Pause restano sempre in
  vista; dado, modificatore, opzioni, Oracle, contatore e Set time si aprono
  con "Tools", come il mini-player di un'app musicale. Aperto, il dock si
  ferma al 45% dell'altezza e scorre dentro, con i pannelli delle opzioni nel
  suo flusso. Misura: distanza di scroll da Roll e Start a 390×844 **da
  1842–2199px a 0**; barra alta **61px** (7% di 844) da 320 a 820px, senza
  overflow orizzontale. Scartati sui numeri: dock intero fisso (285px, un terzo
  dello schermo) e dock compatto su due righe (~115px). L'e2e di
  raggiungibilità ora controlla anche che Roll e Start siano in vista a inizio
  pagina, e ogni Focus con la barra aperta. Sul percorso: i pulsanti di
  *Review captures* vanno a capo invece di spezzarsi ("St / ar"), "Delete
  capture" usa `--as-danger-ink`, e le funzioni non-componente di
  `RunWorkspace.tsx` sono passate in `combatantIcons.ts` e
  `domain/partyCombat.ts` (lint da 4 warning a 0).

- D27 [2026-08-13 → 2026-09-30] [bug/responsive] **RULING preso dal loop,
  corretto: sotto gli 820px il Run è una colonna che scorre.** Il ruling non
  era una preferenza: la spec (*Responsive contract*, tablet: "reflow to a
  single main column with context following the hero surface"; telefono: "no
  content is hidden solely because it does not fit") e il prototipo di
  riferimento (`styles.css`, ≤900px: shell `min-height`, `run-view` a
  `height: auto`, dock nel flusso) scelgono già la colonna che scorre. Il
  "cockpit che non scorre" vale al viewport desktop di riferimento. Fix:
  `.app-shell--run` a ≤820px smette di essere bloccato a `100dvh` e scorre il
  documento; in più `.dock-stepper` non si stringe più (a 390px era largo 0 e
  il risultato del tiro ci stava sopra) e il dock va a capo come chiede la spec
  del telefono, invece di scorrere di lato. Misura: un nuovo `@critical` conta
  i controlli del Run non raggiungibili (portati in vista, il centro deve stare
  nel viewport e in cima): **71 su chromium-desktop (14 combinazioni su 15) e 79 su chromium-mobile (15 su 15) prima, 0 dopo su entrambi**. Tolta la
  guardia desktop-only del test axe; `@axe-core/playwright` sbloccato a 4.13 e
  tolto l'`ignore` in `dependabot.yml`. Emersi e corretti sul percorso: D36.
  Costo: D35. Storia della diagnosi (tentativi scartati, tabella per Focus):
  nel git log di questo file prima del 2026-09-30.

- D33 [2026-09-25 → 2026-09-25] [bug/layout] **Controlli dell'header sovrapposti
  sotto i 1100px: corretto**, branch `fix/run-header-390` (impilato su D34).
  Diagnosi: non dipendeva da D27. La barra delle utility era `position:
  absolute` in un buco da 5.5rem pensato per due icone; con Search ed Edit party
  è larga 243px e copriva lo switcher (≤700px) e il toggle Prepare/Run
  (700–1100px), **in entrambe le modalità**. Ora è una cella della griglia.
  Trovato misurando: il select (min-width 11rem) usciva dal suo wrapper
  `min-w-0` e finiva sotto il toggle anche a **1487px** nel Prepare con un nome
  lungo; ora il wrapper non scende sotto il select e va a capo la riga delle
  azioni. Sweep 390–1487px, nome lungo e corto: **0 sovrapposizioni** (prima
  2 a 390, 768, 800 e 1487). Costo: header +46px sotto i 700px (Run 122→168),
  +7px fra 768 e 1024; invariato sopra i 1100. Due soluzioni scartate:
  `flex-wrap` globale (header del Prepare a 1487px da 109 a 167px) e wrap
  limitato a ≤1100 (lasciava la sovrapposizione a 1487). Guardia: e2e
  `@critical` a 390/768/1100/1487, rosso sul CSS vecchio. Nota per chi scrive
  test simili: il contenuto di un `<details>` chiuso riporta un box anche se non
  è disegnato, quindi va filtrato risalendo tutti i `<details>` antenati.

- D34 [2026-09-25 → 2026-09-25] [deps/refactor] **eslint-plugin-react-hooks 7
  adottato**, branch `refactor/react-hooks-7` (impilato su D29), ignore tolto da
  `dependabot.yml`. Sette siti: idratazione dello Screen spostata da un effect di
  App a `main.tsx` (sparisce `screenIsHydrated`); tour senza stato per le
  dissolvenze (`@starting-style` + `key` per passo); `Date.now()` in un
  inizializzatore pigro nel timer; try/catch intorno al JSX di SimpleTable
  sostituito da un `WidgetErrorBoundary` per tool in ToolFrame (prima un tool in
  crash mandava tutta l'app alla recovery). **Trovato sul percorso:** la regola
  globale `* { transition: … }` di `index.css`, fuori layer, batteva ogni utility
  `transition-*` di Tailwind: la dissolvenza del tour non è mai partita. Messa in
  `@layer base`; misurato opacità 0.44 a 40ms e 1 a 540ms per passo, 1 subito con
  reduced-motion. Smoke persistenza: rimozione di un tool sopravvive al reload
  (5 → 4 → 4).

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
