# ArcanaScreen — UX Research Brief

**Data della ricerca:** 11 luglio 2026  
**Orizzonte di prodotto:** 12–24 mesi  
**Audience primaria:** Game Master che usano già un VTT, spesso con ArcanaScreen in finestra affiancata o su un secondo monitor  
**Audience secondaria:** Game Master in presenza o in modalità ibrida  
**Ambito:** problemi e workaround prima, durante e dopo la sessione; multitasking; note e riferimenti; iniziativa, dadi e timer; spazio a schermo; modalità compatta/sidecar; local-first e portabilità; integrazioni e plugin.

## Executive read

Il segnale più forte non è la mancanza di funzioni nel VTT, ma il costo cognitivo di gestire contemporaneamente VTT, note, PDF, chat/video, schede e utility. I GM costruiscono già un “DM screen digitale” distribuendo questi materiali fra più finestre, monitor, browser, documenti e perfino carta: ArcanaScreen può trasformare questo assemblaggio personale in un cockpit coerente, senza provare a sostituire il VTT. Il bisogno centrale è **ritrovare e azionare ciò che serve in pochi secondi, senza perdere il punto né coprire la mappa**, più che archiviare una campagna completa.

Le testimonianze ricorrenti mostrano che perfino due monitor possono non bastare durante il combattimento, mentre pop-out, login duplicati e moduli risolvono il problema solo in modo fragile. Le note hanno due tempi diversi: conoscenza organizzata preparata prima della sessione e cattura grezza durante il gioco; trattarle come un unico editor rallenta entrambe. Il valore di local-first, backup ed export è soprattutto fiducia operativa: una sessione live non tollera dati scomparsi, rete assente o una configurazione non ripristinabile. Le integrazioni VTT sono promettenti, ma le API, i modelli di abbonamento e i cicli di compatibilità differiscono molto; vanno quindi progettate come adapter opzionali, non come fondamento del prodotto.

**Tesi di prodotto:** ArcanaScreen dovrebbe essere un companion personale, system-neutral e glanceable che conserva il contesto del GM, passa chiaramente da preparazione a conduzione live, funziona in spazi stretti ed è affidabile anche senza integrazioni.

## Come leggere i punteggi

- **Severity:** 4 = può interrompere o compromettere una sessione; 3 = rallenta ripetutamente il GM; 2 = attrito significativo ma aggirabile; 1 = fastidio marginale.
- **Frequency signal:** ricorrenza qualitativa nel campione, non prevalenza statistica di mercato.
- **Confidence:** forza e triangolazione delle evidenze pubbliche.
- **Leverage:** quanto una soluzione è differenziante e coerente con la vision di ArcanaScreen.

## Problemi UX classificati

| # | Problema | Severity | Frequency signal | Confidence | Leverage |
|---|---|---:|---|---|---|
| 1 | Frammentazione del cockpit e cambio di contesto | 3 | Alto | Alta | Molto alto |
| 2 | Spazio a schermo insufficiente e gestione finestre fragile | 3 | Alto | Alta | Molto alto |
| 3 | Recupero lento di note e riferimenti durante il live | 3 | Alto | Alta | Molto alto |
| 4 | Cattura live incompatibile con l'attenzione richiesta al GM | 3 | Medio–alto | Medio–alta | Alto |
| 5 | Screen statici o sovraccarichi non seguono il contesto della sessione | 2 | Alto | Alta | Alto |
| 6 | Setup, ripristino e continuità operativa richiedono fiducia | 4 quando accade | Medio | Medio–alta | Molto alto |
| 7 | Layout e scala escludono laptop piccoli, zoom elevato e touch | 3 per chi è coinvolto | Segnale incerto | Media | Alto |
| 8 | Integrazioni potenti ma disomogenee, fragili o vincolate | 2 oggi; 3 a regime | Medio | Alta | Medio–alto |

### 1. Il cockpit del GM è frammentato fra troppe superfici

**User goal**  
Condurre la sessione restando presente nella conversazione, con mappa, comunicazione, note, regole e strumenti immediatamente disponibili.

**Surface**  
VTT principale, secondo monitor, PDF, Discord/video, browser, OneNote/Notion/Obsidian, fogli di calcolo, generatori, carta.

