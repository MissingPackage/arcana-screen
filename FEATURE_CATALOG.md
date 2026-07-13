# ArcanaScreen — Capability & Feature Catalog

Versione: 0.2
Data: 12 luglio 2026
Stato: capability map allineata alle decisioni di Orizzonte 0; la roadmap governa il delivery

Fonti: [Product Brief](PRODUCT_BRIEF.md) · [UX Research](RESEARCH.md) · [Audit dell'app attuale](.codex/product-design/arcana-audit/audit.md)

## Decisione di scope

Il primo MVP è una **web app desktop-first**, utilizzabile anche da browser su tablet e telefono tramite layout responsivo. Non prevede app native separate, profili di layout per dispositivo, sidecar specializzato, posizionamento libero o integrazioni VTT.

La personalizzazione MVP riguarda quali tool sono presenti, il loro ordine e poche dimensioni strutturate dentro una griglia. Lo screen mantiene un core note-first e passa fra Focus Narrative, Social, Exploration e Combat senza diventare un campaign manager. Le integrazioni VTT e le modalità spaziali avanzate iniziano dopo la validazione del core.

## Come leggere il catalogo

### Fase

- **MVP:** raccomandata per dimostrare la promessa del prodotto.
- **MVP candidate:** plausibile nel primo MVP, ma deve guadagnarsi il posto tramite prototipo o test.
- **Post-MVP:** utile e coerente, deliberatamente rinviata.
- **Future:** esplorazione di ecosistema o modello di business.
- **Out:** non-obiettivo del prodotto core.

### Evidenza

- **Forte:** problema ricorrente nella ricerca e coerente con la vision.
- **Decisione:** scelta strategica esplicita del prodotto.
- **Media:** segnale utile ma non sufficiente per una priorità definitiva.
- **Bassa:** idea plausibile o richiesta isolata.
- **Tecnica:** necessaria per fiducia, qualità o evoluzione del prodotto.

## Mappa sintetica

| Area | Outcome utente | Fase prevalente |
|---|---|---|
| Screen lifecycle | Riprendere rapidamente il proprio setup | MVP |
| Prepare / Run | Separare configurazione e conduzione live | MVP |
| Focus della sessione | Adattare lo stesso screen al momento corrente senza perdere contesto | MVP |
| Layout web responsivo | Usare lo screen senza progettare ogni viewport | MVP |
| Tool platform | Aggiungere e usare strumenti coerenti e affidabili | MVP |
| Quick capture e reference | Catturare e ritrovare ciò che serve ora | MVP |
| Utility del DM | Gestire azioni frequenti senza cambiare app | MVP / candidate |
| Dati e recovery | Fidarsi dello screen durante una sessione | MVP |
| Accessibilità e qualità | Operare con mouse, tastiera, touch e zoom | MVP |
| Layout spaziali avanzati | Ottimizzare sidecar, focus e più dispositivi | Post-MVP |
| Integrazioni VTT | Ridurre il doppio inserimento | Post-MVP |
| Plugin ed ecosistema | Estendere il prodotto in sicurezza | Future |

## 1. Screen lifecycle

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| SCR-01 | Resume ultimo screen | Riapertura sullo screen e sullo stato usati l'ultima volta | MVP | Forte |
| SCR-02 | Crea da template | Scelta di un punto di partenza utile senza canvas vuoto obbligatorio | MVP | Forte |
| SCR-03 | Screen vuoto | Possibilità di iniziare senza template per utenti esperti | MVP | Decisione |
| SCR-04 | Rinomina screen | Nome comprensibile al posto di un “profilo” tecnico | MVP | Audit |
| SCR-05 | Duplica screen | Riutilizzo di un setup senza ricostruirlo | MVP | Forte |
| SCR-06 | Elimina con undo | Rimozione recuperabile e mai ambigua durante Run | MVP | Tecnica |
| SCR-07 | Switcher screen | Passaggio fra setup recenti senza tornare a un manager dominante | MVP | Media |
| SCR-08 | Archiviazione e cartelle | Organizzazione di molti screen nel tempo | Post-MVP | Bassa |
| SCR-09 | Ricerca globale screen | Recupero in collezioni grandi | Post-MVP | Bassa |

## 2. Prepare e Run

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| MOD-01 | Modalità Prepare | Aggiunta, rimozione, riordino, dimensione e configurazione dei tool | MVP | Forte |
| MOD-02 | Modalità Run | Nasconde il chrome di editing e protegge da modifiche strutturali accidentali | MVP | Forte |
| MOD-03 | Transizione senza perdita di stato | Il passaggio Prepare/Run non resetta tool, scroll o selezioni | MVP | Decisione |
| MOD-04 | Layout lock esplicito | Stato bloccato comprensibile anche senza entrare in Run | MVP | Decisione H0 |
| MOD-05 | Focus su un singolo tool | Espansione temporanea con ritorno alla posizione precedente | Post-MVP | Media |
| MOD-06 | Sidecar dedicato | Vista stretta configurata separatamente | Post-MVP | Forte, rinviata |
| MOD-07 | Second-monitor mode | Densità e comportamenti ottimizzati per monitor dedicato | Post-MVP | Forte, rinviata |

## 2A. Focus della sessione

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| FOC-01 | Focus Narrative | Notebook e riferimenti restano centrali durante esposizione e storytelling | MVP | Decisione H0 |
| FOC-02 | Focus Social | NPC, intenzioni, riferimenti e catture emergono senza introdurre un social tracker obbligatorio | MVP | Decisione H0 |
| FOC-03 | Focus Exploration | Luoghi, indizi, rischi e tempo emergono attraverso note, riferimenti e utility | MVP | Decisione H0 |
| FOC-04 | Focus Combat | Initiative Tracker e tool di incontro diventano prioritari senza sostituire il core | MVP | Decisione H0 |
| FOC-05 | Cambio Focus in Run | Passaggio rapido senza entrare in Prepare o cambiare screen | MVP | Decisione H0 |
| FOC-06 | Stato preservato per Focus | Ritorno a un Focus con stato, selezione e posizione precedenti | MVP | Decisione H0 |

## 3. Layout web responsivo

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| LAY-01 | Griglia responsiva | Reflow prevedibile fra desktop, tablet e telefono | MVP | Decisione |
| LAY-02 | Aggiungi/rimuovi tool | Azione disponibile con click, touch e tastiera; drag non obbligatorio | MVP | Audit |
| LAY-03 | Riordino tool | Riordino con puntatore/touch e alternativa da tastiera | MVP | Decisione |
| LAY-04 | Dimensioni strutturate | Scelta limitata, ad esempio compatto/standard/ampio, senza resize libero | MVP | Decisione |
| LAY-05 | Breakpoint deterministici | Nessun controllo essenziale tagliato o irraggiungibile | MVP | Forte |
| LAY-06 | Undo modifiche strutturali | Recupero di add/remove/reorder/size | MVP | Tecnica |
| LAY-07 | Posizionamento libero | Coordinate, collision handling e layering | Post-MVP | Rinviata |
| LAY-08 | Resize continuo | Dimensionamento arbitrario del tool | Post-MVP | Rinviata |
| LAY-09 | Layout per dispositivo | Varianti salvate per desktop, tablet e telefono | Post-MVP | Rinviata |
| LAY-10 | Multi-window / pop-out | Tool in finestre browser distinte | Post-MVP | Media |

## 4. Libreria e piattaforma dei tool

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| LIB-01 | Libreria tool | Elenco leggibile delle capacità disponibili | MVP | Decisione |
| LIB-02 | Ricerca e categorie | Recupero rapido senza mostrare permanentemente il catalogo | MVP | Audit |
| LIB-03 | Add esplicito | Pulsante/azione chiara per aggiungere un tool allo screen | MVP | Audit |
| LIB-04 | Istanze multiple | Più note, timer, tabelle o tracker sullo stesso screen | MVP | Vision |
| LIB-05 | Chrome coerente | Titolo, help, configure, remove e stato seguono lo stesso modello | MVP | Audit |
| LIB-06 | Configurazione per tool | Impostazioni separate dall'uso live e accessibili in Prepare | MVP | Forte |
| LIB-07 | Stato tipizzato e versionato | Ogni tool dichiara schema, default e migrazioni | MVP | Tecnica |
| LIB-08 | Favoriti | Accesso rapido a cataloghi più grandi | Post-MVP | Bassa |
| LIB-09 | Tool composti | Tool che condividono dati o azioni | Post-MVP | Bassa |
| LIB-10 | Tool SDK | Contratto per tool di terze parti | Future | Bassa |

## 5. Template e onboarding

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| TPL-01 | Template General | Setup equilibrato per una sessione generica | MVP | Forte |
| TPL-02 | Template Combat | Tool e dimensioni iniziali orientati al combattimento | MVP | Forte |
| TPL-03 | Template Exploration | Note, riferimenti, timer e tabelle orientati all'esplorazione | Post-MVP | Decisione H0: prima validare Exploration come Focus |
| TPL-04 | Preview template | Chiarezza su cosa verrà creato prima della conferma | MVP | UX |
| TPL-05 | Salva come template personale | Riutilizzo indipendente dai singoli screen | Post-MVP | Media |
| TPL-06 | Import/export template | Condivisione sicura senza codice eseguibile | Post-MVP | Media |
| ONB-01 | First run basato sul risultato | Creare uno screen utile invece di seguire un tour delle feature | MVP | Audit |
| ONB-02 | Help contestuale | Spiegazione richiamabile per singolo tool o azione | MVP | Audit |
| ONB-03 | Checklist non bloccante | Suggerimenti iniziali senza overlay obbligatorio | Post-MVP | Decisione H0 |

## 6. Quick capture, note e riferimenti

Il packaging approvato usa tre superfici coerenti e persistenti: Session Notebook, Quick Capture e Quick Reference. Possono condividere infrastruttura e contenuti senza diventare un unico controllo indistinto.

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| CAP-01 | Inbox live | Cattura testo libero a un gesto, senza campi obbligatori | MVP | Forte |
| CAP-02 | Timestamp automatico | Contesto temporale senza lavoro aggiuntivo | MVP | Forte |
| CAP-03 | Shortcut globale nell'app | Cattura senza cercare il tool nello screen | MVP | Decisione H0 |
| CAP-04 | Review post-sessione | Modifica, elimina, conserva o promuove le catture | MVP | Decisione H0 |
| CAP-05 | Promozione a nota/riferimento | Trasforma una cattura senza ricopiarla | Post-MVP | Media |
| CAP-06 | Categorie/entità automatiche | NPC, quest o luogo estratti dalla cattura | Future | Bassa |
| NOT-01 | Nota con titolo | Più note distinguibili sullo stesso screen | MVP | Vision |
| NOT-02 | Autosave e indicatore | Stato di salvataggio comprensibile | MVP | Forte |
| NOT-03 | Formattazione leggera | Liste, enfasi e link senza editor complesso | MVP | Decisione H0 |
| NOT-04 | Ricerca nelle note | Recupero trasversale su molti contenuti | Post-MVP | Media |
| REF-01 | Quick reference editabile | Blocco sintetico pensato per la consultazione a colpo d'occhio | MVP | Forte |
| REF-02 | Link con etichetta | Collegamento a fonte esterna senza migrazione obbligatoria | MVP | Forte |
| REF-03 | Pin e recenti | Recupero di riferimenti usati nella sessione | Post-MVP | Media |
| REF-04 | Deep link a PDF/VTT | Apertura a pagina o oggetto specifico quando supportato | Post-MVP | Media |
| REF-05 | Reference pack | Raccolte modificabili con attenzione a licenze e sistemi | Post-MVP | Media |

## 7. Utility del DM

Le utility esistenti sono asset utili, ma la ricerca pubblica non dimostra che abbiano tutte la stessa priorità. I test dei flussi dovranno verificare il set minimo.

### Dice Roller

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| DIC-01 | Notazione standard, quantità e modificatori | MVP | Vision / esistente |
| DIC-02 | Vantaggio e svantaggio | MVP | Vision / esistente |
| DIC-03 | Errori inline e risultato leggibile | MVP | Audit |
| DIC-04 | Storico breve della sessione | Post-MVP | Decisione H0 |
| DIC-05 | Preset e roll salvati | Post-MVP | Bassa |
| DIC-06 | Roll ricevuti o inviati al VTT | Post-MVP | Integrazione |

### Initiative Tracker

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| INI-01 | Combattenti e ordinamento iniziativa | MVP | Vision / esistente |
| INI-02 | Turno corrente e round | MVP | Audit |
| INI-03 | HP, temp HP e condizioni libere | MVP | Vision |
| INI-04 | Edit, reorder e tie-break | MVP | Audit |
| INI-05 | Next turn e reset incontro sicuro | MVP | Vision |
| INI-06 | Import/sync dal VTT | Post-MVP | Integrazione |

### Timer

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| TIM-01 | Imposta, avvia, pausa e reset | MVP | Vision / esistente |
| TIM-02 | Continuità affidabile in background | MVP | Tecnica |
| TIM-03 | Preset rapidi | Post-MVP | Decisione H0 |
| TIM-04 | Segnale visivo e sonoro opzionale | Post-MVP | Decisione H0 |
| TIM-05 | Notifiche di sistema | Post-MVP | Bassa |

### Simple Table

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| TAB-01 | Titolo, righe, colonne e celle editabili | Post-MVP | Decisione H0 |
| TAB-02 | Template di tabella | Post-MVP | Media |
| TAB-03 | Tipi colonna, sort e filtri | Post-MVP | Bassa |
| TAB-04 | Import/export CSV | Post-MVP | Bassa |

### Counter

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| CNT-01 | Contatore nominato con incremento/decremento | Post-MVP | Decisione H0 |
| CNT-02 | Soglie, range e reset | Post-MVP | Bassa |

## 8. Dati, affidabilità e recovery

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| DAT-01 | Autosave locale | Ogni modifica persistita senza azione manuale | MVP | Forte |
| DAT-02 | Stato “salvato” visibile | L'utente sa se può chiudere o ricaricare | MVP | Forte |
| DAT-03 | Schema versionato | Dati e tool migrabili fra release | MVP | Tecnica |
| DAT-04 | Storage sicuro | Quota, payload invalido e corruzione non bloccano l'app | MVP | Tecnica |
| DAT-05 | Export completo | File leggibile e scaricabile con tutti gli screen | MVP | Forte |
| DAT-06 | Import validato | Preview, errori comprensibili e scelta merge/replace | MVP | Forte |
| DAT-07 | Snapshot di recovery | Ripristino a uno stato precedente noto | MVP | Forte |
| DAT-08 | Error boundary e recovery UI | Riprova, esporta dati grezzi o reset controllato | MVP | Tecnica |
| DAT-09 | Continuità senza rete durante la sessione aperta | Nessuna funzione core dipende da richieste remote dopo il caricamento | MVP | Decisione |
| DAT-10 | Indicatore uso storage | Comprensione della quota locale | Post-MVP | Media |
| DAT-11 | Cloud sync e account | Continuità multi-device | Post-MVP | Bassa |
| DAT-12 | Collaborazione realtime | Più utenti sullo stesso screen | Future | Bassa |

## 9. Impostazioni e personalizzazione visiva

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| SET-01 | Tema light/dark | MVP | Esistente |
| SET-02 | Preferenza tema persistente | MVP | Esistente |
| SET-03 | Reduced motion | MVP | Accessibilità |
| SET-04 | Suoni globali e volume | Post-MVP | Decisione H0 |
| SET-05 | Densità interfaccia | Post-MVP | Media |
| SET-06 | Temi custom | Post-MVP | Bassa |
| SET-07 | Infrastruttura i18n | Post-MVP | Decisione H0 |
| SET-08 | Localizzazione EN/IT | Post-MVP | Decisione futura |

## 10. Accessibilità, responsive e qualità

| ID | Feature | Outcome / criterio essenziale | Fase | Evidenza |
|---|---|---|---|---|
| QUA-01 | Tastiera completa | Flussi core senza mouse e focus sempre visibile | MVP | Forte |
| QUA-02 | Touch target e alternative al drag | Operazioni core su tablet/telefono | MVP | Forte |
| QUA-03 | Zoom 200% e reflow | Nessun controllo essenziale perso | MVP | Forte |
| QUA-04 | Contrasto e non-color cues | Stato comprensibile senza dipendere dal colore | MVP | Audit |
| QUA-05 | Reduced motion | Nessuna animazione indispensabile | MVP | Accessibilità |
| QUA-06 | Browser matrix | Chrome, Firefox e Safari con viewport rappresentativi | MVP | Tecnica |
| QUA-07 | Test automatici | Store, tool core e flussi end-to-end protetti | MVP | Tecnica |
| QUA-08 | Performance budget | Avvio e interazioni fluidi con un carico realistico | MVP | Tecnica |
| QUA-09 | Privacy e telemetria opt-in | Nessuna raccolta necessaria al funzionamento locale | MVP | Principio |

## 11. Distribuzione

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| DST-01 | Web app deployabile | URL utilizzabile senza installazione | MVP | Decisione |
| DST-02 | Responsive browser desktop/tablet/mobile | Una codebase e un'esperienza web coerente | MVP | Decisione |
| DST-03 | Installazione PWA e cache offline completa | Uso installato e avvio senza rete | Post-MVP | Rinviata |
| DST-04 | Wrapper WebView mobile/tablet | Distribuzione store senza UI nativa separata | Post-MVP | Rinviata |
| DST-05 | Desktop wrapper | Finestra dedicata e integrazione OS | Future | Bassa |

## 12. Integrazioni VTT — post-MVP

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| INT-01 | Contratto adapter ArcanaScreen | Post-MVP | Tecnica |
| INT-02 | Deep link e import manuale | Post-MVP | Media |
| INT-03 | Foundry bridge in sola lettura | Post-MVP | Media |
| INT-04 | Eventi selezionati Foundry | Post-MVP | Media |
| INT-05 | Roll20 adapter | Post-MVP | Media |
| INT-06 | Fantasy Grounds adapter | Post-MVP | Media |
| INT-07 | Azioni bidirezionali esplicite | Future | Bassa |
| INT-08 | Sync universale | Out | Bassa / rischio alto |

## 13. Ecosistema e capacità speculative

| ID | Feature | Fase | Evidenza |
|---|---|---|---|
| EXT-01 | Manifest tool/plugin versionato | Future | Bassa |
| EXT-02 | SDK per tool di terze parti | Future | Bassa |
| EXT-03 | Catalogo curato | Future | Bassa |
| EXT-04 | Marketplace pubblico | Future | Bassa / rischio alto |
| EXT-05 | Template community senza codice | Post-MVP | Media |
| AI-01 | Trascrizione e recap automatici | Future | Bassa |
| AI-02 | Estrazione automatica di NPC/quest | Future | Bassa |
| COL-01 | Player-facing views | Out | Fuori vision |
| COL-02 | VTT maps/token/LOS | Out | Fuori vision |
| COL-03 | Video/audio hosting | Out | Fuori vision |

## Slice MVP raccomandata

### Fondazione

- Web app deployabile e responsive.
- Screen lifecycle essenziale.
- Prepare / Run.
- Griglia responsiva con add/remove/reorder e dimensioni strutturate.
- Tool platform tipizzata e versionata.
- Autosave, recovery, import/export e undo.

### Esperienza principale

- Template General e Combat; Exploration da confermare.
- Libreria tool non permanente e add esplicito.
- Quick capture/inbox, note e quick reference.
- Dice Roller, Initiative Tracker e Timer portati a standard “session-ready”.
- Simple Table e Counter sottoposti a verifica prima del commitment finale.

### Qualità di uscita

- Flussi core da tastiera e touch.
- Reflow desktop/tablet/telefono e zoom 200%.
- Error recovery comprensibile.
- Test automatici e matrice browser.
- Nessuna dipendenza da account, cloud o integrazione VTT.

## Decisioni derivate dai prototipi di Orizzonte 0

1. Quick Capture, Session Notebook e Quick Reference sono superfici distinte di un core coerente.
2. Prepare espone struttura e configurazione; Run protegge la conduzione e consente il cambio di Focus.
3. Il numero esatto di dimensioni strutturate viene verificato durante `M1.3`, senza introdurre resize libero.
4. Simple Table e Counter sono rinviati post-MVP.
5. Exploration entra come Focus; un template iniziale separato viene valutato post-MVP.
6. L'onboarding MVP porta a uno screen utile; la checklist aggiuntiva è rinviata.

## Regola per popolare la roadmap

La roadmap deve importare feature da questo catalogo tramite ID e raggrupparle in outcome, non copiare l'intero elenco. Le feature **MVP candidate** entrano solo dopo una decisione o un test; le feature **Post-MVP** e **Future** restano visibili come opzioni, non come impegni temporali.
