# ArcanaScreen — Product Roadmap

Versione: 1.0  
Data: 11 luglio 2026  
Stato: proposta di sequenza per un team piccolo; gli ordini indicano dipendenze, non date contrattuali

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
| 0. Decision gates | Chiudere le scelte che cambiano IA e scope | Prossimo |
| 1. Web foundation | Rendere possibile creare, riprendere e configurare uno screen affidabile | Pianificato |
| 2. Session-ready core | Portare note, riferimenti e utility al livello necessario per il live | Pianificato |
| 3. MVP hardening & release | Rendere il prodotto verificabile, accessibile e distribuibile sul web | Pianificato |
| 4. Workspace evolution | Espandere layout, distribuzione e organizzazione dopo l'MVP | Post-MVP |
| 5. VTT integrations | Ridurre il doppio inserimento tramite adapter opzionali | Post-MVP |
| 6. Ecosystem bets | Valutare SDK, community, AI e modelli avanzati | Future |

# Orizzonte 0 — Decision gates

**Obiettivo:** risolvere con prototipi le decisioni che cambierebbero il modello dell'app prima di costruire la nuova shell.

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

## D0.3 — Capture, Note e Reference

**Outcome:** il prodotto supporta sia la cattura grezza live sia la consultazione a colpo d'occhio, senza diventare una knowledge base.

**Da confrontare**

- Un unico tool con modalità coerenti.
- Tool distinti ma interoperabili.
- Inbox globale più note/reference sullo screen.

**Feature collegate:** `CAP-01`–`CAP-04`, `NOT-01`–`NOT-03`, `REF-01`, `REF-02`.

**Gate:** una nota live viene catturata in pochi secondi e un riferimento preparato viene ritrovato senza ricerca globale.

## D0.4 — MVP tool set

**Outcome:** mantenere solo gli strumenti che dimostrano valore senza trasformare l'MVP in un catalogo.

**Decisioni**

- Confermare Dice Roller, Initiative Tracker e Timer nel core.
- Decidere se Simple Table e Counter entrano nell'MVP.
- Decidere se Exploration merita un template distinto da General.
- Decidere storico dadi, preset timer e segnale sonoro.
- Decidere se la checklist iniziale aggiunge valore dopo la scelta del template.
- Decidere se suoni globali e infrastruttura i18n sono enabler MVP o post-MVP.

**Candidate collegate:** `TPL-03`, `ONB-03`, `DIC-04`, `TIM-03`, `TIM-04`, `TAB-01`, `CNT-01`, `SET-04`, `SET-07`.

**Gate:** ogni tool incluso copre un job distinto e viene usato in almeno uno dei flussi prototipati.

## Exit criteria Orizzonte 0

- Architettura dell'informazione e modello Screen comprensibili.
- Wireflow completo di create/resume → Prepare → Run.
- Visual target selezionato per la shell web e i tool core.
- Packaging di capture/note/reference deciso.
- Elenco definitivo delle feature `MVP candidate` promosse o rinviate.

# Orizzonte 1 — Web foundation

**Obiettivo:** creare la nuova fondazione web sulla quale tutti i tool possono funzionare in modo coerente e affidabile.

## M1.1 — Screen lifecycle

**Outcome:** il DM riprende o crea uno screen senza configurazione superflua.

**Scope**

- Resume ultimo screen.
- Crea da template o blank.
- Rename, duplicate, delete con undo.
- Switcher degli screen recenti.

**Feature:** `SCR-01`–`SCR-07`.

**Dipende da:** D0.1.

**Done quando:** reload e riapertura riportano allo screen atteso; ogni azione distruttiva è recuperabile.

## M1.2 — Prepare / Run shell

**Outcome:** il DM personalizza quando vuole e conduce senza chrome di editing.

**Scope**

- Modalità Prepare e Run persistenti.
- Transizione senza perdita di stato.
- Add/remove/reorder accessibili.
- Dimensioni compatto/standard/ampio o set equivalente deciso nel gate.
- Undo delle modifiche strutturali.

