# HANDOFF — ArcanaScreen

Aggiornato: 2026-09-30, iterazione 25 (landing di #115/#116, audit brace-expansion, D27 corretto con ruling dalla spec). Iterazione 24: D33 header. Iterazione 23: react-hooks 7, D34. Iterazione 22: D29 chiuso, PR in attesa di merge. Iterazione 21 (stabilizzazione su richiesta
dell'utente: tutte le PR aperte chiuse, gate di sicurezza sbloccato, toolchain
portata avanti, un falso allarme di salvataggio corretto). Iterazioni: 21
(D31/D32/D33), 20 (diagnosi D27), 19 (D27/D28/D29/D30, PR #104), 18 (D24/D25,
PR #101), 17 (D15), 16 (D21), 15 (D14), 14 (D3), 13 (D17), 12, 11 (D13).

## Stato corrente

- `origin/dev` @ `a028b84` (2026-09-30): contiene D29 (#114). **Le #115
  (react-hooks 7) e #116 (D33 header) risultano "merged" ma non sono su
  `dev`**: erano impilate e GitHub le ha mergiate nei loro branch base. Il
  contenuto (stessi 4 commit, stesso albero già revisionato) torna su `dev`
  con la PR di landing da `refactor/land-hooks7-and-header`.
- PR #118 (`fix/audit-brace-expansion`): `dev` era rosso su `check:security`
  per tre advisory high nuove su `brace-expansion` 1.1.18 (recidiva D21/D30).
  Diff di 3 righe nel lockfile, fatto a mano: npm 10 e 11 riscrivono ~140
  righe estranee.
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

## §next-decidable (in ordine)

Stato al 2026-09-30, dopo l'iterazione 25.

1. **D27 corretto**, branch `fix/run-scroll-below-820`, PR su `dev`. Il ruling
   l'ha preso il loop, ma dalla spec e dal prototipo, che scelgono già la
   colonna che scorre sotto gli 820px. Controlli irraggiungibili: 71 (chromium-desktop) e 79 (chromium-mobile) → 0 (e2e
   `@critical` nuovo). Axe sbloccato a 4.13. *Responsive* da `red` a `partial`.
   La PR contiene anche i commit del landing finché #119 non entra: punta a
   `dev`, non al branch del landing, quindi non c'è trappola d'impilamento.
2. **Landing** di react-hooks 7 + D33 e **#118** (audit): merge tuo. Sono
   indipendenti e non impilate, in qualsiasi ordine.
3. Prossime slice del loop: **D35** (Dice e Timer a 2 schermate di scroll sul
   telefono: riga compatta fissa in basso), **D36** (44 colori a mano in
   `session.css`, passata di copertura sul tema scuro), **D26** (reflow a
   320px), **D28** (editor ancorato alla riga).
4. Dependabot aperte: #113 (react-hot-toast 2.6.1), #117 (vitest 5.0.2).
5. Ancora tuo: **D16** (revoca dei secret orfani, incluso il PAT `TOKEN`).
6. e2e in container: leggere prima **D25**, un progetto per volta. L'immagine
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
  documentazione/protocollo fuori dal loop.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. **Merge su `dev` e cambi di scope: solo l'utente.** Tutti gli altri
ruling (design, ci, deps, decisioni tecniche): li prende il loop, li esegue e
li riporta a verbale nel docket — non si chiedono.
