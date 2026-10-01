# HANDOFF — ArcanaScreen

Aggiornato: 2026-10-01, iterazione 38 (riga Theme della matrice resa coerente, test dei controlli dell'header). Iterazione 37 (D44 marker di pareggio). Iterazione 36 (D43 duplica combattente, turno che non salta). Iterazione 35 (D42 snapshot con party, preferenze e tema; mappa ridisegnata). Iterazione 34 (D41 merge dell'import non distruttivo). Iterazione 33 (D40 condizioni in riga in compact). Iterazione 32 (D39 compact: 8 combattenti al laptop 13"). Iterazione 31 (D38 Quick Reference = condizioni dei toggle). Iterazione 30 (e2e ciclo di vita Screen; D37 toast sopra Prepare/Run). Iterazione 29 (D28 editor del combattente sotto la riga; mappa ridisegnata dalle fonti). Iterazione 28 (D26 reflow a 320px: pannelli Search e impostazioni fuori schermo). Iterazione 27 (D36 colori del tema scuro: 3 difetti veri). Iterazione 26 (D35 barra Dice/Timer fissa al telefono, Responsive green). Iterazione 25 (landing di #115/#116, audit brace-expansion, D27 corretto con ruling dalla spec, tutto mergiato dal loop su direttiva utente). Iterazione 24: D33 header. Iterazione 23: react-hooks 7, D34. Iterazione 22: D29 chiuso, PR in attesa di merge. Iterazione 21 (stabilizzazione su richiesta
dell'utente: tutte le PR aperte chiuse, gate di sicurezza sbloccato, toolchain
portata avanti, un falso allarme di salvataggio corretto). Iterazioni: 21
(D31/D32/D33), 20 (diagnosi D27), 19 (D27/D28/D29/D30, PR #104), 18 (D24/D25,
PR #101), 17 (D15), 16 (D21), 15 (D14), 14 (D3), 13 (D17), 12, 11 (D13).

## Stato corrente

- `origin/dev` (2026-09-30) contiene tutto: D29, react-hooks 7, D33 header,
  audit `brace-expansion` (#118), D27 Run che scorre sotto gli 820px (#120),
  react-hot-toast 2.6.1 (#113), vitest 5.0.2 + @types/node (#121). **Zero PR
  aperte.** Mergiate dal loop dopo la direttiva utente sull'autonomia; ognuna
  aggiornata su `dev` e verde su tutti e cinque i job CI, WebKit compreso.
- Il nuovo e2e di raggiungibilità (D27) è verde anche su WebKit in CI.
- **Trappola PR impilate:** una PR impilata si mergia nel suo branch base, non
  in `dev`, a meno che il base venga cancellato prima (GitHub allora la
  riporta su `dev`) o la PR venga ritargettata. Dopo ogni merge verificare con
  `git merge-base --is-ancestor <sha> origin/dev`. Meglio ancora: non impilare.
- Toolchain ora: Vite 8 (rolldown), Vitest 5, jsdom 30, Playwright 1.63,
  Tailwind 4.3, TypeScript 5.9, @types/node 26. Trattenuti con motivo in
  `.github/dependabot.yml`: eslint 9, typescript <6, react-hooks 5, axe 4.12.
- Gate sul branch di landing (2026-09-30, workstation Fedora): `test:ci`
  exit 0, **148/148** unit, budget ok (**CSS 120.8/130 KiB**); e2e
  `@critical` verde un progetto per volta su chromium-desktop (11+1 skip),
  chromium-mobile (12) e firefox-desktop (11+1 skip). WebKit: solo in CI.
- **`test:ci` NON equivale al gate CI.** Il workflow `Quality gate` esegue in
  più `npm audit` e la matrice browser. Advisory nuove fanno diventare rosso
  `dev` senza che nessuno tocchi nulla (D21, D30, D31): quando una PR
  dependabot è rossa, controllare prima `npm audit` su `dev`.
- **Lockfile:** npm 10.9.8 crasha nel peer-set di vitest (`edgesOut` null).
  Per rigenerarlo: `npx -y npm@11 install`; poi verificare `npm ci` con npm 10.
- Trappola operativa: il webServer Playwright è `npm run preview`, che serve
  `dist`. Una modifica a CSS/TS non si vede finché non si rifà
  `npm run build`, e `reuseExistingServer` ricicla un preview stantio.

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
- **Trappola WebKit nei test:** il `summary` di un `<details>` annidato in un
  pannello chiuso risulta visibile per Playwright su WebKit (su Chromium no):
  cliccarlo va in timeout. Nei test, scorrere solo i `details` di primo livello.
- **Trappola `pkill`:** mai `pkill -f '[v]ite'` nella stessa riga di comando che
  contiene `npx vite preview`: la regex trova la shell stessa e la uccide (exit
  144), e tutto ciò che segue non gira. Il 2026-09-30 ha lasciato una fix in
  uno `git stash` mai ripreso.
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

## Loop fermo il 2026-10-01 — decisioni che aspettano l'utente

Le iterazioni 25–38 hanno chiuso tutte le leve di prodotto che il loop poteva
prendere da solo (D26–D28, D33, D35–D44). Matrice: 12 `manual-pass`,
5 `partial`, 5 `green`, 0 `red`. Le righe `partial` rimaste non si chiudono
senza una decisione dell'utente:

1. **Design QA senza riferimento** (*Screen create*, *Rename/delete*, *Theme*):
   esistono solo quattro mockup del Run in chiaro. O si disegnano i riferimenti
   (gestione Screen, tema scuro) o la Design QA di quelle righe si dichiara
   fuori dall'orizzonte. Cambia il criterio di accettazione.
2. **Audit moderato** (*Accessibility/input*): serve gente vera.
3. **Deploy di produzione** (*Release/rollback*): pubblico.
4. **D16**: revoca dei secret orfani, incluso il PAT `TOKEN`.

Una risposta a una qualsiasi di queste riapre il loop (`/loop /product-loop`).

## §next-decidable (in ordine)

Stato al 2026-10-01, dopo l'iterazione 38.

1. **D35 fatto**: al telefono Dice e Timer in una barra fissa di 61px, scroll
   per raggiungerli da 1842–2199px a 0. *Responsive* ora `green`.
2. Nulla in attesa di merge: il loop mergia da solo (vedi Protocollo).
   **Budget CSS: 124.2/130 KiB, margine 5.8.** La prossima slice che aggiunge
   CSS deve guardarlo; D36 (token al posto dei colori a mano) può ridurlo.
3. **Leve di prodotto, in ordine** (prese da matrice e ledger, D28 chiuso):
   a. ~~e2e del ciclo di vita dello Screen~~ fatto (iter. 30): tre `@critical`,
      e hanno trovato D37 (toast sopra Prepare/Run). *Screen create* e
      *Rename/delete* restano `partial` solo per il Design QA.
   b. ~~Condizioni rapide vs Quick Reference~~ fatto (iter. 31, D38): una
      sola lista, il pannello spiega ciò che si tocca.
   c. ~~Compact a 8 combattenti~~ fatto (iter. 32–33, D39/D40): 8/8 a
      1280×720, 1024×768, 900px e tablet touch 1180×820.
   d. ~~Validazione dell'import~~ fatto (iter. 34, D41): il merge
      sovrascriveva party e preferenze; ora non toglie nulla, e l'anteprima dice
      l'effetto. Matrice: 12 `manual-pass`, 4 `partial`, 6 `green`.
   e. ~~Snapshot anche per party e preferenze~~ fatto (iter. 35, D42).
   Leve successive (fonti: matrice e ledger):
   f. ~~Riga Theme~~ fatto (iter. 38): test di componente dei controlli
      dell'header; stato corretto a `partial` (Design QA dark senza riferimento).
   g. ~~Duplica combattente~~ fatto (iter. 36, D43), più il turno che saltava
      quando si inseriva qualcuno sopra il combattente attivo.
   h. ~~Marker di pareggio~~ fatto (iter. 37, D44).
   i. Design QA: *Screen create*, *Rename/delete* e *Theme* restano `partial`
      solo per la Design QA (spec 01, "Design QA gate": confronto affiancato con
      i mockup, P0–P2 corretti). Per il tema scuro manca un riferimento: la leva
      è disegnarlo (tokens dark esistono) o dichiarare la Design QA dark fuori
      scope. È l'ultima leva di prodotto nella mappa.
4. Ancora dell'utente: **D16** (revoca dei secret orfani, incluso il PAT `TOKEN`).
5. e2e in container: leggere prima **D25**, un progetto per volta. L'immagine
   podman per WebKit va portata a `mcr.microsoft.com/playwright:v1.63.0-noble`
   (Playwright ora è 1.63; la v1.61.1 in cache non basta più).

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
  documentazione/protocollo fuori dal loop. **Superato il 2026-09-30:** il
  merge ora lo fa il loop (vedi Protocollo).

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
merge su `dev` → digest. **Dal 2026-09-30 il loop mergia da solo** (direttiva
utente: sviluppo il più autonomo possibile), alle condizioni scritte in
`docs/DOCKET.md` sotto "Chi decide": PR non impilata, aggiornata su `dev`,
cinque job CI verdi. Restano dell'utente: scope e obiettivo, secret, deploy
di produzione. Tutti gli altri ruling li prende il loop e li mette a verbale.
