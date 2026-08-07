# HANDOFF — ArcanaScreen

Aggiornato: 2026-08-07, riallineamento post-merge. Il loop era fermo by design
dal 2026-07-16 (it. 10) in attesa dei merge dell'utente: **i merge sono
avvenuti tutti**, e HANDOFF/DOCKET erano rimasti indietro di tre settimane.
Ruling `[decisione]`/`[design]`/`[ci]`/`[deps]` presi (D3, D9, D10). Il loop
riparte da **D13**.

## Stato corrente

- `origin/dev` @ `22bb1e2`. Contiene tutte le PR feature del ciclo precedente:
  #83 (fix CSP WebKit), #84 (prova Timer post-sospensione), #85 (input dark),
  #86 (react allineato 19.2.7), #87 (sweep session.css), #88 (toggle
  Prepare/Run dark), #89 (token shell header). Sopra ci sono solo bump
  dependabot di CI actions.
- Applicato il 2026-08-07: gruppo `react` in `.github/dependabot.yml` (D9) ed
  eliminazione di `.github/worklows/` (D10). Motivazioni per esteso nel docket.
- **Gate NON ri-verificati su questo `dev`.** L'ultima evidenza verde
  (`test:ci` 136/136, e2e 37+3 su tutta la matrice WebKit inclusa) è del
  2026-07-16 e precede i bump dependabot successivi. Prima di qualsiasi claim
  serve una passata fresca.
- Recidiva viva: #93/#94 (react/react-dom 19.2.8) sono di nuovo uno split bump
  rotto, entrambe `quality=FAILURE` → D14.

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
  `pkill vite` prima di diagnosticare.

## §next-decidable (in ordine)

1. **D13** — variante dark del test axe nella suite `@critical`. Sbloccata.
2. **D14** — bump combinato react/react-dom 19.2.8, poi chiudere #93/#94.
3. **D3** — adozione di `color-scheme` scoped, con la suite axe dark di D13
   come gate (quindi dopo D13).
4. **D15** — riesame di `docs/specs/acceptance-matrix.md`, stantia.
5. Ruling dell'utente ancora aperto: **D16** (revoca dei secret orfani, incluso
   il PAT `TOKEN`) — tocca credenziali, il loop non le tocca.

## Protocollo

Loop attivo: `/loop /product-loop` (self-paced). Ogni iterazione: re-anchor da
questo file + `docs/DOCKET.md` → una slice → gate completi → loop-verifier →
digest. **Merge su `dev` e cambi di scope: solo l'utente.** Tutti gli altri
ruling (design, ci, deps, decisioni tecniche): li prende il loop, li esegue e
li riporta a verbale nel docket — non si chiedono.
