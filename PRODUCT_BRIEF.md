# ArcanaScreen — Product Brief

Versione: 0.3 — MVP scope working draft  
Data: 11 luglio 2026  
Stato: fondazione di prodotto supportata da ricerca pubblica, da validare con interviste e test

Evidenze collegate: [UX Research Brief](RESEARCH.md) · [Audit dell'esperienza attuale](.codex/product-design/arcana-audit/audit.md)

## Visione

ArcanaScreen è lo **schermo virtuale del Dungeon Master**: uno spazio personale, componibile e a bassa frizione che tiene strumenti e informazioni operative a portata di mano durante una sessione.

Non sostituisce un Virtual Tabletop. Lavora accanto a Foundry VTT, Roll20, Fantasy Grounds e strumenti analoghi; in futuro può integrarsi con essi tramite adapter o plugin senza diventare il luogo autoritativo in cui si svolge il gioco.

## Decisioni di scope confermate

- Il primo prodotto è una **web app**.
- Desktop è il contesto principale del primo MVP.
- Tablet e telefono devono essere usabili tramite interfaccia web responsiva; un eventuale wrapper WebView non richiede un'esperienza nativa separata nel primo MVP.
- Il primo MVP usa un layout responsivo semplice e prevedibile. Sidecar specializzato, layout per dispositivo, posizionamento libero e altre modalità spaziali avanzate sono post-MVP.
- Le integrazioni con Foundry VTT, Roll20, Fantasy Grounds e altri VTT sono post-MVP.
- Il modello del core non deve impedire layout avanzati o adapter futuri, ma il primo MVP non ne sostiene il costo di prodotto e compatibilità.

## Posizionamento

Per i Dungeon Master che durante una sessione devono coordinare note, riferimenti, dadi, timer, tracker e piccoli strumenti distribuiti fra più applicazioni, ArcanaScreen è un companion workspace configurabile che mantiene ciò che serve visibile e azionabile con poca attenzione.

A differenza di un VTT, non gestisce la superficie condivisa dai giocatori. A differenza di una generica app di note o dashboard, è progettato intorno al ritmo, alle interruzioni e ai vincoli operativi del game mastering.

## Problema

Durante il gioco il DM deve passare rapidamente fra informazioni preparate, stato temporaneo e azioni frequenti. Questi elementi vivono spesso in finestre, tab, fogli e strumenti separati. Il costo non è solo il tempo del click: ogni cambio di contesto interrompe il ritmo, aumenta il carico mentale e rende più facile perdere informazioni. Anche con più monitor, lo spazio resta una risorsa critica e i workaround basati su pop-out o istanze duplicate sono fragili.

I VTT risolvono soprattutto la superficie condivisa del gioco. ArcanaScreen si concentra sullo spazio privato e operativo del DM.

## Audience

### Primaria — ipotesi da validare

DM che utilizzano già un VTT per sessioni online o ibride e vogliono un cockpit personale su secondo monitor o finestra affiancata.

### Secondaria — ipotesi da validare

DM che giocano in presenza con laptop o tablet e desiderano sostituire o ampliare uno screen fisico con strumenti digitali.

### Non prioritaria inizialmente

- Giocatori che cercano una scheda personaggio o un client di gioco.
- Gruppi che cercano un VTT completo.
- Team che richiedono gestione collaborativa e cloud multiutente come requisito di base.

## Lavori principali del DM

### Prima della sessione

- Riprendere uno screen già conosciuto o partire da un preset.
- Scegliere quali strumenti e riferimenti tenere disponibili.
- Appuntare o collegare materiali esistenti senza migrare l'intera campagna.
- Organizzare lo spazio in funzione del dispositivo e del VTT affiancato.
- Preparare dati temporanei senza dover configurare un sistema complesso.

### Durante la sessione

- Recuperare un'informazione in pochi secondi senza abbandonare il contesto corrente.
- Aggiornare rapidamente stato temporaneo, note, timer, turni e contatori.
- Catturare un nome, una decisione o una conseguenza senza compilare un form.
- Lanciare o calcolare qualcosa senza aprire un'altra applicazione.
- Cambiare configurazione quando cambia il tipo di scena o attività.
- Ridurre, comprimere o richiamare lo screen senza coprire il VTT.

### Dopo la sessione

- Conservare ciò che deve rimanere e scartare ciò che era temporaneo.
- Rivedere e organizzare le catture grezze prodotte durante il live.
- Duplicare o adattare lo screen per la prossima sessione.
- Esportare e recuperare i dati senza dipendere da un account.

## Principi di prodotto

### 1. Companion, non destinazione

ArcanaScreen deve convivere bene con il tavolo e con gli altri strumenti. Non deve chiedere al DM di trasferire l'intera campagna al suo interno.

### 2. Bassa attenzione richiesta

Le operazioni frequenti devono essere visibili, prevedibili e azionabili con pochi passaggi. Durante il gioco la personalizzazione lascia spazio all'uso.

### 3. Glanceable, non enciclopedico

ArcanaScreen porta in primo piano ciò che serve ora. Collega e sintetizza fonti più profonde senza provare a sostituire knowledge base, manuali o journal del VTT.

### 4. Screen-first

Lo **screen** è l'oggetto principale del prodotto. Campagna, sessione e scena possono fornire contesto, preset o dati, ma non devono trasformare ArcanaScreen in un campaign manager o VTT.

### 5. Personalizzazione con struttura

Il DM può comporre il proprio spazio, ma il prodotto deve offrire preset, buoni default e regole di layout. Libertà non significa partire sempre da una tela vuota.

### 6. Local-first e resiliente

Le funzioni fondamentali non richiedono un account e conservano i dati localmente. Una sessione già aperta non deve dipendere dalla rete; installazione PWA e avvio completamente offline sono post-MVP. Salvataggio, recovery, portabilità e migrazioni dei dati fanno parte dell'esperienza, non sono dettagli tecnici.

### 7. System-neutral nel core

Gli strumenti fondamentali non dipendono da uno specifico regolamento. Template e pacchetti specializzati possono essere aggiunti senza frammentare il modello di base.

### 8. Integrazioni progressive

Le integrazioni con i VTT devono essere opzionali, esplicite e sostituibili. In assenza di integrazione, il prodotto resta pienamente utile.

### 9. Accessibile in ogni modalità

Mouse, tastiera e touch devono avere percorsi equivalenti. Dimensione della finestra, zoom, contrasto, focus e riduzione del movimento sono vincoli di progetto.

## Modello concettuale — ipotesi

```text
Workspace locale
└── Screen
    ├── Layout / modalità di visualizzazione
    ├── Tool instances
    ├── Preset o template di partenza
    └── Context opzionale
        ├── Campagna
        ├── Sessione
        └── Fonte esterna / integrazione VTT
```

Lo screen possiede layout e configurazione. I tool possiedono il proprio stato. Il contesto serve a organizzare o precompilare, non è obbligatorio per usare il prodotto.

## Stati dell'esperienza — ipotesi

### Prepare

Permette di aggiungere, rimuovere, configurare, spostare e ridimensionare strumenti; creare preset; importare dati; definire scorciatoie.

### Run

Riduce il chrome di editing e ottimizza leggibilità, rapidità e sicurezza. Le azioni distruttive o strutturali non devono interferire con la conduzione live.

### Responsive web — MVP

Lo stesso prodotto web deve restare usabile su desktop, tablet e telefono attraverso reflow, priorità chiare e controlli compatibili con touch. Non sono previsti layout personali per dispositivo né una UI mobile nativa distinta nel primo MVP.

### Modalità spaziali avanzate — post-MVP

Sidecar specializzato, profili per dispositivo, second-monitor mode, focus/fullscreen dedicato e posizionamento libero saranno valutati dopo aver validato il core dell'app.

## Domini di capacità

Queste aree organizzano la futura feature map; non sono ancora una promessa di roadmap.

1. **Workspace e screen:** creazione, ripristino, duplicazione, rinomina, archiviazione.
2. **Layout e modalità:** griglia responsiva, ordine e visibilità dei tool, lock, Prepare/Run; layout spaziali avanzati post-MVP.
3. **Tool platform:** registry, configurazione, istanze multiple, preset, interoperabilità fra tool.
4. **Tool essenziali:** note, dadi, timer, iniziativa, tabelle, contatori e riferimenti rapidi.
5. **Curation e cattura:** pin temporanei, link profondi, recenti, inbox live e review post-sessione.
6. **Template e contesti:** preset per attività, regolamenti o stili di conduzione.
7. **Dati:** autosave, versioning, backup, import/export, recovery e migrazioni.
8. **Interazione:** scorciatoie, command palette, touch, focus, undo e azioni sicure.
9. **Integrazioni:** adapter VTT, mapping dati, permessi, stato della connessione e fallback.
10. **Ecosistema:** manifest, plugin/tool SDK, template condivisibili e compatibilità.
11. **Qualità trasversale:** accessibilità, performance, privacy, sicurezza, i18n e diagnostica.

## Confini e non-obiettivi

ArcanaScreen non dovrebbe includere nel core:

- Mappe condivise, token, fog of war o line of sight.
- Client o vista dedicata ai giocatori.
- Videochat, audiochat o hosting della sessione.
- Un rules engine completo o automazione autoritativa del combattimento.
- Un sistema completo di schede personaggio comparabile a quello dei VTT.
- Marketplace di contenuti con codice eseguibile prima di avere un threat model e un modello di compatibilità.
- Cloud, account e collaborazione realtime come prerequisiti per il valore base.

Statistiche, riferimenti e piccoli dati importati possono essere mostrati quando aiutano il DM, senza trasformare ArcanaScreen nella fonte primaria del gioco.

## Principi di integrazione VTT

Questi principi guidano il post-MVP e non costituiscono feature del primo MVP.

- Il core non dipende da un singolo VTT.
- Ogni integrazione dichiara quali dati legge e quali può scrivere.
- La fonte autoritativa di ogni dato deve essere chiara all'utente.
- Disconnessione, versione incompatibile o permessi mancanti degradano in modo comprensibile.
- Gli adapter condividono contratti stabili ma possono supportare capacità differenti.
- Nessuna integrazione deve rendere inutilizzabile lo screen offline.
- La progressione preferita è: deep link o import manuale → bridge in sola lettura → eventi selezionati → azioni bidirezionali esplicite.

## Ipotesi di MVP da validare

Un MVP utile dovrebbe permettere a un DM di:

1. Creare o riprendere rapidamente uno screen.
2. Partire da un buon preset e personalizzare un layout responsivo semplice.
3. Utilizzare più tool essenziali per una sessione di 3–4 ore.
4. Appuntare riferimenti esistenti e recuperarli rapidamente senza migrare la campagna.
5. Catturare note grezze durante il live e rivederle dopo la sessione.
6. Passare fra Prepare e Run senza perdere stato o posizione.
7. Recuperare i propri dati dopo reload, errore o cambio browser tramite export/import.
8. Operare con mouse e tastiera senza dipendere dal drag-and-drop.

Le integrazioni VTT e le modalità spaziali avanzate sono esplicitamente escluse dal primo MVP. Il modello dati non deve impedirle, ma non vanno anticipate nell'interfaccia o nell'implementazione.

## Segnali di successo

### Utilità

- Un DM raggiunge uno screen utilizzabile senza onboarding obbligatorio.
- Gli strumenti più frequenti sono recuperabili senza cambiare applicazione.
- Il prodotto resta aperto e utilizzato durante una sessione completa.

### Usabilità

- Tempo ridotto per creare, riprendere o cambiare screen.
- Tempo ridotto per trovare un riferimento e catturare una nota.
- Riduzione dei cambi finestra necessari nei flussi osservati.
- Operazioni live frequenti completate senza entrare in modalità di configurazione.
- Finestra affiancata utilizzabile senza perdita delle azioni principali.

### Fiducia

- Stato persistente e recuperabile dopo reload o errore.
- Export comprensibile e verificabile.
- Nessuna azione distruttiva irreversibile durante Run.

### Qualità

- Flussi critici utilizzabili con tastiera, touch e zoom.
- Prestazioni stabili con un numero realistico di tool.
- Telemetria, se introdotta, opt-in e coerente con il posizionamento local-first.

## Rischi e assunzioni da validare

1. **Ampiezza dell'audience:** VTT-first oppure stesso peso a online, ibrido e presenza.
2. **Screen-first:** confermare che i DM pensino in configurazioni di strumenti più che in campagne o scene.
3. **Personalizzazione:** trovare il punto giusto fra canvas libero, griglia strutturata e preset.
4. **Responsive web:** definire la baseline usabile su tablet e telefono senza trasformarla in una linea di prodotto separata.
5. **Tool core:** distinguere strumenti universali da bisogni legati a un regolamento.
6. **Doppio inserimento:** misurare quali dati meritano per primi un adapter VTT.
7. **Local-first:** verificare aspettative su sync, backup e uso multi-device.
8. **Estensibilità:** stabilire quando plugin e tool di terze parti creano valore rispetto al costo di sicurezza e compatibilità.

## Decisioni ancora aperte

- Priorità relativa fra DM online, ibridi e in presenza.
- Terminologia definitiva per Workspace, Screen, Preset e Context.
- Grado di persistenza del contesto di campagna/sessione.
- Dettaglio del reflow della griglia alle diverse larghezze.
- Set minimo di tool che dimostra il valore del prodotto.
- Confine fra riferimenti appuntati, snapshot e contenuti copiati nello screen.
- Flusso di review post-sessione per l'inbox live.
- Prima integrazione VTT e confini del suo flusso dati, da affrontare dopo l'MVP.
- Ordine post-MVP fra PWA, wrapper WebView, layout spaziali avanzati e integrazioni.

## Relazione con la roadmap

Questo brief definisce il problema, i confini e le ipotesi. La feature roadmap deve essere costruita dopo:

1. ricerca pubblica e interviste;
2. mappa dei lavori e dei journey;
3. capability map completa;
4. prototipi dei flussi principali;
5. valutazione di valore, evidenza, dipendenze e rischio.

La roadmap tecnica esistente resta utile come inventario di affidabilità e debito, ma non decide da sola quali capacità costituiscono il prodotto.
