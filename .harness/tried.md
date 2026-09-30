2026-09-25 D29 stato non solo colore: (a)+(b) aria su 10 siti, (c) 19/28 regole di stato solo-colore -> 5 vere corrette, 14 con segnale altrove, guardia stateCues.test.ts.
  Risultato: 147/147 unit, e2e axe verde su 3 progetti, guardia rossa sul CSS vecchio (5 siti), verde sul nuovo. Barra navy invisibile sul toggle Prepare/Run -> sottolineatura.
  Verdetto: keep. PR da fix/state-not-only-colour, merge all'utente.
2026-09-25 react-hooks 7: 7 errori veri in 5 file, corretti alla radice (idratazione in main.tsx, CSS @starting-style, lazy init, boundary per tool).
  Risultato: lint 0 errori con v7, 148/148 unit, e2e axe verde su 3 progetti; dissolvenza tour 0.44 -> 1 (prima mai animata: regola * fuori layer). Persistenza ok al reload.
  Verdetto: keep. PR da refactor/react-hooks-7 impilata sulla #114.
2026-09-25 D33 header: utility bar absolute (buco 5.5rem per 243px) + select min 11rem fuori dal wrapper min-w-0. Barra in griglia + picker min(11rem,100%).
  Risultato: sweep 390-1487 nome lungo/corto 0 sovrapposizioni (prima 2 a 390/768/800/1487); header invariato >1100, +46px <700. Scartati: flex-wrap globale (+58px a 1487), wrap <=1100 (resta 1487).
  Verdetto: keep. e2e @critical nuovo, rosso sul CSS vecchio. PR impilata su react-hooks 7.
2026-09-30 D27 Run sotto 820px: shell Run non più bloccato a 100dvh (scorre il documento, come spec e prototipo), stepper dadi flex-shrink 0, dock a capo.
  Risultato: controlli irraggiungibili 71 (desktop) / 79 (mobile) -> 0 su 4 Focus + editor x 390/768/820; axe 4.13 verde su 3 progetti, guardia mobile tolta. Emersi 2 colori dark sotto AA (D36).
  Verdetto: keep. Costo misurato: dock a 1842-2199px di scroll a 390 (D35).
2026-09-30 D35 dock al telefono: barra mini-player fissa (Roll+formula, risultato, tempo, Start, Tools), aperta max 45dvh con pannelli nel flusso.
  Risultato: scroll per Roll/Start a 390x844 da 1842-2199px a 0; barra 61px da 320 a 820, overflow 0. Scartati: dock intero fisso 285px, due righe ~115px.
  Verdetto: keep. e2e: Roll/Start in vista a inizio pagina + raggiungibilità a dock aperto. Lint 4 -> 0 warning sul percorso.
2026-09-30 D36 colori a mano: sonda axe su 9 stati mai scansionati x chiaro/scuro x desktop/mobile invece di tokenizzare 44 hex alla cieca.
  Risultato: 3 difetti veri (Oracle 1.44:1 dark, errore dadi 2.19:1 dark, notebook che scorre senza tab stop); dopo la fix 0 violazioni. Resto degli hex su navy o con override.
  Verdetto: keep. I 3 stati entrano nel test axe scuro (rosso sul vecchio). Sonda cancellata.
2026-09-30 D26 reflow: prova portata da 640 a 320px con ogni pannello dell'header aperto, in Prepare e Run.
  Risultato: Search fuori schermo di 144px sotto i 700 (fix: ancorato all'header); impostazioni di Help fuori di 42px a OGNI larghezza (fix: pannello min(18rem,100vw-2rem)); "Explorati/on" a 320 (fix: 13px sotto 380, 10px morto rimosso).
  Verdetto: keep. Test rosso sul CSS vecchio. Lezione: pkill nella stessa riga di vite preview uccide la shell.
2026-09-30 D28 editor combattente: reso nella lista sotto la riga toccata (disclosure aria-expanded) + scrollIntoView nearest per la lista che scorre.
  Risultato: distanza riga->editor da 68-587px a 12-44px, editor in vista a ogni larghezza (a 390 prima fuori schermo). Scartati: editor fisso in cima, solo auto-scroll.
  Verdetto: keep. e2e nuovo (551px sul vecchio). Mappa ridisegnata: leve da matrice partial e ledger.
2026-09-30 e2e ciclo di vita Screen: create/switch/Focus per screen/reload, rename/duplicate/delete/Undo/reload, Prepare/Run protetto e senza perdite.
  Risultato: verdi su 3 progetti; mutazione (Undo inefficace) presa. Trovato D37: ogni toast copriva il toggle Prepare/Run a 1280 (15s per l'Undo); spostati in basso sopra il dock.
  Verdetto: keep. Matrice 12 manual-pass / 5 partial / 5 green. Ricaduto nella trappola pkill+vite: store mutato ripristinato subito.
