# 2026-07-16 — WebKit e2e gate: root cause e verifica

## Contesto

Il gate WebKit non era mai stato eseguibile sul workstation Fedora (dipendenze di
sistema non installabili). Nel container Playwright falliva 8/9 con `element not
found`, documentato in ROADMAP come "bug reale cross-browser (Safari), workstream
aperto". Questo host (sandbox Ubuntu con sudo) ha permesso di installare WebKit
26.5 (`playwright webkit v2311`) ed eseguire il gate per la prima volta.

## Riproduzione

`npx playwright test --project=webkit-desktop` → **8 failed + 1 skipped**, tutti
in `createScreen` con `getByRole('heading', { name: 'Create a useful screen
first' })` non trovato. Identico al risultato container: bug reale, non flakiness.

## Root cause

Probe diretto (WebKit + `page.on('console')`) sulla preview `http://localhost:4173`:

```
[console.error] Failed to load resource: Error performing TLS handshake: An unexpected TLS packet was received.   (×6)
--- #root children: 0 ---
```

Le subresource venivano richieste come `https://localhost:4173/...` contro un
server HTTP puro. Causa: `upgrade-insecure-requests` nel meta CSP di
`index.html`. Chromium e Firefox esentano localhost dall'upgrade; **WebKit lo
applica anche a localhost**, quindi nessun asset JS si carica e l'app resta
bianca su qualunque host HTTP (preview locale, suite e2e, container CI).

## Fix

- Rimossa la direttiva dai meta CSP di `index.html` e `public/privacy.html`.
- Mantenuta in `public/_headers` (header di deploy, attivo solo dove il sito è
  servito su HTTPS con supporto custom headers).
- Verificato che nessuna risorsa è referenziata via `http://` (grep su src/,
  public/, index.html): su origin HTTPS tutti gli asset sono già HTTPS per
  costruzione, quindi la rimozione dal meta è un no-op di produzione.

## Verifica

- `npx playwright test --project=webkit-desktop`: **8 passed + 1 skipped** (lo
  skip è il test touch-target riservato al progetto mobile).
- `npm run test:e2e:critical` (matrice completa Chromium desktop/mobile,
  Firefox, WebKit): **33 passed + 3 skipped, 0 failed** — prima volta con il
  lane WebKit verde.
- `npm run test:ci`: build ok, lint 0 errori (4 warning preesistenti), 136/136
  Vitest, budget 119.0/130 KiB CSS.

## Non verificato

- Il lane WebKit nella CI GitHub (`Quality gate` con `--with-deps`): da
  confermare alla prossima PR/push. Safari reale (macOS/iOS) non testato
  direttamente; l'engine è lo stesso ma la conferma su device resta nel gate
  di accettazione prodotto.
- La prova Timer dopo sospensione lunga/background (seconda metà dell'item 2
  della Sequenza immediata) resta aperta.
