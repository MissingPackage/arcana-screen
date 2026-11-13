# HANDOFF — ArcanaScreen   (aggiornato 2026-10-19, iterazione 39)

## 1. Next decidable

Loop attivo (`/loop /product-loop`, 5 minuti tra un'iterazione e l'altra) sulla
milestone **M3.5 Launch polish** di `ROADMAP.md`, in ordine LP1 → LP7. Direttiva
utente del 2026-10-19: niente lancio pubblico finché l'app sembra una demo;
aggiungere task e feature dove servono.

1. **PR #142** (design system v2): mergiarla quando i cinque job CI sono verdi
   e il loop-verifier ha dato PASS. Se un job axe è rosso, leggere la
   violazione: il v2 ha cambiato quasi tutti i colori.
2. **LP1 — gestione Screen in una modale**, con struttura dal prototipo
   Claude Design (`journeys.jsx`, `ScreenManagerModal` + `CreateScreenModal`) e
   card `ScreenCard` del v2. Conservare Undo, cartelle, tag e template
   personali, che il prototipo non ha. Gli e2e del ciclo di vita
   (iter. 30) devono restare verdi; aggiornarli se cambia solo il percorso.
3. Dependabot: #139 (react) dovrebbe tornare verde dopo D45, quindi aggiornarla
   su `dev`; #140 (tooling) porta violazioni axe nuove in entrambi i temi:
   probabile bump di axe-core (trattenuto in `dependabot.yml`, vedi D27).

## 2. State delta (questa sessione)

- Design system v2 creato in Claude Design:
  https://claude.ai/artifact/6DwWExjooRCY2Dk82cNsTX (Spectral, Instrument Sans,
  JetBrains Mono; carta osso piatta; griglia 4px; raggi 8/12/16).
- PR #142: v2 applicato a tutta l'app. `tokens.css` con valori v2 sui nomi
  `--as-*`; ~330 font-size e raggi letterali e ~120 colori portati sui token;
  texture rimosse. Budget CSS 130 → 140 KiB (D46).
- PR #141 mergiata: audit fix lockfile-only per `source-map-js` (D45).
- `ROADMAP.md`: nuova milestone M3.5 Launch polish (LP1–LP7).
- Canvas di riferimento sui token v1 (https://claude.ai/artifact/DP9gHn7xVG53ojYXTHKYjh):
  superato dal v2; LP7 lo rifà.

## 3. Open threads

- #142 in CI; #139 e #140 dependabot rosse (vedi sopra).
- Matrice di accettazione: *Screen create*, *Rename/delete*, *Theme* restano
  `partial` per la Design QA (LP7); *Accessibility/input* per l'audit moderato;
  *Release/rollback* per il deploy di produzione.

## 4. Landmines

- **Il checkout principale e il suo `dev` locale sono stantii**: leggere da un
  worktree allineato a `origin/dev`.
- **Firefox su questo host blocca axe dopo il reload** nel test dark (D47):
  identico su `dev`, verde in CI. Non toccare il test; la CI decide.
- **Host condiviso**: altre sessioni girano Playwright sulla stessa macchina,
  e unit ed e2e possono andare in timeout per contesa. Rilanciare una volta
  prima di giudicare.
- **Mai `pkill -f` con un pattern che compare nella riga di comando stessa**:
  uccide la shell (exit 144). Successo di nuovo il 2026-10-19.
- I browser Playwright 1.63 vanno installati su un host nuovo
  (`npx playwright install chromium firefox webkit`); la cache 1228 non basta.
- `test:ci` non è il gate CI: in CI girano anche `npm audit` e la matrice
  browser. Advisory nuove fanno diventare rosso `dev` senza modifiche (D21,
  D30, D31, D45).
- Lockfile: rigenerarlo con `npx npm@11 install`, poi verificare `npm ci`.
- Il webServer di Playwright serve `dist`: rifare `npm run build` dopo ogni
  modifica a CSS o TS.
- Le PR impilate si mergiano nel loro branch base, non in `dev`: non impilare.

## 5. Docket (decisioni dell'utente)

- **D16**: revoca dei secret orfani, incluso il PAT `TOKEN`.
- Deploy di produzione e lancio pubblico.
- Audit moderato di accessibilità con persone vere.

## Protocollo

Ogni iterazione: re-anchor da questo file + `docs/DOCKET.md` → una slice →
gate completi (`test:ci` + `test:e2e:critical`) → loop-verifier → merge su
`dev` → aggiornare questo file. Il loop mergia da solo alle condizioni di
`docs/DOCKET.md` ("Chi decide"): PR non impilata, aggiornata su `dev`, cinque
job CI verdi. Restano dell'utente: scope e obiettivo, secret, deploy di
produzione. I ruling tecnici li prende il loop e li mette a verbale nel docket.
