# HANDOFF — ArcanaScreen

Aggiornato: 2026-08-13, iterazione 20 (D27 diagnosticato, **fix non presa**:
serve un ruling di prodotto). La 19 ha lasciato la PR #104 aperta e verde. `dev` contiene lo
sblocco della CI, react 19.2.8 e il gate axe dark con i suoi tre
fix. Iterazioni: 20 (diagnosi D27), 19 (D27/D28/D29/D30, PR #104), 18 (D24/D25, PR #101), 17 (D15, PR #101), 16 (D21, PR #100), 15 (D14,
PR #99), 14 (D3), 13 (D17), 12 (diagnosi D17), 11 (D13). Il loop era fermo by design dal
2026-07-16 (it. 10) in attesa dei merge dell'utente: i merge sono avvenuti
tutti, e HANDOFF/DOCKET erano rimasti indietro di tre settimane. Ruling
`[decisione]`/`[design]`/`[ci]`/`[deps]` presi dal loop (D3, D9, D10).

## Stato corrente

- `origin/dev` @ `79ca398` (2026-08-13; sopra `22bb1e2` ci sono i ruling del
  2026-08-07 e le iterazioni 18–19). Il tip contiene tutte le PR feature del
  ciclo precedente:
  #83 (fix CSP WebKit), #84 (prova Timer post-sospensione), #85 (input dark),
  #86 (react allineato 19.2.7), #87 (sweep session.css), #88 (toggle
  Prepare/Run dark), #89 (token shell header). Sopra ci sono solo bump
  dependabot di CI actions.
- Applicato il 2026-08-07: gruppo `react` in `.github/dependabot.yml` (D9) ed
  eliminazione di `.github/worklows/` (D10). Motivazioni per esteso nel docket.
- Gate su `dev` dopo i merge: `test:ci` 136/136 + lint 0 errori + CSS
  119.6/130 KiB; `check:security` exit 0; e2e **41 passed + 3 skip, 0 failed**
  su tutta la matrice, WebKit incluso. La CI di GitHub è verde su tutti e
  cinque i job — verificata su ciascuna PR prima del merge.
- **`test:ci` NON equivale al gate CI.** Il workflow `Quality gate` esegue in
  più `npm run check:security` (audit di tutte le dipendenze) e la matrice
  browser. Un `test:ci` verde non ha mai implicato una CI verde, ed è così che
  la #99 è passata in locale ed è caduta su GitHub.
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

### Workstation Fedora (dove ha girato l'iterazione 18)

- **WebKit non parte**: `browserType.launch` chiede `libicu74`/`libjpeg-turbo8`/
  `libwoff1`/`gstreamer1.0-libav`, nomi di pacchetto Debian. Le 11 prove
  `@critical` cadono tutte su `webkit-desktop` e **non è un difetto dell'app**.
  Rimedio funzionante: l'immagine `mcr.microsoft.com/playwright:v1.61.1-noble`
  con podman, già in cache locale —
  `podman run --rm -v "$PWD":/work:Z -w /work --network host <img> bash -c "npx
  playwright test --grep '@critical' --project=webkit-desktop"`.
  **Un progetto per volta**: vedi D25.
- `npm ci` prima dei gate vale anche qui: il `node_modules` locale precedeva
  l'adozione di Work Sans e il build cadeva sulla risoluzione di
  `@fontsource/work-sans`.

## §next-decidable (in ordine)

Fatto il 2026-08-13 (D24): la riga *Accessibility/input* è promossa, sul branch
della PR #101 — aggiornato da `dev`, con la CI sbloccata. Con questo il lavoro
**operativo** non-gated è di nuovo esaurito, e il prossimo passo torna a essere
di **prodotto**: viene dal ledger `docs/review/2026-07-13-design-review-loop.md`,
la cui riga "Next (iter. 20)" è in sospeso da luglio.

1. **D27 — ⚑ SERVE UN RULING TUO, non è più una slice che il loop possa
   prendere.** L'iterazione 20 l'ha diagnosticato e **non** l'ha corretto. Non
   è "il pulsante Next Turn a 390px": sotto gli 820px il Run **non ha un
   contenitore che scorra**, quindi ogni Focus lascia controlli fuori dallo
   schermo — misurati **11 su Social a 390px**, 9 su Narrative, e da 1 a 9
   anche a 768 e 820. La causa è che `.app-shell` è `100dvh` +
   `overflow: hidden` e `index.css:738` rende il workspace `flex: 1`: la regola
   `@media (max-width: 820px)` di `session.css` non vince mai. Due fix sono
   state provate e **scartate** (una lascia il dock sopra la lista, l'altra
   rompe l'header della shell anche in Prepare) — dettaglio nel docket, perché
   la prossima iterazione non le rifaccia. **La scelta è di prodotto:** o il Run
   diventa una colonna che scorre, o resta viewport-locked e si rinuncia
   all'impilamento sotto gli 820. Tocca entrambe le modalità.
   *(voce storica, superata dalla riga qui sopra:)* a 390px il pulsante
   *Next Turn* è irraggiungibile (P0 responsive, pre-esistente).
   L'initiative footer **eccede il proprio spazio** e finisce dentro la banda
   del dock, che gli è dipinto sopra: "Up next" legge **2.85:1** (axe) e il
   pulsante primario del combattimento cade fuori dal viewport
   (`elementFromPoint` → `null`). Sul device reale al tavolo il DM non può far
   avanzare il turno. Misure complete, **con il contesto di emulazione**, nel
   docket — l'elemento da correggere è l'overflow del footer, non il dock. È
   **layout responsive, non un colore**: slice dedicata, con giudizio designer,
   e alla fine va tolta la
   guard mobile in `e2e/critical-flows.spec.ts` (che oggi esclude la scansione
   axe light dell'editor su mobile proprio per questo).
2. **D29 — completamento di pattern sullo stato non-cromatico** (11 siti,
   worklist per file:riga nel docket, fra cui il toggle Prepare/Run). Da fare
   come **un** pattern ovunque in una passata sola, non a spizzichi.
3. Ruling dell'utente ancora aperti: **D23** (merge PR #101, ora con due commit
   in più) e **D16** (revoca dei secret orfani, incluso il PAT `TOKEN`).
   Aggiunto: **PR #104** (toggle condizioni, iter. 20) è aperta con la **CI
   verde su tutti e cinque i job**, WebKit incluso, e attende il merge —
   che resta dell'utente.
4. Se si rilancia la matrice e2e in container, leggere prima **D25**: quattro
   progetti insieme danno falsi rossi convincenti.

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
