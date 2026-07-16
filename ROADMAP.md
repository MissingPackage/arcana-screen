# ArcanaScreen — Product Roadmap

Versione: 1.6-m4-workspace-evolution
Data: 13 luglio 2026
Stato (verificato 2026-07-14): Orizzonti 1–4 implementati.

**Stato reale misurato (2026-07-14, non aspirazionale):**

- Unit/component: **136/136 verdi** (`npm run test:ci` = build + lint + Vitest + budget; conteggio aggiornato 2026-07-16).
- E2e Playwright (`test:e2e:critical`): **33 passati + 3 skip intenzionali** sull'intera matrice, **WebKit incluso** (aggiornato 2026-07-16). Il bug cross-browser Safari è stato individuato e corretto: era `upgrade-insecure-requests` nel meta CSP — WebKit (a differenza di Chromium/Firefox) forza l'upgrade anche su localhost, quindi ogni asset falliva il TLS handshake e l'app restava bianca su qualsiasi host HTTP. La direttiva ora vive solo in `public/_headers` (deploy HTTPS). Evidenza: `docs/verification/2026-07-16-webkit-gate.md`. Resta aperta la conferma del lane WebKit nella CI GitHub.
- **Accessibilità:** il gate axe era in realtà **RED** (93 violazioni di contrasto sul testo muted, regressione introdotta dal re-skin Prepare). **Corretto il 2026-07-14** (`--ink-muted`/`--as-muted` → `#586678`, ora AA ≥ 4.5:1); ora verde su Chromium/Firefox/mobile.
- **Budget performance:** la fonte di verità è `scripts/check-performance-budget.mjs`: **560 KiB per chunk JS / 130 KiB CSS** (CSS alzato a 130 nel commit `2b21d92` con lo split dei vendor chunk; la nota precedente diceva 110 ed era stantia). Attuale 2026-07-16: CSS 119.0; il chunk JS più grande è react — 191.8 con react 19.1.0, 198.8 col bump 19.2.7 (PR #86) — ampio margine sul limite.

L'accettazione prodotto resta separata dall'implementazione: nessun orizzonte è accettato finché `docs/specs/acceptance-matrix.md` contiene righe `missing`, `red`, `partial` o `blocked` — e molte righe restano `manual-pass` (evidenza datata, non suite automatica). In Orizzonte 4 cloud sync resta intenzionalmente disattivato e il wrapper mobile è una decisione documentata, non un binario fittizio.

Fonti:

- [Product Brief](PRODUCT_BRIEF.md)
- [UX Research](RESEARCH.md)
- [Capability & Feature Catalog](FEATURE_CATALOG.md)
- [Audit dell'esperienza attuale](.codex/product-design/arcana-audit/audit.md)

## Promessa di prodotto

ArcanaScreen è lo **schermo virtuale personale del Dungeon Master**: una web app configurabile che mantiene strumenti e informazioni operative visibili e azionabili durante una sessione, senza sostituire il VTT o una knowledge base completa.

Il primo MVP deve dimostrare che un DM può preparare, riprendere e usare uno screen per una sessione di 3–4 ore con bassa frizione e piena fiducia nei propri dati.

## Regole della roadmap

1. Gli epic sono ordinati per outcome e dipendenze, non per componente tecnico.
2. Gli ID rimandano al [Feature Catalog](FEATURE_CATALOG.md); il catalogo resta la fonte dei dettagli.
3. Le feature `MVP candidate` entrano nel commitment solo dopo il gate di prototipazione.
4. Layout spaziali avanzati, PWA/WebView e integrazioni VTT non fanno parte del primo MVP.
5. Nuove feature non entrano nell'MVP se non migliorano uno dei tre outcome: **ritrovare**, **agire**, **fidarsi**.
6. Affidabilità, accessibilità e recovery sono requisiti di uscita, non polish rimandabile.

## Outcome MVP

### Ritrovare

Il DM apre ArcanaScreen e recupera rapidamente lo screen, il tool o il riferimento necessario senza ricostruire il proprio setup.

### Agire

Il DM usa e aggiorna strumenti live senza entrare accidentalmente in configurazione e senza dipendere dal drag-and-drop.

### Fidarsi

Il DM sa che lo stato è salvato, può recuperarlo dopo un problema e può portarlo in un altro browser tramite export/import.

## Sequenza complessiva

| Orizzonte | Outcome | Stato |
|---|---|---|
| 0. Decision gates | Chiudere le scelte che cambiano IA e scope | Prototipato; validazione DM mancante |
| 1. Web foundation | Rendere possibile creare, riprendere e configurare uno screen affidabile | Implementato; ri-verifica in corso |
| 2. Session-ready core | Portare note, riferimenti e utility al livello necessario per il live | Implementato; ri-verifica in corso |
| 3. MVP hardening & release | Rendere il prodotto verificabile, accessibile e distribuibile sul web | Implementato; prima RC e gate WebKit in CI da eseguire |
| 4. Workspace evolution | Espandere layout, distribuzione e organizzazione dopo l'MVP | Implementato; validazione d'uso post-MVP aperta |
| 5. VTT integrations | Ridurre il doppio inserimento tramite adapter opzionali | Post-MVP |
| 6. Ecosystem bets | Valutare SDK, community, AI e modelli avanzati | Future |

# Orizzonte 0 — Decision gates

**Obiettivo:** risolvere con prototipi le decisioni che cambierebbero il modello dell'app prima di costruire la nuova shell.

**Stato:** prototipi e decisioni recuperati il 13 luglio 2026. Le quattro sorgenti visuali (Narrative, Social, Exploration e Combat) sono ora vincoli di implementazione, non materiale opzionale. L'approvazione finale resta sospesa fino a test moderati con DM reali.

## Decisioni approvate

- Il General Screen è **note-first**: Session Notebook, Quick Capture e Quick Reference costituiscono il core persistente.
- Prepare e Run restano modalità operative; Narrative, Social, Exploration e Combat sono **Focus della sessione**, non screen o modalità separati.
- Il cambio di Focus modifica gerarchia e tool contestuali senza interrompere notebook, catture, riferimenti o stato precedente.
- Dice Roller e Timer restano utility universali compatte; Initiative Tracker compare nel Focus Combat.
- Nuove entità specializzate per Social, Exploration o Narrative non entrano nell'MVP finché note e riferimenti strutturati non dimostrano un limite reale.
- La validazione con DM reali prosegue come checkpoint iniziale di Orizzonte 1 e può correggere nomenclatura e dettagli d'interazione senza riaprire automaticamente il modello.

## Risoluzione delle feature candidate

- **Promosse in MVP:** `MOD-04`, `CAP-03`, `CAP-04`, `NOT-03`.
- **Rinviate post-MVP:** `TPL-03`, `ONB-03`, `DIC-04`, `TIM-03`, `TIM-04`, `TAB-01`, `CNT-01`, `SET-04`, `SET-07`.

## D0.1 — Flusso Screen

**Outcome:** il DM capisce come creare, riprendere, rinominare, duplicare e cambiare screen senza incontrare un “Profile Manager” tecnico.

**Da progettare**

- Entry state con resume dell'ultimo screen.
- Creazione da General, Combat o Blank.
- Switcher degli screen recenti.
- Rename, duplicate e delete con undo.

**Feature collegate:** `SCR-01`–`SCR-07`, `TPL-01`, `TPL-02`, `TPL-04`.

**Gate:** un prototipo rende chiaro il modello Screen senza spiegazione verbale e consente di riprendere uno screen già usato in pochi secondi.

## D0.2 — Prepare e Run

**Outcome:** la configurazione è potente ma non interferisce con la conduzione live.

**Da progettare**

- Affordance e chrome presenti solo in Prepare.
- Stato stabile e protetto in Run.
- Passaggio fra modalità senza perdere scroll, focus o contenuto.
- Differenza fra Run e un semplice layout lock.

**Feature collegate:** `MOD-01`–`MOD-04`, `LAY-02`–`LAY-06`.

**Gate:** i tester distinguono le due modalità e non compiono modifiche strutturali accidentali durante Run.

## D0.3 — Session notebook, capture e curation

**Outcome:** appunti, catture e riferimenti formano la continuità operativa dello screen durante tutta la sessione, senza obbligare il DM a migrare l'intera campagna in una nuova knowledge base.

**Da progettare**

- Session notebook come superficie persistente e primaria, non come widget secondario.
- Inbox live a un gesto per nomi, decisioni, conseguenze e improvvisazioni.
- Note preparate e riferimenti appuntati con provenienza chiara.
- Distinzione fra contenuto sorgente, contenuto curato per la sessione e cattura grezza.
- Continuità di note, scroll, selezione e posizione quando cambia il Focus della sessione.
- Review post-sessione per conservare, eliminare o promuovere le catture.

**Feature collegate:** `CAP-01`–`CAP-04`, `NOT-01`–`NOT-03`, `REF-01`, `REF-02`.

**Gate:** il DM cattura una nota live in pochi secondi, ritrova un appunto o riferimento preparato senza ricerca globale e conserva lo stesso contesto passando fra almeno due Focus.

## D0.4 — Core universale e tool di Focus

**Outcome:** distinguere ciò che serve per tutta la sessione dagli strumenti utili solo in un momento specifico, senza trasformare l'MVP in un catalogo permanente.

**Decisioni**

- Confermare Session Notebook, Quick Capture e Quick Reference come core universale.
- Decidere se Dice Roller e Timer restano utility universali compatte o appartengono a specifici Focus.
- Trattare Initiative Tracker come tool del Focus Combat, non come centro del prodotto.
- Definire il set minimo per Narrative, Social ed Exploration usando note e riferimenti strutturati prima di introdurre nuove entità di dominio.
- Decidere se Simple Table e Counter coprono job distinti in uno o più Focus.
- Decidere storico dadi, preset timer e segnale sonoro solo nei flussi che li richiedono.
- Decidere se la checklist iniziale aggiunge valore dopo la scelta del template.
- Decidere se suoni globali e infrastruttura i18n sono enabler MVP o post-MVP.

**Feature collegate:** `LIB-01`–`LIB-07`, `CAP-01`–`CAP-04`, `NOT-01`–`NOT-03`, `REF-01`, `REF-02`, `DIC-01`–`DIC-04`, `INI-01`–`INI-05`, `TIM-01`–`TIM-04`.

**Candidate collegate:** `ONB-03`, `DIC-04`, `TIM-03`, `TIM-04`, `TAB-01`, `CNT-01`, `SET-04`, `SET-07`.

**Gate:** ogni capacità universale viene usata in almeno due Focus; ogni tool contestuale copre un job distinto nel proprio Focus e non occupa spazio quando è irrilevante.

## D0.5 — Focus della sessione

**Outcome:** lo stesso Screen segue il momento della sessione — Narrative, Social, xploration o Combat — senza frammentare appunti, catture e riferimenti in screen separati.

**Da progettare**

- Distinzione comprensibile fra modalità Prepare/Run, Focus della sessione e template di partenza.
- General Screen note-first come base utile anche senza scegliere un Focus specializzato.
- Passaggio rapido fra Narrative, Social, Exploration e Combat durante Run.
- Gerarchia e tool che cambiano con il Focus mentre Session Notebook, Capture e riferimenti restano continui.
- Stato dei tool contestuali preservato quando un Focus viene lasciato e poi ripreso.
- Default e nomenclatura che non trasformano Focus in un campaign manager, una scena VTT o quattro layout da configurare separatamente.

**Feature collegate:** `MOD-02`, `MOD-03`, `LAY-01`–`LAY-06`, `LIB-04`–`LIB-06`, `TPL-01`–`TPL-04`, `CAP-01`–`CAP-04`, `NOT-01`–`NOT-03`, `REF-01`, `REF-02`.

**Gate:** in un unico wireflow il DM passa Social → Exploration → Combat e ritorna al contesto precedente senza perdere appunti, catture, posizione o stato; i tester distinguono Focus, Screen e modalità senza spiegazione verbale.

## Exit criteria Orizzonte 0

- [x] Architettura dell'informazione e modello Screen documentati in specifiche funzionali.
- [x] Wireflow create/resume → Prepare → Run e transizioni di Focus recuperato dai prototipi.
- [x] Quattro direzioni visuali recuperate come sorgenti verificabili.
- [x] Packaging di Session Notebook, capture, curation e review specificato.
- [x] Modello Focus distinto da Screen, modalità e template coperto da test automatici.
- [ ] Test moderati confermano comprensione e task success con DM reali.
- [ ] Promozione finale delle candidate confermata dai risultati dei test, non solo dal documento.

# Orizzonte 1 — Web foundation

**Obiettivo:** creare la nuova fondazione web sulla quale tutti i tool possono funzionare in modo coerente e affidabile.

## M1.1 — Screen lifecycle

**Outcome:** il DM riprende o crea uno screen senza configurazione superflua.

**Stato:** implementato; test store verdi, verifica completa UI/browser ancora aperta.

**Scope**

- Resume ultimo screen.
- Crea da template o blank.
- Rename, duplicate, delete con undo.
- Switcher degli screen recenti.

**Feature:** `SCR-01`–`SCR-07`.

**Dipende da:** D0.1.

**Done quando:** reload e riapertura riportano allo screen atteso; ogni azione distruttiva è recuperabile. Verificato con create da General, Combat e Blank, switch con stato preservato, rename, duplicate, delete con undo e resume dopo reload.

## M1.2 — Prepare / Run shell

**Outcome:** il DM personalizza quando vuole e conduce senza chrome di editing.

**Stato:** implementato; distinzione Run/Prepare verificata parzialmente, test input e transizione completi ancora aperti.

**Scope**

- Modalità Prepare e Run persistenti.
- Transizione senza perdita di stato.
- Add/remove/reorder accessibili.
- Dimensioni compatto/standard/ampio o set equivalente deciso nel gate.
- Undo delle modifiche strutturali.

**Feature:** `MOD-01`–`MOD-03`, `LAY-02`–`LAY-06`.

**Dipende da:** D0.2.

**Done quando:** le operazioni strutturali sono possibili con mouse, touch e tastiera; Run non espone azioni accidentali di layout. Verificato con add esplicito, reorder alternativo al drag, dimensioni strutturate, remove e undo; Run conserva note e stato live, nasconde tutto il chrome strutturale e persiste dopo reload.

## M1.3 — Responsive web layout

**Outcome:** lo stesso screen resta utilizzabile da browser su desktop, tablet e telefono.

**Stato:** ri-verificato il 13 luglio su Run a 1280/768/390 senza overflow globale; flussi completi a ogni viewport ancora aperti.

**Scope**

- Griglia responsive e breakpoint deterministici.
- Reflow senza controlli tagliati.
- Contenuti reali a larghezze desktop, tablet e telefono.
- Nessun layout personale per dispositivo.

**Feature:** `LAY-01`, `LAY-05`, `DST-01`, `DST-02`.

**Dipende da:** D0.2.

**Done quando:** i flussi core sono completabili almeno a 1280×720, 768×1024 e 390×844 senza overflow globale o azioni irraggiungibili. Verificato nel browser reale: 1280×720 usa due colonne, 768×1024 e 390×844 effettuano reflow a una colonna, tutte e tre le viewport mantengono `scrollWidth` uguale alla larghezza disponibile e le azioni Prepare, Run e Data & recovery restano raggiungibili. Il modal di recovery resta contenuto a 390×844.

## M1.4 — Tool platform

**Outcome:** ogni tool segue lo stesso contratto di stato, configurazione e interazione.

**Stato:** implementato; registry presente, test di contratto e migrazione non ancora esaustivi.

**Scope**

- Libreria con ricerca e categorie, non permanentemente dominante.
- Add esplicito e istanze multiple.
- Chrome e configurazione coerenti.
- Registry tipizzato con default, schema e migrazioni per tool.

**Feature:** `LIB-01`–`LIB-07`.

**Dipende da:** M1.2.

**Done quando:** un nuovo tool interno può essere aggiunto senza modificare la shell in più punti e ogni istanza persiste in modo indipendente. Verificato con registry centrale tipizzato, default e versione di stato per tool, catalogo ricercabile e filtrabile, chrome/configurazione condivisi e due istanze Quick Notes con contenuti indipendenti preservati dopo reload. In Run libreria e configurazione scompaiono mentre i tool restano attivi.

## M1.5 — Trust layer

**Outcome:** il DM può usare ArcanaScreen durante una sessione senza temere perdita o corruzione dei dati.

**Stato:** implementato; test unitari di payload invalido, snapshot e import verdi, verifica cross-browser ancora aperta.

**Scope**

- Autosave locale e stato visibile.
- Schema versionato e migrazioni.
- Gestione quota e payload invalido.
- Export completo e import con preview/validazione.
- Snapshot di recovery.
- Error boundary con retry, export dati grezzi e reset controllato.
- Nessuna dipendenza da rete durante una sessione già caricata.

**Feature:** `DAT-01`–`DAT-09`.

**Dipende da:** M1.1, M1.4.

**Done quando:** dati corrotti non bloccano l'app, l'export/import funziona fra due browser e uno snapshot precedente può essere ripristinato. Verificato con storage protetto e fallback per payload invalido, stato di autosave visibile, backup JSON completo, preview e rifiuto dei file invalidi, import merge con screen reale, recovery della nota “Recovery candidate” da uno snapshot precedente, error boundary con retry/export raw/reset e bundle senza dipendenze runtime esterne.

## Exit criteria Orizzonte 1

- [ ] Uno screen può essere creato, ripreso, modificato e usato in Run nell'intero smoke browser ripetibile.
- [ ] Tool multipli persistono correttamente e seguono lo stesso contratto in test automatici.
- [ ] Tablet e telefono completano tutti i flussi core, non solo il reflow.
- [ ] Storage invalido, reload e import non producono perdita silenziosa anche nella prova cross-browser.
- [x] Nessuna integrazione VTT o layout avanzato è necessaria per usare il core.

# Orizzonte 2 — Session-ready core

**Obiettivo:** completare gli strumenti che permettono al DM di consultare, catturare e agire durante una sessione reale.

## M2.1 — Template e first run

**Outcome:** il primo screen utile nasce da un risultato, non da un tour delle feature.

**Stato:** implementato e coperto da test component; browser manual-pass completato su origine pulita per preview General/Combat/Blank, nome opzionale e creazione diretta.

**Scope**

- Template General e Combat.
- Preview del contenuto del template.
- Blank per utenti esperti.
- First run basato sulla scelta e creazione dello screen.
- Help contestuale per i tool.

**Feature:** `SCR-02`, `SCR-03`, `TPL-01`, `TPL-02`, `TPL-04`, `ONB-01`, `ONB-02`.

**Dipende da:** D0.1, M1.1, M1.4.

**Done quando:** un nuovo utente raggiunge uno screen usabile senza tour obbligatorio. Verificato da storage pulito con scelta General/Combat/Blank, preview di outcome e tool, nome opzionale e creazione diretta del General Screen; ogni tool espone help contestuale richiamabile.

## M2.2 — Capture, Note e Quick Reference

**Outcome:** il DM cattura ciò che accade e ritrova ciò che ha preparato con poca attenzione.

**Stato:** recuperato nella nuova shell Run; capture, continuità Focus, inbox edit/keep/delete/promote e riferimenti esterni coperti da test e browser manual-pass.

**Scope minimo**

- Inbox live con testo libero e timestamp.
- Nota con titolo e autosave visibile.
- Quick reference editabile.
- Link esterno con etichetta.
- Packaging deciso nel gate D0.3.

**Feature:** `CAP-01`, `CAP-02`, `NOT-01`, `NOT-02`, `REF-01`, `REF-02`.

**Candidate:** `CAP-03`, `CAP-04`, `NOT-03`.

**Dipende da:** D0.3, M1.4, M1.5.

**Done quando:** cattura e recupero soddisfano i tempi-obiettivo definiti nei test di usabilità. Implementati Session Notebook con titolo, autosave e formattazione leggera, Quick Capture con shortcut globale, timestamp e review edit/keep/delete/promote, e Quick Reference editabile con link etichettati. Verificati nel browser cattura a un gesto, promozione nel notebook, persistenza dopo reload e ripristino del link esterno.

## M2.3 — Dice Roller session-ready

**Outcome:** il DM esegue un tiro comune senza aprire un'altra applicazione e comprende sempre il risultato.

**Stato:** parser, errori, formula e vantaggio/svantaggio integrati nel dock Run e coperti da test component; browser manual-pass completato per formula valida/invalida, Advantage e Disadvantage con breakdown raw.

**Scope**

- Notazione standard, quantità e modificatori.
- Vantaggio/svantaggio.
- Errori inline e risultato leggibile.

**Feature:** `DIC-01`–`DIC-03`.

**Candidate:** `DIC-04`.

**Dipende da:** D0.4, M1.4, M1.5.

**Done quando:** formule valide e non valide hanno feedback univoco e lo stato sopravvive al reload. Verificati errore inline per formula invalida e tiro `d20+4` con vantaggio, risultato, breakdown e raw roll preservati al reload; lo storico `DIC-04` resta escluso come post-MVP.

## M2.4 — Initiative Tracker session-ready

**Outcome:** il DM conduce un incontro senza perdere turno, round o stato essenziale.

**Stato:** modello turno/round/HP/temp HP/condizioni testato e Run conforme al bozzetto; browser manual-pass completato per un round intero, reset con conferma e ripristino Undo. Il setup Prepare resta coperto da component/unit e richiede il gate con DM reale.

**Scope**

- Combattenti, iniziativa e ordinamento.
- Turno corrente e round.
- HP, temp HP e condizioni libere.
- Edit, reorder, tie-break.
- Next turn e reset sicuro.

**Feature:** `INI-01`–`INI-05`.

**Dipende da:** D0.4, M1.4, M1.5.

**Done quando:** un incontro simulato completo può essere condotto solo con controlli espliciti, con undo/recovery per le azioni distruttive. Verificati ordinamento per iniziativa e tie-break, reorder manuale, edit, HP/temp HP/condizioni, passaggio turno con incremento round, reset con conferma e undo completo dello stato dell'incontro.

## M2.5 — Timer session-ready

**Outcome:** il DM gestisce una scadenza senza perdere continuità quando il tab non è attivo.

**Stato:** aritmetica timestamp testata, continuità su reload e configurazione durata verificate nel browser. La prova di sospensione lunga/background è chiusa il 2026-07-16: test `@critical` con clock fittizio (Playwright `clock.fastForward`, scenario "coperchio chiuso") che verifica ticking live, salto di 12 minuti senza tick, reload a timer attivo e completamento a 00:00 oltre la scadenza — verde su Chromium desktop/mobile, Firefox e WebKit (`docs/verification/2026-07-16-timer-suspension.md`).

**Scope**

- Imposta, avvia, pausa e reset.
- Calcolo basato su timestamp e recupero dopo reload/background.

**Feature:** `TIM-01`, `TIM-02`.

**Candidate:** `TIM-03`, `TIM-04`.

**Dipende da:** D0.4, M1.4, M1.5.

**Done quando:** il timer rimane coerente dopo cambio tab, sospensione breve e reload. Il countdown persiste un timestamp finale e ricalcola il residuo invece di affidarsi ai tick del tab; verificati start, avanzamento, reload durante l'esecuzione e completamento coerente. Preset e suoni restano post-MVP.

## M2.6 — Visual settings essenziali

**Outcome:** il prodotto resta leggibile e confortevole nei contesti principali.

**Stato:** persistenza coperta da test e computed-style verificati nel browser sulle nuove superfici; audit leggibilità/contrasto completo ancora aperto.

**Scope**

- Tema light/dark e persistenza.
- Reduced motion.

**Feature:** `SET-01`–`SET-03`.

**Candidate:** `SET-04`, `SET-07`.

**Dipende da:** M1.2.

**Done quando:** tema e preferenze non alterano leggibilità, focus o stato dei tool. Verificati tema dark persistente su superfici reali, controllo reduced motion persistente e override effettivo delle durate, mantenendo tool e Run utilizzabili.

## Exit criteria Orizzonte 2

- [ ] I tool core coprono consultazione, cattura, dadi, iniziativa e tempo nella nuova shell Run.
- [ ] Ogni tool ha stati empty, active, error e recovery coperti da test.
- [ ] Un DM completa una sessione simulata senza tornare in Prepare e senza perdita dati.
- [ ] Le candidate non promosse sono marcate post-MVP e non restano mezze implementate.

# Orizzonte 3 — MVP hardening & web release

**Obiettivo:** rendere il prodotto verificabile, accessibile e distribuibile come web app pubblica.

**Stato:** implementazione completata il 13 luglio 2026. I gate locali sono verdi su Chromium desktop/mobile e Firefox; WebKit è obbligatorio nella matrice CI, ma il fallback Ubuntu di Playwright non può avviarsi sul workstation Fedora senza librerie di sistema installabili solo con privilegi amministrativi. La prima pubblicazione resta un'azione di release esplicita, non eseguita da questo worktree.

## M3.1 — Accessibilità e input

**Outcome:** le funzioni principali sono disponibili indipendentemente dal dispositivo di input o dalla capacità visiva.

**Scope**

- Navigazione completa da tastiera e focus visibile.
- Target touch e alternative al drag.
- Zoom 200% e reflow.
- Contrasto, non-color cues e reduced motion.

**Feature:** `QUA-01`–`QUA-05`.

**Dipende da:** Orizzonti 1 e 2.

**Done quando:** i flussi core soddisfano WCAG 2.2 AA nelle verifiche applicabili e non perdono controlli a zoom 200%.

**Evidenza M3:** skip navigation, focus visibile, focus trap del dialogo recovery, alternative esplicite al drag, target touch da 44 px, reflow a 640 CSS px, reduced motion persistente e axe su first run, Prepare e Run. NOTA 2026-07-14: axe era in realtà RED (93 violazioni di contrasto sul muted, regressione del re-skin); corretto e ora verde su Chromium/Firefox/mobile. WebKit resta gate CI (non si avvia sull'host Fedora).

## M3.2 — Qualità automatizzata

**Outcome:** ogni release preserva dati e flussi critici.

**Scope**

- Test unitari per store, parser, timer e migrazioni.
- Component test per tool e stati principali.
- E2E per create/resume, Prepare/Run, CRUD tool, persistenza, import/export e recovery.
- CI per build, lint e test.

**Feature:** `QUA-06`–`QUA-08`.

**Dipende da:** Orizzonti 1 e 2.

**Done quando:** build, lint e test sono verdi su ogni pull request e i flussi critici hanno una smoke suite ripetibile.

**Evidenza M3 (aggiornata 2026-07-14):** `test:ci` copre build, lint JSX-accessibility, 86 test Vitest e budget; Playwright copre create/resume, Prepare/Run, cattura/reload, reorder, export/import, axe, reduced motion, privacy runtime e performance. Il workflow `Quality gate` esegue inoltre la matrice browser su ogni pull request.

## M3.3 — Browser, performance e privacy

**Outcome:** il prodotto è prevedibile sui browser supportati e rispetta il posizionamento local-first.

**Scope**

- Matrice Chrome, Firefox e Safari.
- Budget di avvio e interazione con carico realistico.
- Telemetria assente o opt-in.
- Privacy policy coerente con storage locale.
- CSP, security headers e dependency scanning.

**Feature:** `QUA-06`, `QUA-08`, `QUA-09`, `DST-01`, `DST-02`.

**Dipende da:** M1.5.

**Done quando:** i browser dichiarati superano la matrice di test e nessun dato utente viene trasmesso senza consenso esplicito.

**Evidenza M3:** Chromium desktop, Chromium mobile e Firefox verdi localmente (25 test, 2 skip intenzionali); WebKit/Safari engine è un gate CI con `playwright install --with-deps`. Bundle entro il budget (alzato il 2026-07-14 a 560 KiB JS / 110 KiB CSS per le icone per-entità; attuale 528.9/96.3 — snapshot storico del 2026-07-14, il CSS è stato poi alzato a 130 in `2b21d92`), nessuna vulnerabilità npm nota, nessuna richiesta cross-origin nel flusso core, privacy policy e CSP/headers versionati.

## M3.4 — Release web

**Outcome:** il team può distribuire, osservare e correggere il prodotto con rischio controllato.

**Scope**

- Preview, staging e production.
- Versioning, changelog e migration notes.
- Rollback e canale hotfix.
- Documentazione utente essenziale e percorso di feedback.

**Feature:** `DST-01`, `DST-02`; enabler di delivery non presenti come feature utente nel catalogo.

**Dipende da:** M3.1–M3.3.

**Done quando:** una release candidate può essere distribuita, verificata e ripristinata senza procedure manuali non documentate.

**Evidenza M3:** versione `1.0.0-rc.1`, changelog, artefatto immutabile con SHA-256, lane Preview/Staging/Production, GitHub Pages, release GitHub, runbook di rollback/hotfix, guida utente, security policy e feedback path. Tag, push e deploy non sono stati eseguiti automaticamente.

## Exit criteria MVP

### Prodotto

- Un nuovo utente crea uno screen utile da template senza tour obbligatorio.
- Un utente di ritorno riprende lo screen atteso in pochi secondi.
- Prepare e Run hanno comportamenti distinti e comprensibili.
- Una sessione simulata di 3–4 ore usa i tool core senza perdita o incoerenza dei dati.

### Dati e fiducia

- Autosave e stato di salvataggio sono visibili.
- Reload, storage invalido e migrazione hanno recovery controllato.
- Export/import è verificato fra due browser e due versioni di schema.
- Nessuna funzione core richiede account, cloud o VTT.

### Accessibilità e responsive

- Flussi core completabili con mouse, touch e tastiera.
- Nessun overflow globale o controllo irraggiungibile nei viewport dichiarati.
- Zoom 200%, focus, contrasto e reduced motion verificati.

### Qualità

- Build, lint e test verdi in CI.
- Zero bug P0 noti e nessuna regressione P1 aperta sui flussi critici.
- Performance entro i budget stabiliti con un carico realistico di tool.
- Due release candidate consecutive senza perdita dati o regressioni critiche.

# Orizzonte 4 — Workspace evolution (post-MVP)

**Obiettivo:** aumentare la flessibilità solo dopo aver validato il modello Screen e l'uso live.

**Stato:** implementazione completata il 13 luglio 2026 su autorizzazione esplicita. Build, lint, 86 test (aggiornato 2026-07-14), budget, audit dipendenze e gate E2E Chromium desktop/mobile e Firefox sono verdi; il gate WebKit locale resta non eseguibile per dipendenze di sistema già note. La validazione con DM reali resta un gate di accettazione prodotto distinto.

## W4.1 — Layout avanzato

**Stato:** implementato e verificato nel browser a desktop e `390×844`, senza overflow globale.

- Focus su singolo tool e ritorno alla posizione.
- Sidecar dedicato.
- Second-monitor mode.
- Posizionamento libero e resize continuo.
- Layout salvati per dispositivo.
- Multi-window e pop-out.

**Feature:** `MOD-05`–`MOD-07`, `LAY-07`–`LAY-10`.

## W4.2 — Organizzazione e template

**Stato:** implementato con archivio, cartelle/tag, ricerca, template personali portabili e reference pack riutilizzabili.

- Archiviazione, cartelle e ricerca screen.
- Template personali e import/export template.
- Template community senza codice.
- Reference pack e quick reference avanzati.

**Feature:** `SCR-08`, `SCR-09`, `TPL-05`, `TPL-06`, `REF-03`–`REF-05`, `EXT-05`.

## W4.3 — Tool evolution

**Stato:** implementato con ricerca workspace, formattazione note estesa, promozione condivisa, preset, notifiche, tabelle CSV/template e Resource Counter.

- Promozione inbox → note/reference.
- Ricerca note e formattazione più ricca.
- Dice preset, Timer notifications, tabelle avanzate e Counter evoluto.
- Tool composti e dati condivisi.

**Feature:** `CAP-05`, `NOT-04`, `DIC-05`, `TIM-05`, `TAB-02`–`TAB-04`, `CNT-02`, `LIB-09`.

## W4.4 — Distribuzione ed esperienza estesa

**Stato:** PWA, cache offline, quota storage, densità, temi e shell EN/IT implementati. Capacitor è valutato in `arcana-screen/docs/MOBILE_WRAPPER.md`; cloud sync resta off fino all'approvazione del threat/conflict model pubblicato nell'app.

- PWA installabile con cache offline completa.
- Wrapper WebView mobile/tablet.
- Densità UI e temi personalizzati.
- Infrastruttura i18n e localizzazione EN/IT.
- Indicatore e gestione avanzata della quota locale.
- Cloud sync opzionale, solo dopo threat model e conflict model.

**Feature:** `DST-03`, `DST-04`, `SET-05`–`SET-08`, `DAT-10`, `DAT-11`.

**Gate post-MVP:** ogni investimento deve essere giustificato da dati d'uso o test che dimostrino un problema non risolvibile dal responsive web MVP.

# Orizzonte 5 — VTT integrations (post-MVP)

**Obiettivo:** ridurre il doppio inserimento senza rendere ArcanaScreen dipendente da una piattaforma.

## I5.1 — Adapter contract

- Contratto piccolo e versionato.
- Permessi, provenienza e fonte autoritativa visibili.
- Stato connessione e fallback standalone.
- Test di compatibilità per piattaforma/versione.

**Feature:** `INT-01`.

## I5.2 — Integrazione progressiva

1. Deep link e import manuale.
2. Foundry bridge in sola lettura.
3. Eventi Foundry selezionati.
4. Valutazione Roll20 e Fantasy Grounds.
5. Azioni bidirezionali solo dopo validazione specifica.

**Feature:** `INT-02`–`INT-07`, `DIC-06`, `INI-06`.

**Gate integrazioni:** nessun adapter entra in sviluppo senza un job misurabile, un owner della compatibilità e un comportamento standalone equivalente.

# Orizzonte 6 — Ecosystem bets (future)

Queste opzioni non hanno una data e non devono influenzare l'architettura MVP oltre a evitare lock-in palesi.

- Manifest e SDK per tool di terze parti (`EXT-01`, `EXT-02`).
- Catalogo curato e possibile marketplace (`EXT-03`, `EXT-04`).
- Desktop wrapper (`DST-05`).
- Trascrizione, recap ed estrazione automatica (`AI-01`, `AI-02`).
- Collaborazione realtime (`DAT-12`).

## Non-obiettivi permanenti del core

- Player-facing views (`COL-01`).
- Mappe, token, fog of war o line of sight (`COL-02`).
- Video/audio hosting (`COL-03`).
- Sync universale tra VTT (`INT-08`).

# Metriche e segnali

## Discovery e usabilità

- Tempo per creare o riprendere uno screen utile.
- Tempo per trovare un riferimento preparato.
- Tempo per catturare una nota live.
- Numero di cambi finestra nei task osservati.
- Errori o esitazioni nel passaggio Prepare/Run.
- Errori, perdita di contesto o esitazioni nel cambio di Focus.

## Affidabilità

- Sessioni senza crash o recovery.
- Errori storage e recovery riusciti.
- Successo import/export e migrazioni.
- Regressioni per release.

## Qualità

- Pass rate E2E sui flussi critici.
- Task success con tastiera, touch e zoom 200%.
- Tempo di avvio e latenza delle interazioni con carico realistico.
- Difetti P0/P1 aperti per release.

## Prodotto

- Screen creati e ripresi durante test o beta.
- Utilizzo dei tool durante sessioni complete.
- Tool aggiunti e poi rimossi rapidamente, come segnale di scarso fit.
- Retention o telemetria solo con consenso esplicito.

# Sequenza immediata

1. Eseguire sessioni simulate con DM reali su Orizzonti 0–4 e registrare task success, ritrovamento, cattura e uso dei layout avanzati.
2. ~~Eseguire il gate WebKit nella CI Ubuntu predisposta e la prova Timer dopo sospensione lunga/background.~~ **Chiuso 2026-07-16:** gate WebKit verde in locale e nella CI GitHub (PR #83, fix CSP `upgrade-insecure-requests`); prova Timer post-sospensione automatizzata nella suite `@critical` su tutta la matrice browser.
3. Validare installazione e recovery offline della PWA su Android e iOS reali.
4. Chiudere le righe non verdi della matrice di accettazione senza confondere implementazione e approvazione prodotto.
5. Attivare un wrapper o un provider cloud solo se i dati d'uso superano i gate documentati di manutenzione, privacy e conflitto.
