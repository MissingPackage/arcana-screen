# DOCKET — decisioni e residui (PI-gated)

Convenzione: una riga per item, `D<n> [data] [tipo]` — l'utente decide, il loop
non li assorbe. Quando Linear è raggiungibile, migrare gli item aperti.

## Aperti

- D1 [2026-07-16] [merge] Mergiare `test/webkit-e2e-gate` → `dev` (fix CSP
  WebKit, verifier PASS, evidenza in docs/verification/2026-07-16-webkit-gate.md).
  Il loop non merge-a per policy.
- D2 [2026-07-16] [bug/dark-theme] Input con `background: #fff` fisso
  (`.initiative-input`, `.batch-init__rows input`, `.mint-npc-form input`,
  `.encounter-add__form input` in session.css) restano bianchi in dark theme con
  testo `--as-ink` pergamena → illeggibili. Trovato durante la token sweep, fuori
  scope della slice.
- D3 [2026-07-16] [design/decisione] Il DS definisce `color-scheme: light/dark`
  (colors.css); non adottato per non cambiare il rendering nativo di
  scrollbar/controlli. Decidere se adottarlo.
- D4 [2026-07-16] [design/coverage] Letterali non tokenizzati residui:
  session.css (famiglia `#314c64`/`#526779`, gold wash `#fff8e7/#fff8e8/#fffaf0`,
  cerchietti beat `#b98618`) e la sweep profonda di index.css (~2900 righe).
  Candidato per /pattern-coverage.
- D5 [2026-07-16] [docs] ROADMAP riga budget dice "560 KiB JS / 110 KiB CSS" ma
  lo script applica 130 KiB CSS (CLAUDE.md corretto). Riconciliare.
- D6 [2026-07-16] [ci] Confermare il lane WebKit nel workflow `Quality gate` su
  GitHub Actions al prossimo push/PR (next-decidable #2).

## Chiusi

(vuoto)
