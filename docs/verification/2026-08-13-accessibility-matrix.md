# Verifica 2026-08-13 — riga *Accessibility/input* della matrice di accettazione

Scopo: produrre la prova di prima mano che promuove la colonna *Browser* della
riga *Accessibility/input* (§next-decidable 1 di `HANDOFF.md`). Non è una
citazione della CI: è una ri-esecuzione locale, perché una riga di matrice che
cita solo "verde in CI" non è riproducibile da chi legge.

Host: workstation Fedora (`Linux 7.1.8-200.fc44`), `dev` @ `e22c928`.

## Cosa è stato eseguito

| Gate | Comando | Esito |
| --- | --- | --- |
| Unit/lint/build/budget | `npm run test:ci` | **136/136**, lint 0 errori, CSS 119.6/130 KiB, max JS = chunk react 199.4/560 |
| Matrice `@critical` nativa | `npm run test:e2e:critical` | 31 passed + 2 skip su chromium-desktop, firefox-desktop, chromium-mobile; **11 failed su webkit-desktop** (vedi sotto) |
| Lane WebKit in container | `podman run --rm -v "$PWD":/work:Z -w /work --network host mcr.microsoft.com/playwright:v1.61.1-noble bash -c "npx playwright test --grep '@critical' --project=webkit-desktop"` | **10 passed + 1 skip, 0 failed** |
| Lane Firefox in container (controprova) | idem con `--project=firefox-desktop` | **10 passed + 1 skip, 0 failed** |

Totale matrice: **41 passed + 3 skip, 0 failed** — lo stesso numero che la CI
di GitHub riporta, ottenuto qui in locale.

Il test che porta la promozione è
`e2e/critical-flows.spec.ts:91` — *"@critical has no automatic WCAG 2.2 A/AA
violations in dark theme"*: **verde su tutte e quattro le lane** (webkit 7.5s
in container). Copre shell Prepare, i quattro Focus in Run e lo stato dopo
reload, con il tema attivato dal controllo di UI reale.

## Due trappole d'ambiente, entrambe misurate

**1. WebKit non parte su questo host.** `browserType.launch` fallisce con
*"Host system is missing dependencies"* (`libicu74`, `libjpeg-turbo8`,
`libwoff1`, `gstreamer1.0-libav` — nomi di pacchetto Debian, non risolvibili
con dnf). È un limite dell'host, non un difetto dell'app: le stesse 11 prove
passano nel container ufficiale. Il rimedio documentato del progetto — l'immagine
`mcr.microsoft.com/playwright:v1.61.1-noble` — funziona e va usato ogni volta
che si deve asserire qualcosa su Safari da Fedora.

**2. La matrice completa in un solo container dà falsi rossi.** Lanciando i
quattro progetti insieme nel container (44 prove, 11 worker su un solo server
`preview`) si ottengono **14 failed** sparsi su firefox, webkit e
chromium-mobile. Rilanciando **un progetto per volta** nello stesso container,
gli stessi test passano tutti. È contesa di risorse, non regressione: la
diagnosi è stata fatta prima di scrivere qualsiasi riga di matrice, ed è la
ragione per cui i numeri qui sopra vengono da run per-progetto. Chi rilancia la
matrice in container deve limitare i worker (`--workers=…`) o separare i
progetti, altrimenti legge un rosso che non esiste. → docket.

## I 3 skip non sono rumore

I 3 skip della matrice sono la stessa prova saltata su tre lane: il gate dei
**target tattili 44px** (`e2e/critical-flows.spec.ts:240`) porta
`test.skip(!testInfo.project.name.includes("mobile"))` ed è quindi misurato
**solo su chromium-mobile**. Delle tre prove citate dalla cella
*Accessibility/input* — tastiera, 200%, 44px — le prime due e le due scansioni
axe girano su tutte e quattro le lane, i 44px no. La prima stesura di questa
riga di matrice diceva "44px … on all four projects, WebKit included": era un
overclaim, intercettato dal loop-verifier e corretto prima del push.

## Cosa questa prova **non** dimostra

- Non copre l'**audit moderato con persone reali**: è l'unica cosa che tiene la
  riga a `partial`, e nessuna suite automatica la sostituisce.
- axe è un gate necessario, non sufficiente: non ispeziona il chrome nativo
  (scrollbar, caret, autofill) — limite già a verbale nel docket D3.
- `npm ci` è stato necessario prima dei gate: il `node_modules` locale
  precedeva l'adozione di Work Sans e il build falliva sulla risoluzione di
  `@fontsource/work-sans`. Un gate verde su un albero non reinstallato non
  sarebbe stato attendibile.
