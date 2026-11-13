# Review avversariale del 2026-11-13

Stato rivisto: `origin/dev` a `2fa39e2`, dopo il merge di tutte le PR aperte.
Tre revisori indipendenti (security, architettura, prodotto e roadmap), poi
verifica a mano dei finding in testa. Ogni riga dice come è stata verificata:
**rieseguito** (riprodotto di nuovo dopo il revisore), **letto** (confermato nel
codice), **riportato** (solo il revisore, non ricontrollato).

## Verdetto

Non è pronto per un lancio, né pubblico né privato, e la causa non è la
rifinitura. Prepare e Run sono due applicazioni dietro un interruttore: quello
che il DM prepara non arriva mai al tavolo, e il tavolo mostra la campagna di
qualcun altro. La milestone corrente (Launch polish) rifinisce l'ingresso di un
ciclo che non si chiude. Nessun DM vero ha mai usato l'app.

La sicurezza regge sul punto che conta: nessun dato non fidato arriva
all'esecuzione di codice. I problemi veri sono di robustezza (un file importato
può bloccare il workspace) e di catena di rilascio.

## I dieci finding, in ordine di danno

1. **Prepare non prepara Run.** *Rieseguito in browser, letto nel codice.*
   Uno Screen ha due modelli di contenuto senza contatto: i widget di Prepare
   (`useWidgetStore`, chiave `arcanaScreenLayout`) e il workspace di Run
   (`focusWorkspace` in `arcana_screens`). Note, catture e combattenti scritti
   in Prepare non compaiono in nessun Focus. Il widget di Prepare promette
   "Your prepared session notes will stay here while you change tools or
   modes". Dieci concetti sono implementati due volte (taccuino, cattura,
   riferimenti, dadi, timer, iniziativa, contatori, undo, ricerca, template).
   Il test e2e "loses nothing across Prepare and Run" fa il giro solo di una
   cattura fatta in Run.

2. **Ogni Screen si apre su una campagna finta che non si può sostituire.**
   *Letto: `focusModel.ts:105-185`, `useScreenStore.ts:95`.* Tutti i template,
   Blank compreso, partono da "The Festival of Ash" con Ser Kael e sette
   goblin. In Narrative solo il read-aloud ha un editor. Le "Encounter notes"
   sul worg sono scritte nel JSX (`RunWorkspace.tsx:649`): compaiono nel
   combattimento vero di ogni DM, anche dopo "Reset encounter".

3. **Una seconda finestra scatena una tempesta di scritture e brucia il
   recovery.** *Rieseguito sulla build finale.* Con una finestra: 0 eventi di
   storage in 1,5 s. Con il presenter aperto (`?present=1`): 728 in 3 s. I
   cinque snapshot di recovery distano 28 ms l'uno dall'altro, quindi non
   recuperano niente. Causa: evento di storage → rehydrate →
   `hydrateActiveScreen` crea un array nuovo → `saveActiveContent`
   (`App.tsx:75-77`) scrive e sposta `updatedAt` → l'altra finestra ripete.

4. **Un backup o un template costruito ad arte blocca il workspace.**
   *Rieseguito (test jsdom, non browser).* `validateScreen`
   (`dataPortability.ts:51-62`) controlla solo `id`, `name` e la lista dei
   tool; `focusWorkspace` entra senza controllo dei tipi, anche con la
   strategia "merge" presentata come sicura. Aperto lo Screen importato, ogni
   ricarica finisce sull'error boundary, e l'unica uscita nell'interfaccia è
   "Reset local data", che cancella anche gli Screen dell'utente e gli
   snapshot. Stessa classe per l'oggetto `evolution` del backup (finisce in
   `setState` senza filtro, nomi delle azioni compresi) e per l'import dei
   template (*riportato*).

5. **Il recovery fotografa ogni tasto.** *Riportato, coerente col punto 3.*
   `safeStorage.ts:77-99` salva uno snapshot a ogni scrittura di
   `arcana_screens`, e le scritture avvengono a ogni tasto senza debounce. I
   cinque snapshot sono gli ultimi cinque tasti, e occupano la stessa quota
   di localStorage dei dati vivi.

6. **I bottoni della gestione Screen sono invisibili in tema chiaro.**
   *Rieseguito e misurato.* Rename, Duplicate, Archive, Close, Save template e
   "Data & recovery" hanno testo crema su carta: 1,05:1. Non è una regressione
   del design system v2: prima del merge era 1,12:1. La regola
   `.arcana-header button.screen-action-button--quiet` (`index.css:857`) colora
   per l'header blu anche i pannelli chiari che si aprono dentro l'header. I
   cinque job CI erano verdi: le scansioni axe non aprono questi pannelli, e
   gli e2e del ciclo di vita cliccano bottoni che una persona non vede.

7. **Tre bottoni del Combat violano WCAG 2.5.3 Label in Name.** *Rieseguito
   con axe 4.14.* Vedi il docket, "Tre bottoni del Combat" (D48). `dev` è verde
   perché axe è trattenuto sotto la 4.14.

8. **Non esiste un percorso funzionante verso un rilascio.** *Rieseguito via
   API.* Zero tag, zero release, `release.yml` mai eseguito, GitHub Pages
   spento. La CI gira su `pull_request` e su `push` a `main`, ma il ramo vivo è
   `dev` e `main` è indietro di oltre 250 commit: la testa integrata di `dev` non
   viene mai provata, e le advisory nuove si scoprono solo quando qualcuno
   apre una PR (oggi: tre high trovate così). Il CHANGELOG parla di "tagged
   production deployment" e la versione dice `1.0.0-rc.1`.