**Cosa si rompe**  
Ogni ricerca o azione richiede di ricordare *dove* si trova l'informazione, cambiare finestra, recuperare il punto e poi tornare al VTT. Il costo non è solo il numero di click: è la perdita di ritmo e attenzione condivisa.

**Evidenza osservata**

- In una discussione Roll20 sui secondi monitor, i GM descrivono setup con note, browser, PDF, Discord e schede personaggio distribuiti su due o più schermi; un altro GM tiene persino un proprio DM screen in Excel ([r/Roll20, 2020](https://www.reddit.com/r/Roll20/comments/fth5xy/second_screens_purpose/), [r/Roll20, 2020](https://www.reddit.com/r/Roll20/comments/gt5436/dm_screen_advice/)).
- Un thread Foundry del 2025 descrive Foundry su un monitor, PDF e Discord sull'altro, ma “perpetually out of space”, soprattutto in combattimento ([r/FoundryVTT, 2025](https://www.reddit.com/r/FoundryVTT/comments/1i2jsux/multi_screenscreen_real_estate/)).
- Una discussione ampia sugli strumenti D&D mostra una pluralità stabile di stack personali: Obsidian, OneNote, Notion, Google Docs e carta, ciascuno scelto per differenti compromessi ([r/DnD, 2024](https://www.reddit.com/r/DnD/comments/1cy7ha8/dms_what_do_you_use_to_keep_all_of_your_notes_in/)).

**Inferenza**  
Il concorrente principale di ArcanaScreen non è un singolo prodotto, ma il bricolage di finestre e strumenti già costruito da ogni GM. La proposta di valore deve quindi ridurre il cambio di contesto senza imporre una nuova “fonte unica di verità” per tutta la campagna.

**Mossa di prodotto raccomandata**  
Progettare ArcanaScreen come **layer operativo personale**: link, snapshot, riferimenti, tracker e azioni frequenti raccolti in uno screen, con apertura e ritorno prevedibili. Consentire collegamenti verso strumenti esterni invece di forzarne subito la migrazione.

### 2. Lo spazio a schermo è una risorsa critica, e i workaround multi-window sono fragili

**User goal**  
Tenere la mappa e le informazioni di gioco visibili senza sovrapposizioni, in un secondo monitor o in una striscia laterale del monitor principale.

**Surface**  
Finestre flottanti, pop-out, sidebar, canvas, browser duplicati, modalità fullscreen, zoom del browser.

**Cosa si rompe**  
Note, tracker e schede coprono il canvas; minimizzare fa perdere il punto; i pop-out possono non funzionare nell'app standalone o con moduli/sistemi diversi; il GM ricorre a un secondo account, browser privato o istanza separata.

**Evidenza osservata**

- Un GM Foundry racconta che i journal occupano troppo canvas, devono essere chiusi per tirare dadi o gestire il combattimento e poi è difficile ritrovare il punto; il pop-out rende problematiche le modifiche rapide ([r/FoundryVTT, 2025](https://www.reddit.com/r/FoundryVTT/comments/1mt79w4/improving_my_workflow_using_jouranals/)).
- La pagina ufficiale del modulo PopOut! avverte che non funziona nell'app standalone, non garantisce compatibilità con altri sistemi/moduli e può rompere funzionalità quando una finestra viene estratta ([Foundry package directory](https://foundryvtt.com/packages/popout)).
- Il supporto pop-out nativo è stato una richiesta tanto persistente da vincere il voto Patreon per Foundry V14; Foundry lo definisce esplicitamente “long-desired”, soprattutto per chi usa più monitor ([Foundry V14 release notes](https://foundryvtt.com/releases/14.349)).
- Su Fantasy Grounds, l'app è storicamente una singola finestra; i workaround suggeriti includono estenderla fra monitor o avviare una seconda istanza localhost ([Fantasy Grounds forum](https://www.fantasygrounds.com/forums/showthread.php?38056-Dual-Monitor-Support=), [thread multi-monitor](https://www.fantasygrounds.com/forums/showthread.php?55717-Multi-Monitor-Support-planned=)).

**Inferenza**  
Il problema rimane anche se Foundry V14 migliora i pop-out: ArcanaScreen deve convivere con browser, VTT e hardware diversi. “Responsive” non basta; serve una progettazione esplicita per densità e larghezza operativa.

**Mossa di prodotto raccomandata**  
Trattare **Sidecar**, **Second monitor** e **Focus/fullscreen** come modalità di prima classe, ognuna con priorità e densità proprie. Ogni widget dovrebbe avere almeno una resa compatta e una espansa; il layout deve ricordare posizione, dimensione e stato per dispositivo.

### 3. Il problema delle note durante il live è recuperare, non archiviare

**User goal**  
Vedere in un colpo d'occhio la regola, lo stat block, la persona o il promemoria rilevante, poi tornare alla conduzione senza perdere il punto.

**Surface**  
Quick reference, journal, PDF, schede, ricerca, note appuntate, contenuti collegati alla scena o alla sessione.

**Cosa si rompe**  
Un documento completo è troppo lento da scandire; chiuderlo fa perdere la posizione; cercare sul web o nel manuale rompe il ritmo. Un DM screen troppo pieno annulla il vantaggio della consultazione a colpo d'occhio.

**Evidenza osservata**

- Un GM passato al gioco online su Roll20 dice di sentire la mancanza delle informazioni del DM screen consultabili “just at a glance”, anche se le stesse informazioni sono ricercabili online o in un documento ([r/DnD, 2026](https://www.reddit.com/r/DnD/comments/1tweb7l/dm_screens_for_online_play/)).
- Le raccomandazioni della community convergono su informazioni frequenti e compatte — condizioni, concentrazione, copertura, percezioni passive, costi ricorrenti — e avvertono che troppo contenuto sconfigge lo scopo dello screen ([r/DungeonMasters, 2025](https://www.reddit.com/r/DungeonMasters/comments/1pcjra4/dm_screen/)).
- Nel thread Foundry sui journal, alcuni GM ricorrono a note appuntate sulla mappa, riassunti dell'incontro o addirittura appunti a mano per poter anticipare la prossima azione del mostro con uno sguardo ([r/FoundryVTT, 2025](https://www.reddit.com/r/FoundryVTT/comments/1mt79w4/improving_my_workflow_using_jouranals/)).

**Inferenza**  
ArcanaScreen non deve competere con Obsidian o Notion come knowledge base. Deve offrire un livello di **curation per la sessione** sopra fonti più profonde: ciò che serve ora, non tutto ciò che esiste.

**Mossa di prodotto raccomandata**  
Separare “contenuto sorgente” da “contenuto appuntato allo screen”. Supportare viste sintetiche, pin temporanei, link profondi, cronologia recente e ritorno alla posizione precedente. La ricerca globale è utile, ma non sostituisce la preparazione di una superficie glanceable.

### 4. Scrivere durante la sessione compete direttamente con il lavoro del GM

**User goal**  
Conservare decisioni, nomi improvvisati, conseguenze e promesse fatte ai giocatori senza smettere di ascoltare, interpretare e arbitrare.

**Surface**  
Scratchpad, note rapide, log della sessione, recap post-sessione, NPC e quest.

**Cosa si rompe**  
Il GM non ha tempo di strutturare bene una nota mentre parla e improvvisa; ciò che non viene catturato viene ricostruito a memoria dopo la sessione o perso. Se la cattura richiede classificazione e campi obbligatori, non viene usata.

**Evidenza osservata**

- Un GM descrive esplicitamente di non avere tempo per scrivere mentre parla, improvvisa NPC e narra; il workaround consigliato è annotare tutto per 5–10 minuti subito dopo la sessione ([r/DungeonMasters, 2025](https://www.reddit.com/r/DungeonMasters/comments/1o7xc2n/session_notes_as_a_dm/)).
- Un nuovo GM dice di dimenticare regolarmente i nomi improvvisati durante la sessione e di ricostruire poi un report; altri consigliano stat block e promemoria già estratti dal libro ([r/DungeonMasters, 2025](https://www.reddit.com/r/DungeonMasters/comments/1kapfmp/first_timer/)).
- Per gli NPC creati al volo, un pattern raccontato dalla community è: nota minima durante il gioco, pagina organizzata nella knowledge base solo dopo ([r/DnD, 2025](https://www.reddit.com/r/DnD/comments/1ohx15f/experienced_dms_how_do_you_keep_track_of_npcs/)).

**Inferenza**  
La cattura live e l'organizzazione post-sessione sono due job distinti. Cercare di ottenere dati puliti nel momento live aumenta l'attrito e rischia di peggiorare la sessione.

**Mossa di prodotto raccomandata**  
Creare un **inbox di sessione** con cattura a un gesto, timestamp automatico e testo libero; offrire il riordino e la promozione a NPC/quest/riferimento dopo il gioco. Comandi rapidi e scorciatoie hanno più valore dei form completi.

### 5. Il DM screen deve cambiare con sistema, esperienza e momento

**User goal**  
Avere davanti solo le informazioni utili alla sessione e al proprio stile di conduzione.

**Surface**  
Template, widget, preset, strumenti di combattimento e non-combattimento, layout di preparazione e conduzione.

**Cosa si rompe**  
Gli screen precompilati contengono molte informazioni irrilevanti; ciò che serve a un GM nuovo non coincide con ciò che serve a uno esperto; combattimento, esplorazione e roleplay richiedono densità diverse.

**Evidenza osservata**

- Le discussioni sui DM screen suggeriscono di partire dalle regole dimenticate più spesso e cambiare il contenuto dopo alcune sessioni; “too much information defeats the purpose” ([r/DungeonMasters, 2025](https://www.reddit.com/r/DungeonMasters/comments/1pcjra4/dm_screen/)).
- Un utente che usa inserti personalizzati stima che gran parte delle informazioni degli screen predefiniti sia inutile per il proprio gioco ([r/DnD, 2019](https://www.reddit.com/r/DnD/comments/d0ljbc/looking_to_buy_a_dm_screen/)). Questo è un dato vecchio e aneddotico, ma coerente con discussioni più recenti.
- I setup in presenza mescolano in modi diversi mappe digitali, miniature, fogli cartacei, dadi fisici, tracker e viewer separati ([r/FoundryVTT, 2026](https://www.reddit.com/r/FoundryVTT/comments/1rhse4s/anyone_using_foundry_vtt_for_inperson_sessions/)).

**Inferenza**  
La personalizzazione non è decorazione: è il meccanismo con cui il prodotto resta system-neutral e si adatta al carico cognitivo del singolo GM. Tuttavia, una tela completamente vuota aumenta l'onboarding.

**Mossa di prodotto raccomandata**  
Offrire preset opinionati ma modificabili per job (“sessione live”, “combattimento”, “esplorazione”, “recap”), non solo per regolamento. Separare chiaramente **Prepare** e **Run**: la prima ottimizza composizione e configurazione, la seconda stabilità, leggibilità e azioni frequenti.

### 6. Continuità, backup ed export sono parte dell'esperienza live

**User goal**  
Aprire lo screen poco prima della sessione e sapere che dati, layout e stato sono integri, recuperabili e portabili.

**Surface**  
Salvataggio automatico, local-first/offline, versioni, backup, import/export, recovery, indicatori di stato.

**Cosa si rompe**  
Una perdita o corruzione di dati poco prima del gioco ha gravità sproporzionata. Il backup manuale è facile da dimenticare; un aggiornamento o una dipendenza può rendere indisponibile un flusso critico.

**Evidenza osservata**

- La documentazione ufficiale Foundry raccomanda backup dopo modifiche importanti, dopo una sessione e prima degli aggiornamenti generazionali; distingue backup di package, snapshot e copie manuali ([Foundry, Backups and Snapshots](https://foundryvtt.com/article/backups/)).
- Nei thread sugli strumenti per note, local files, funzionamento senza internet e formato Markdown leggibile sono citati come ragioni specifiche per scegliere Obsidian ([r/DMToolkit, 2024](https://www.reddit.com/r/DMToolkit/comments/1aqbofd/session_prep_note_taking_app/), [r/DnD, 2024](https://www.reddit.com/r/DnD/comments/1bvi457/what_dd_tools_apps_do_you_swear_by/)).
- Una discussione popolare sulle note contiene sia fiducia pluriennale in OneNote sia un racconto di corruzione poco prima della sessione, con invito esplicito al backup ([r/DnD, 2024](https://www.reddit.com/r/DnD/comments/1cy7ha8/dms_what_do_you_use_to_keep_all_of_your_notes_in/)). È un singolo incidente riportato, non una stima di affidabilità del prodotto.

**Inferenza**  
“Local-first” da solo non garantisce sicurezza; serve una storia completa di persistenza, backup, recovery ed export leggibile. L'utente deve capire se lo stato è salvato senza dover conoscere localStorage o dettagli tecnici.

**Mossa di prodotto raccomandata**  
Rendere visibile lo stato di salvataggio, mantenere snapshot/versioni recuperabili, offrire export completo e documentato, import con anteprima e conflitti gestiti. Offline deve includere almeno apertura, lettura, modifica e ripristino dello screen, non solo il caricamento della shell.

### 7. La compattezza non deve sacrificare accessibilità e input alternativi

**User goal**  
Usare il companion su laptop, display verticale, zoom elevato, tablet o touch senza perdere controlli e leggibilità.

**Surface**  
Responsive layout, densità, zoom, font, contrasto, focus, tastiera, touch target, overflow.

**Cosa si rompe**  
UI con dimensioni assolute può tagliare azioni essenziali quando lo scaling del sistema operativo riduce lo spazio effettivo; aumentare lo zoom può spingere sidebar fuori schermo; interfacce pensate per mouse richiedono moduli specifici per il touch.

**Evidenza osservata**

- Un utente Foundry con ipovisione su laptop 1366×768 riferisce che i controlli principali scompaiono quando attiva lo scaling del sistema operativo e non sono recuperabili tramite scroll ([r/FoundryVTT, accessibility, 2021](https://www.reddit.com/r/FoundryVTT/comments/rpqbl3/help_accessibility_tips/)).
- Un altro utente, aumentando la scala per leggere meglio su monitor 4K, vede la sidebar spinta fuori schermo e ricorre a macro/CSS personalizzati ([r/FoundryVTT, UI scale, 2022](https://www.reddit.com/r/FoundryVTT/comments/vs0ks7/is_there_a_way_to_adjust_the_ui_scale_of_the/)).
- Nei setup in presenza, la community ricorre a TouchVTT, Hide UI e altri moduli per rendere utilizzabile Foundry su touchscreen o display condivisi ([r/FoundryVTT, 2026](https://www.reddit.com/r/FoundryVTT/comments/1rhse4s/anyone_using_foundry_vtt_for_inperson_sessions/)).

**Inferenza**  
Le fonti di accessibilità sono poche e alcune datate; il problema non può essere quantificato. Sono però chiare le failure mode da evitare. La modalità sidecar deve ridurre informazione, non semplicemente rimpicciolirla.

**Mossa di prodotto raccomandata**  
Definire da subito soglie di larghezza, zoom fino almeno al 200%, navigazione completa da tastiera, focus visibile, target touch e overflow recuperabile. Testare le modalità compatte con contenuti reali e stringhe localizzate.

### 8. Le integrazioni sono una leva futura, ma non una base affidabile per l'MVP

**User goal**  
Evitare il doppio inserimento e ricevere dal VTT solo il contesto utile: combattimento attivo, attore selezionato, iniziativa, scena o tiri.

**Surface**  
Plugin Foundry, Roll20 Mods API, estensioni Fantasy Grounds, importatori, eventi, permessi e versioni.

**Cosa si rompe**  
Le piattaforme espongono capacità e vincoli diversi; un'integrazione può dipendere da versione, sistema, abbonamento o moduli terzi. Aggiornamenti del VTT o del sistema possono rompere middleware e pop-out.

**Evidenza osservata**

- Foundry espone una vasta API JavaScript per documenti come Actor, Combat, Journal e Roll, ma la sua documentazione avverte che possono esserci breaking changes durante lo sviluppo ([Foundry API v13](https://foundryvtt.com/api/v13/index.html)).
- Roll20 consente script JavaScript guidati da eventi, capaci di modificare token, marker e tiri, ma la funzione Mods API è riservata agli abbonati Pro o ai giochi creati da un abbonato ([Roll20 Help Center](https://help.roll20.net/hc/en-us/articles/360037256714-Introduction-to-Mod-Scripts-API)).
- Fantasy Grounds supporta ruleset ed estensioni basati su XML e Lua, un modello diverso dai due precedenti ([Fantasy Grounds developer guide](https://www.fantasygrounds.com/modguide/), [extension files](https://fantasygroundsunity.atlassian.net/wiki/spaces/FGCP/pages/996645668/Developer+Guide+-+Extensions+-+Files)).
- La pagina ufficiale PopOut! descrive esplicitamente la propria implementazione come fragile rispetto a sistemi e moduli ([Foundry package directory](https://foundryvtt.com/packages/popout)).

**Inferenza**  
Un “sync universale” precoce creerebbe una matrice di compatibilità costosa. L'opportunità più solida è un contratto ArcanaScreen piccolo e stabile, con adapter per piattaforma e degradazione elegante a modalità standalone.

**Mossa di prodotto raccomandata**  
Progettare integrazioni progressive: **deep link/import manuale → companion bridge in sola lettura → eventi selezionati → azioni esplicite bidirezionali**. Non rendere mai una connessione VTT necessaria per aprire o usare lo screen.

## Journey: cosa accade prima, durante e dopo

| Momento | Job del GM | Attrito osservato | Opportunità ArcanaScreen |
|---|---|---|---|
| Prima | Recuperare uno screen e portare in primo piano ciò che servirà | Contenuti sparsi, layout da ricostruire, rischio di dimenticare una utility | Preset per job, “resume last setup”, checklist leggera, pin della sessione |
| Prima | Preparare riferimenti senza duplicare tutta la campagna | Copia/incolla da PDF, note o VTT; screen statici troppo generici | Link/snapshot con provenienza, viste sintetiche, template modificabili |
| Durante | Consultare regole e note senza coprire il VTT | Finestre sovrapposte, pop-out fragili, perdita del punto | Run mode stabile, sidecar, recenti, ritorno alla posizione, focus rapido |
| Durante | Gestire iniziativa, timer, dadi e piccoli contatori | Tool separati o tracker legati a token/scena; workaround manuali | Utility system-neutral, input rapido, stati compatti, reset/undo sicuri |
| Durante | Catturare improvvisazioni e conseguenze | Il GM non può strutturare note mentre parla | Inbox timestampata, scorciatoie, zero campi obbligatori |
| Dopo | Conservare ciò che è accaduto e preparare la continuità | Ricostruzione a memoria, note grezze non smistate | Review post-sessione, promozione delle note, snapshot e recap esportabile |
| Sempre | Sapere che il proprio screen è salvo e portabile | Affidamento implicito a storage, browser o modulo | Stato di sync/salvataggio chiaro, versioni, backup ed export |

## Segnale per capability, non ancora roadmap

Questa mappa indica la forza del bisogno, non una promessa di implementazione.

### Must investigate / strong evidence

1. **Prepare vs Run:** modalità con obiettivi e affordance differenti.
2. **Sidecar e multi-monitor:** layout che funzionino realmente a larghezze strette e ricordino il contesto per dispositivo.
3. **Session curation:** pin, recenti, link e riferimenti sintetici sopra fonti esterne.
4. **Quick capture:** inbox live e review post-sessione.
5. **Workspace affidabile:** autosave comprensibile, versioni, recovery, import/export.
6. **Personalizzazione guidata:** preset per job e strumenti componibili, senza canvas vuoto come onboarding.

### Promising / medium evidence

1. **Tracker system-neutral:** iniziativa, contatori, condizioni libere, timer e dadi senza dipendere dai token del VTT.
2. **Quick reference packs:** contenuto modificabile e contestuale, con attenzione a licenze e regolamenti.
3. **Deep links e import leggeri:** collegamenti a pagine, documenti e oggetti del VTT prima del sync.
4. **Touch e in-person modes:** rilevanti per audience secondaria, da validare con setup reali.

### Speculative / needs evidence

1. Sync bidirezionale universale con più VTT.
2. Collaborazione in tempo reale o player-facing views.
3. Trascrizione AI e recap automatici.
4. Marketplace pubblico di widget/plugin.
5. Gestione completa di campagne, lore, mappe o schede personaggio.

Le ultime cinque capability possono essere interessanti, ma rischiano di spostare ArcanaScreen verso un VTT o una campaign knowledge base. Non dovrebbero entrare in roadmap senza interviste e test specifici.

## Opportunity map

### Da fissare questa settimana — decisioni di prodotto

- Definire il modello principale come **Screen personale**, non Campaign o Scene.
- Formalizzare i non-obiettivi: niente mappe/token/line of sight/client giocatore nel core.
- Definire i tre contesti di layout: sidecar, secondo monitor, fullscreen/focus.
- Separare Prepare e Run nei flussi, anche se inizialmente condividono gli stessi dati.
- Definire il minimo contratto di affidabilità: autosave visibile, undo, recovery, export e nessuna dipendenza dalla rete per il core.
- Trasformare i widget esistenti in ipotesi da validare, non in architettura di prodotto già decisa.

### Da esplorare questo trimestre — prototipi e test

- Prototipare tre flussi: riprendere uno screen; prepararne uno; condurre una sessione in sidecar.
- Testare con 6–8 GM: almeno Foundry, Roll20, un altro VTT e due setup in presenza/ibridi.
- Misurare: tempo per trovare un riferimento, numero di cambi finestra, errori di ripresa, tempo per catturare una nota, fiducia nel salvataggio.
- Confrontare due modelli di personalizzazione: preset guidati vs canvas libero.
- Validare un inbox live con review post-sessione.
- Fare prove di stress a 320–480 px di larghezza, zoom 200%, tastiera e touch.
- Prototipare un solo adapter in sola lettura, preferibilmente Foundry, per testare il valore del contesto VTT senza impegnarsi nel sync universale.

### Richiede ricerca più profonda

- Disponibilità e limiti reali delle API per ogni VTT, inclusi autenticazione, distribuzione, policy marketplace e abbonamenti.
- Quali dati i GM accetterebbero di sincronizzare e quale sistema considerano autoritativo.
- Bisogni di GM non D&D e requisiti di localizzazione dei reference pack.
- Accessibilità con utenti reali: ipovisione, solo tastiera, difficoltà motorie e neurodivergenze.
- Distinzione fra GM online, in presenza e ibridi: il campione pubblico suggerisce comportamenti diversi ma non ne misura il peso.
- Disponibilità a pagare e modello di distribuzione: app standalone, PWA, plugin VTT o combinazione.

## Source map

### Fonti con segnale forte

| Fonte | Cosa ha contribuito | Limite |
|---|---|---|
| [Foundry: journal workflow](https://www.reddit.com/r/FoundryVTT/comments/1mt79w4/improving_my_workflow_using_jouranals/) | Perdita di spazio, chiusura/riapertura, pop-out e ritorno al punto | Un thread, audience Foundry |
| [Foundry: multi-screen real estate](https://www.reddit.com/r/FoundryVTT/comments/1i2jsux/multi_screenscreen_real_estate/) | Setup reali con VTT, PDF e Discord; due monitor ancora insufficienti | Self-report, nessuna telemetria |
| [Foundry V14 pop-outs](https://foundryvtt.com/releases/14.349) | Conferma ufficiale che multi-window è un bisogno persistente | Parla di Foundry, non di companion esterni |
| [Foundry PopOut!](https://foundryvtt.com/packages/popout) | Limiti e fragilità dichiarati del workaround | Modulo specifico |
| [Online DM screen](https://www.reddit.com/r/DnD/comments/1tweb7l/dm_screens_for_online_play/) | Valore della consultazione a colpo d'occhio rispetto alla ricerca | Thread piccolo |
| [DM session notes](https://www.reddit.com/r/DungeonMasters/comments/1o7xc2n/session_notes_as_a_dm/) | Conflitto fra conduzione e scrittura; recap immediato post-sessione | Poche testimonianze |
| [Note-taking tools](https://www.reddit.com/r/DnD/comments/1cy7ha8/dms_what_do_you_use_to_keep_all_of_your_notes_in/) | Varietà degli stack e valore percepito di portabilità/backup | Popolarità del thread non equivale a quota di mercato |
| [Foundry in-person setups](https://www.reddit.com/r/FoundryVTT/comments/1rhse4s/anyone_using_foundry_vtt_for_inperson_sessions/) | Setup ibridi, viewer, touch, carta e dadi fisici | Community molto tecnica e autocampionata |

### Fonti ufficiali e tecniche

| Fonte | Cosa ha contribuito | Limite |
|---|---|---|
| [Foundry API v13](https://foundryvtt.com/api/v13/index.html) | Superfici di integrazione e rischio di versioning | Non misura il bisogno utente |
| [Roll20 Mods API](https://help.roll20.net/hc/en-us/articles/360037256714-Introduction-to-Mod-Scripts-API) | Eventi/azioni disponibili e vincolo Pro | Non è necessariamente un'API esterna generale |
| [Fantasy Grounds developer guide](https://www.fantasygrounds.com/modguide/) | Modello XML/Lua distinto | Documentazione tecnica, non UX |
| [Foundry backups](https://foundryvtt.com/article/backups/) | Necessità operativa e workflow ufficiale di backup | Specifico di Foundry |
| [Fantasy Grounds dual-monitor](https://www.fantasygrounds.com/forums/showthread.php?38056-Dual-Monitor-Support=) | Limite storico della singola finestra e workaround | Thread datato; utile solo come segnale longitudinale |

### Aree cercate con segnale debole o assente

- **Roll20 recente:** sono emersi esempi utili su secondi monitor e initiative tracker, ma meno discussioni recenti e ricche rispetto a Foundry. Non assumere che i pattern Foundry abbiano uguale intensità su Roll20.
- **Fantasy Grounds recente:** la ricerca pubblica indicizzata è più scarsa; molte evidenze trovate sono tecniche o storiche.
- **Dadi e timer:** appaiono come utility attese, ma il campione non dimostra che siano problemi prioritari rispetto a note, riferimenti e spazio.
- **Import/export ArcanaScreen:** il valore è inferito dalla preferenza per dati locali, backup e portabilità; servono interviste per capire formati e frequenza d'uso.
- **Accessibilità:** sono emerse failure mode concrete, ma troppo poche fonti per stimare la frequenza.
- **Dati interni:** nessuna analytics, intervista, ticket di supporto o osservazione sul campo era disponibile.

## Limiti della ricerca

Questa è una scansione UX rapida di fonti pubbliche, non uno studio rappresentativo. Il corpus è prevalentemente anglofono, Reddit è sovrarappresentato e la community Foundry è più visibile e tecnica delle altre. I thread mostrano problemi e workaround memorabili, non la loro prevalenza sull'intera popolazione dei GM. Le fonti 2019–2022 sono state usate solo quando il pattern ricompare in fonti 2024–2026 o quando documentano un limite storico; non devono guidare da sole la roadmap. Non sono state svolte interviste, diary study, usability test o analisi di comportamento sull'attuale ArcanaScreen.

## Ipotesi da portare alla discovery qualitativa

1. Il successo di ArcanaScreen si misura meglio in **secondi risparmiati e continuità di attenzione** che nel numero di widget disponibili.
2. I GM preferiranno appuntare e collegare materiali esistenti invece di migrare l'intera campagna.
3. Un layout Run stabile e denso avrà più valore live di una personalizzazione continua.
4. La cattura live più usata sarà testo libero con timestamp; la strutturazione avverrà dopo.
5. Il sidecar stretto è un contesto primario, non una versione ridotta del desktop.
6. Le integrazioni più utili saranno inizialmente contestuali e in sola lettura, non un sync completo.
7. Fiducia nel salvataggio, undo e recovery influenzerà l'adozione più di funzionalità avanzate che possono fallire durante la sessione.

Queste ipotesi sono abbastanza supportate da meritare prototipi e interviste, ma non ancora abbastanza forti da diventare requisiti definitivi.
