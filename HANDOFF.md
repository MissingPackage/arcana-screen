# HANDOFF — ArcanaScreen   (aggiornato 2026-11-13)

## 1. Obiettivo e distanza

Obiettivo: un DM prepara una sessione e la conduce al tavolo dallo stesso
Screen, senza perdere nulla.

Adesso: il percorso si spezza a metà. In Run funzionano combattimento, cattura
con `/`, dadi, timer, persistenza tra Focus e reload, export e import. Ma
quello che si scrive in Prepare non arriva in Run, e Run si apre su una
campagna finta ("The Festival of Ash") che non si può sostituire. Nessun DM
vero ha mai usato l'app. Nessun deploy è mai avvenuto.

Distanza: invariata dal 2026-07-13, quando è nata la doppia interfaccia. Da
allora il lavoro è andato in rifinitura, dipendenze e documenti.

Next: decidere la milestone (vedi Decisioni, punto 1). La review avversariale
del 2026-11-13 dice che la prossima leva è unire i due modelli di contenuto,
non rifinire. Testo completo: `docs/review/2026-11-13-adversarial-review.md`.

Stato del repo: `origin/dev` a `2fa39e2`, zero PR aperte. Gate su quella
testa: `test:ci` exit 0, 159/159 unit, CSS 132.0/140 KiB, audit high e
produzione puliti; i cinque job CI verdi sull'ultima PR mergiata.

## 2. Leve

### Aperte (il loop le può prendere da solo)

- **Tempesta di scritture tra finestre.** Con il presenter aperto: 728 eventi
  di storage in 3 secondi, e i cinque snapshot di recovery distano 28 ms.
  Guadagno: recovery che recupera, niente CPU bruciata col secondo schermo.
  Prova: lo stesso conteggio torna a 0 con due finestre ferme.
- **Import che blocca il workspace.** Un backup con `focusWorkspace`
  malformato passa la validazione e manda ogni ricarica sull'error boundary.
  Guadagno: un file condiviso non può più costare tutti gli Screen. Prova: quel
  backup viene rifiutato o riparato campo per campo, e l'error boundary offre
  il ripristino di uno snapshot.
- **Bottoni invisibili nella gestione Screen** (tema chiaro, 1,05:1).
  Prova: una scansione axe con il pannello aperto, verde.
- **Nome accessibile dei bottoni del Combat** (docket, "Tre bottoni del
  Combat"). Prova: axe 4.14 verde, poi togliere la riga da `dependabot.yml`.
- **Snapshot di recovery ai confini**, non a ogni tasto. Prova: dopo dieci
  tasti gli snapshot non sono i dieci tasti.
- **CI anche su `push` a `dev`, più un audit schedulato.** Oggi le advisory
  nuove si scoprono solo aprendo una PR. Prova: un run notturno rosso quando
  esce un'advisory high.
- **Permessi di `release.yml`**: `contents: write` solo al job che crea la
  release. Prova: il job che fa `npm ci` ha il token in sola lettura.
- **Piccoli difetti di Run**: note d'incontro scritte nel JSX, primo "Next
  Turn" che non fa nulla, danno solo a passi di 1 e 5.

### In corso

Nessuna. Il loop è fermo in attesa della decisione 1.

### Morte

- **Design QA contro i mockup a pergamena** (2026-11-13): la spec 01 ora
  descrive il design system v2 e i mockup no. Il riferimento non vale più.
- **Aggiornare axe alla 4.14 senza toccare l'app** (2026-11-13): 12 nodi in
  violazione per scansione su tutti e quattro i progetti.

## 3. Nebbia

- Dependabot ha chiuso la PR del gruppo tooling dopo le due hold. Se la
  ricrea con gli altri nove aggiornamenti si vede al prossimo giro settimanale.
- Il crash di Firefox con Playwright 1.65 in CI: causa non isolata.
- Service worker: aggiornamento e offline mai provati in un browser né su un
  dispositivo vero.
- Due schede aperte: i tasti persi sono plausibili, non misurati.
- Ogni giudizio di usabilità finora è di un agente.
- I numeri su italiano e costo del processo nella review sono dei revisori,
  non ricontati.

## 4. Decisioni per Cristiano

1. **Obiettivo: cambiare milestone.** Congelare Launch polish e mettere prima
   "Prepare scrive ciò che Run mostra": un solo modello di contenuto, Screen
   che nasce vuoto, campagna finta come template "Sample" a scelta. Con un
   "ok": il loop riparte da lì, primo passo il workspace vuoto; le parti di
   Launch polish che ridisegnano la griglia legacy e la sua Design QA vengono
   tolte, gestione Screen e header restano per dopo.
2. **Pubblico: una build privata per cinque DM veri**, prima di ogni
   rifinitura. Con un "ok": dopo il primo passo del punto 1 accendo GitHub
   Pages da `dev` senza annunciarlo e ti mando l'indirizzo; chi invitare e il
   canale di feedback restano tuoi.
3. **Irreversibile: i sette secret orfani.** Il PAT `TOKEN` lo puoi revocare
   solo tu, alla fonte. Con un "ok": cancello i sette secret dal repo e
   accendo private vulnerability reporting e alert Dependabot, che
   `SECURITY.md` promette e oggi sono spenti.

## 5. Mine

- **`dev` è verde su una regola che non viene controllata**: axe è trattenuto
  sotto la 4.14 finché i nomi dei bottoni del Combat non sono corretti.
- **Svuotare il workspace di default rompe i test**: una ventina di asserzioni
  in `RunWorkspace.test.tsx` e parte degli e2e si appoggiano alla campagna
  finta.
- **Cancellare codice vecchio più di 30 giorni** (griglia legacy,
  `ProfileManager`, cache npm sotto `.codex/`) va chiesto prima.
- Il checkout principale e il suo `dev` locale sono stantii: leggere da un
  worktree allineato a `origin/dev`.
- `test:ci` non è il gate CI: in CI girano anche `npm audit` e la matrice
  browser. Advisory nuove fanno diventare rosso `dev` senza modifiche.
- Firefox su questo host blocca axe dopo il reload nel test dark: verde in
  CI, non toccare il test.
- Playwright non è installato globale qui: caricarlo dal `node_modules` del
  repo. Il suo webServer serve `dist`: rifare `npm run build` dopo ogni
  modifica.
- Mai `pkill -f` con un pattern che compare nella riga di comando stessa:
  uccide la shell. Fermare i preview per PID.
- Lockfile: rigenerarlo con npm 11, poi verificare `npm ci` con npm 10.
- Le PR impilate si mergiano nel loro branch base, non in `dev`.

Protocollo del loop: re-anchor da questo file e da `docs/DOCKET.md`, una
slice, gate completi, merge su `dev` alle condizioni scritte nel docket sotto
"Chi decide".
