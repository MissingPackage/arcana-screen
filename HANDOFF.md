# HANDOFF — ArcanaScreen

Aggiornato: 2026-09-25, iterazione 23 (react-hooks 7, D34; PR impilata). Iterazione 22: D29 chiuso, PR in attesa di merge. Iterazione 21 (stabilizzazione su richiesta
dell'utente: tutte le PR aperte chiuse, gate di sicurezza sbloccato, toolchain
portata avanti, un falso allarme di salvataggio corretto). Iterazioni: 21
(D31/D32/D33), 20 (diagnosi D27), 19 (D27/D28/D29/D30, PR #104), 18 (D24/D25,
PR #101), 17 (D15), 16 (D21), 15 (D14), 14 (D3), 13 (D17), 12, 11 (D13).

## Stato corrente

- `origin/dev` @ `ed4db34` (2026-09-25). **Zero PR aperte.** Mergiate il
  2026-09-25 su richiesta dell'utente: #101 (acceptance-matrix), #104 (toggle
  condizioni), #105 (zustand 5.0.15), #92/#91 (font 5.3.0), #110 (react 19.3),
  #96 (upload-pages-artifact v5), #112 (toolchain, sostituisce la #111 chiusa:
  vedi D31).
- Toolchain ora: Vite 8 (rolldown), Vitest 5, jsdom 30, Playwright 1.63,
  Tailwind 4.3, TypeScript 5.9, @types/node 26. Trattenuti con motivo in
  `.github/dependabot.yml`: eslint 9, typescript <6, react-hooks 5, axe 4.12.
- Gate su `dev` @ `ed4db34`: `test:ci` exit 0, **143/143** unit, lint 0 errori,
  budget ok (**CSS 120.6/130 KiB**, margine 9.4), `npm audit` 0
  vulnerabilità; e2e `@critical` verde su chromium-desktop, chromium-mobile e
  firefox-desktop in locale; WebKit verde solo in CI (PR #112, cinque job
  verdi).
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

Stato al 2026-09-25, dopo l'iterazione 21.

1. **D27 — serve ancora il tuo ruling di prodotto.** Sotto gli 820px il Run non
   ha un contenitore che scorre. La scelta: o il Run diventa una colonna che
   scorre, o resta viewport-locked e ogni pannello scorre al proprio interno.
   Ora costa anche il gate: axe 4.13 lo rileva, quindi axe resta a 4.12 finché
   non c'è la fix. La matrice di accettazione segna *Responsive* `red`.
2. **D29 fatto**, PR aperta dal branch `fix/state-not-only-colour` (in attesa
   del tuo merge). La prossima slice libera è il punto 4, react-hooks 7.
3. **D33 — header del Run a 390px**, "Search"/"Edit party" sopra lo switcher.
   Da diagnosticare insieme a D27 (stessa shell).
4. **react-hooks 7 fatto**, PR impilata su quella di D29 (branch
   `refactor/react-hooks-7`, in attesa del tuo merge). Emersi e corretti sul
   percorso: un tool che crasha ora resta confinato nel suo riquadro, e le
   transizioni Tailwind (dissolvenza del tour) non erano mai partite per una
   regola globale fuori layer.
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