9. **Il job di rilascio dà troppi permessi a `npm ci`.** *Letto.*
   `release.yml:15-18` concede `contents: write`, `pages: write` e
   `id-token: write` a livello di workflow, quindi anche al job che installa le
   dipendenze ed esegue i test. Una dipendenza di sviluppo compromessa al
   momento del rilascio può spingere commit su `dev` (il ruleset blocca solo
   cancellazione e force-push).

10. **Tre funzioni sono applicate a metà.** *Letto, numeri riportati.*
    Italiano: una quarantina di stringhe tradotte in tre file contro alcune
    centinaia fisse; in Run nessuna, quindi schermate in due lingue. Tour:
    non parte mai e punta a selettori che non esistono più
    (`tourSteps.ts`). Prepare al telefono: la libreria dei widget è una
    striscia tagliata sopra l'header (*rieseguito, screenshot a 390px*).

## Altri finding

- Il primo "Next Turn" di un incontro nuovo non fa nulla: l'interfaccia mostra
  attivo il primo combattente quando `currentIndex` è ancora nullo
  (`RunWorkspace.tsx:442`, `encounterModel.ts:200`). *Letto.*
- Danno solo a passi di 1 e 5: tredici danni sono sette click. *Riportato.*
- "Next Turn" è a 21 Tab di distanza con sette combattenti, senza scorciatoia;
  Esc non chiude l'editor del combattente. *Riportato.*
- Export e backup esistono solo in Prepare, dietro "?"; dopo un wipe il first
  run non offre l'import. *Riportato.*
- Il service worker ha un nome di cache costante e non rinfresca mai la shell:
  offline si resta sul codice della prima installazione. Una volta su
  `*.github.io` l'origine è condivisa con gli altri siti dell'account.
  *Riportato, non eseguito.*
- La CSP in `<meta>` permette `ws:` e `wss:` verso qualunque host, e
  `public/_headers` è sintassi Netlify che Pages ignora. *Letto.*
- `SECURITY.md` promette il private vulnerability reporting, che è spento;
  alert Dependabot spenti. *Rieseguito via API.*
- Sette secret orfani dal 2025-04, tra cui il PAT `TOKEN`; nessun workflow li
  legge. *Rieseguito.*
- Formula dei dadi: tetto a 100d100 per termine ma numero di termini
  illimitato. *Riportato.*
- Testo delle condizioni parafrasato dalle Free Rules 2024 senza attribuzione
  SRD o CC-BY. *Letto.*
- 140 MB di cache npm tracciati sotto `.codex/` in un repo pubblico (396
  file). `.claude/CLAUDE.md` è un prompt generico di orchestrazione che
  contraddice il `CLAUDE.md` di radice e nomina agenti che non esistono qui.
  Codice morto: `ProfileManager`, `useProfileStore`, `WidgetConfig`,
  `tailwind.config.js` v3. *Letto in parte.*
- Il budget di 560 KiB per file JS non vincola nulla: il chunk più grande è
  218 KiB. *Rieseguito.*

## Roadmap e processo

- **Launch polish è la milestone sbagliata adesso.** LP4 ridisegna la griglia
  legacy e poi la sostituisce "con una spec propria": si paga due volte. LP7
  fa Design QA su una superficie da buttare. LP1 e LP2 (gestione Screen,
  header) non sono sprecati, ma vengono dopo.
- **Il gate di Design QA non ha più un riferimento.** La spec 01 ora descrive
  il v2; i mockup sorgente sono ancora quelli a pergamena. La campagna finta
  esiste perché l'app è stata costruita per combaciare con quei mockup.
- **Le righe `manual-pass` della matrice le ha passate un agente**, non una
  persona. `RESEARCH.md` dice che non ci sono state interviste né test con
  utenti.
- **Costo del processo** (*riportato, i due revisori usano finestre diverse*):
  dal 17 luglio 74 commit, 6 `feat`; righe cambiate: dipendenze 44%,
  documentazione 23%, codice di prodotto 22%, di cui due terzi CSS. Matrice,
  docket, ledger, handoff, roadmap da 690 righe e cinque spec per un prodotto
  con zero utenti.

## Cosa è a posto

Nessun sink HTML, nessun `eval`; `javascript:` bloccato da React e dalla CSP.
Nessuna richiesta di rete nel codice, font inclusi nel bundle. Nessun segreto
nella storia di nessun ramo. `src/domain/*` è davvero puro. TypeScript strict
pulito, un solo `any`. Selettori e2e per ruolo e label, zero `waitForTimeout`.
Il ciclo di combattimento in Run, la cattura con `/`, la persistenza tra Focus
e reload, export e import funzionano. `npm audit`: 0 in produzione, 7 moderate
solo di sviluppo.

## Mossa consigliata

Un solo modello di contenuto: il workspace dei Focus. Prepare diventa il suo
editor, la griglia legacy si cancella. Stima del revisore di architettura: due
o tre settimane, circa 3.500 righe e 130 KB di JS in meno. Primo passo da un
giorno: workspace vuoto di default e la campagna finta come template "Sample"
esplicito. Poi cinque DM veri su una build privata, prima di qualunque
rifinitura.