**Feature:** `MOD-01`–`MOD-03`, `LAY-02`–`LAY-06`.

**Dipende da:** D0.2.

**Done quando:** le operazioni strutturali sono possibili con mouse, touch e tastiera; Run non espone azioni accidentali di layout.

## M1.3 — Responsive web layout

**Outcome:** lo stesso screen resta utilizzabile da browser su desktop, tablet e telefono.

**Scope**

- Griglia responsive e breakpoint deterministici.
- Reflow senza controlli tagliati.
- Contenuti reali a larghezze desktop, tablet e telefono.
- Nessun layout personale per dispositivo.

**Feature:** `LAY-01`, `LAY-05`, `DST-01`, `DST-02`.

**Dipende da:** D0.2.

**Done quando:** i flussi core sono completabili almeno a 1280×720, 768×1024 e 390×844 senza overflow globale o azioni irraggiungibili.

## M1.4 — Tool platform

**Outcome:** ogni tool segue lo stesso contratto di stato, configurazione e interazione.

**Scope**

- Libreria con ricerca e categorie, non permanentemente dominante.
- Add esplicito e istanze multiple.
- Chrome e configurazione coerenti.
- Registry tipizzato con default, schema e migrazioni per tool.

**Feature:** `LIB-01`–`LIB-07`.

**Dipende da:** M1.2.

**Done quando:** un nuovo tool interno può essere aggiunto senza modificare la shell in più punti e ogni istanza persiste in modo indipendente.

## M1.5 — Trust layer

**Outcome:** il DM può usare ArcanaScreen durante una sessione senza temere perdita o corruzione dei dati.

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

**Done quando:** dati corrotti non bloccano l'app, l'export/import funziona fra due browser e uno snapshot precedente può essere ripristinato.

## Exit criteria Orizzonte 1

- Uno screen può essere creato, ripreso, modificato e usato in Run.
- Tool multipli persistono correttamente e seguono lo stesso contratto.
- Tablet e telefono completano i flussi core tramite web responsive.
- Storage invalido, reload e import non producono perdita silenziosa.
- Nessuna integrazione VTT o layout avanzato è necessario per usare il core.

# Orizzonte 2 — Session-ready core

**Obiettivo:** completare gli strumenti che permettono al DM di consultare, catturare e agire durante una sessione reale.

## M2.1 — Template e first run

**Outcome:** il primo screen utile nasce da un risultato, non da un tour delle feature.

**Scope**

- Template General e Combat.
- Preview del contenuto del template.
- Blank per utenti esperti.
- First run basato sulla scelta e creazione dello screen.
- Help contestuale per i tool.

**Feature:** `SCR-02`, `SCR-03`, `TPL-01`, `TPL-02`, `TPL-04`, `ONB-01`, `ONB-02`.

**Dipende da:** D0.1, M1.1, M1.4.

**Done quando:** un nuovo utente raggiunge uno screen usabile senza tour obbligatorio.

## M2.2 — Capture, Note e Quick Reference

**Outcome:** il DM cattura ciò che accade e ritrova ciò che ha preparato con poca attenzione.

**Scope minimo**

- Inbox live con testo libero e timestamp.
- Nota con titolo e autosave visibile.
- Quick reference editabile.
- Link esterno con etichetta.
- Packaging deciso nel gate D0.3.

**Feature:** `CAP-01`, `CAP-02`, `NOT-01`, `NOT-02`, `REF-01`, `REF-02`.

**Candidate:** `CAP-03`, `CAP-04`, `NOT-03`.

**Dipende da:** D0.3, M1.4, M1.5.

**Done quando:** cattura e recupero soddisfano i tempi-obiettivo definiti nei test di usabilità.

## M2.3 — Dice Roller session-ready

**Outcome:** il DM esegue un tiro comune senza aprire un'altra applicazione e comprende sempre il risultato.

**Scope**

- Notazione standard, quantità e modificatori.
- Vantaggio/svantaggio.
- Errori inline e risultato leggibile.

**Feature:** `DIC-01`–`DIC-03`.

**Candidate:** `DIC-04`.

**Dipende da:** D0.4, M1.4, M1.5.

**Done quando:** formule valide e non valide hanno feedback univoco e lo stato sopravvive al reload.

## M2.4 — Initiative Tracker session-ready

**Outcome:** il DM conduce un incontro senza perdere turno, round o stato essenziale.

**Scope**

- Combattenti, iniziativa e ordinamento.
- Turno corrente e round.
- HP, temp HP e condizioni libere.
- Edit, reorder, tie-break.
- Next turn e reset sicuro.

**Feature:** `INI-01`–`INI-05`.

**Dipende da:** D0.4, M1.4, M1.5.

**Done quando:** un incontro simulato completo può essere condotto solo con controlli espliciti, con undo/recovery per le azioni distruttive.

## M2.5 — Timer session-ready

**Outcome:** il DM gestisce una scadenza senza perdere continuità quando il tab non è attivo.

**Scope**

- Imposta, avvia, pausa e reset.
- Calcolo basato su timestamp e recupero dopo reload/background.

**Feature:** `TIM-01`, `TIM-02`.

**Candidate:** `TIM-03`, `TIM-04`.

**Dipende da:** D0.4, M1.4, M1.5.

**Done quando:** il timer rimane coerente dopo cambio tab, sospensione breve e reload.

## M2.6 — Visual settings essenziali

**Outcome:** il prodotto resta leggibile e confortevole nei contesti principali.

**Scope**

- Tema light/dark e persistenza.
- Reduced motion.

**Feature:** `SET-01`–`SET-03`.

**Candidate:** `SET-04`, `SET-07`.

**Dipende da:** M1.2.

**Done quando:** tema e preferenze non alterano leggibilità, focus o stato dei tool.

## Exit criteria Orizzonte 2

- I tool core coprono consultazione, cattura, dadi, iniziativa e tempo.
- Ogni tool ha stati empty, active, error e recovery.
- Un utente può condurre una sessione simulata senza tornare in Prepare.
- Le candidate non promosse sono marcate post-MVP nel catalogo e non restano mezze implementate.

# Orizzonte 3 — MVP hardening & web release

**Obiettivo:** rendere il prodotto verificabile, accessibile e distribuibile come web app pubblica.

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

## W4.1 — Layout avanzato

- Focus su singolo tool e ritorno alla posizione.
- Sidecar dedicato.
- Second-monitor mode.
- Posizionamento libero e resize continuo.
- Layout salvati per dispositivo.
- Multi-window e pop-out.

**Feature:** `MOD-05`–`MOD-07`, `LAY-07`–`LAY-10`.

## W4.2 — Organizzazione e template

- Archiviazione, cartelle e ricerca screen.
- Template personali e import/export template.
- Template community senza codice.
- Reference pack e quick reference avanzati.

**Feature:** `SCR-08`, `SCR-09`, `TPL-05`, `TPL-06`, `REF-03`–`REF-05`, `EXT-05`.

## W4.3 — Tool evolution

- Promozione inbox → note/reference.
- Ricerca note e formattazione più ricca.
- Dice preset, Timer notifications, tabelle avanzate e Counter evoluto.
- Tool composti e dati condivisi.

**Feature:** `CAP-05`, `NOT-04`, `DIC-05`, `TIM-05`, `TAB-02`–`TAB-04`, `CNT-02`, `LIB-09`.

## W4.4 — Distribuzione ed esperienza estesa

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

1. Progettare e prototipare i gate D0.1–D0.4.
2. Promuovere o rinviare le feature `MVP candidate` nel Feature Catalog.
3. Selezionare il visual target e i wireflow della nuova shell.
4. Costruire Web foundation e Trust layer prima di ampliare i tool.
5. Portare i tool scelti allo standard session-ready.
6. Chiudere accessibilità, test e release web prima di aprire il post-MVP.

Il prossimo workflow Product Design è quindi: `$get-context` sui flussi D0 → `$ideate` sulle alternative → selezione → `$image-to-code` del prototipo → `$audit` e aggiornamento dei gate.
