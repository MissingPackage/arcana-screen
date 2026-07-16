# DOCKET — decisioni e residui (PI-gated)

Convenzione: una riga per item, `D<n> [data] [tipo]` — l'utente decide, il loop
non li assorbe. Quando Linear è raggiungibile, migrare gli item aperti.

## Aperti

- D1 [2026-07-16] [merge] Mergiare `test/webkit-e2e-gate` → `dev` (fix CSP
  WebKit, verifier PASS, evidenza in docs/verification/2026-07-16-webkit-gate.md).
  Il loop non merge-a per policy.
- D3 [2026-07-16] [design/decisione] Il DS definisce `color-scheme: light/dark`
  (colors.css); non adottato per non cambiare il rendering nativo di
  scrollbar/controlli. Decidere se adottarlo.
- D4 [2026-07-16] [design/coverage] Letterali non tokenizzati residui:
  session.css (famiglia `#314c64`/`#526779`, gold wash `#fff8e7/#fff8e8/#fffaf0`,
  cerchietti beat `#b98618`) e la sweep profonda di index.css (~2900 righe).
  Candidato per /pattern-coverage.
- D5 [2026-07-16] [docs] ROADMAP riga budget dice "560 KiB JS / 110 KiB CSS" ma
  lo script applica 130 KiB CSS (CLAUDE.md corretto). Riconciliare.
- D7 [2026-07-16] [deps] PR dependabot "bump react and @types/react" ha il
  Quality gate rosso (run 29520178703). Triage parziale 2026-07-16: fallisce il
  job `quality` (build/lint/unit), browser-matrix mai partita → rottura da bump
  react, NON il bug CSP WebKit. Resta da triage-are il log del job.
- D8 [2026-07-16] [merge] Mergiare PR #85 (fix D2, input dark theme) — indipendente
  da #83/#84, merge in qualsiasi ordine. Nota: il lane WebKit della sua CI resta
  rosso finché #83 non è mergiata (l'app non carica in WebKit senza quel fix);
  evidenza full-matrix ottenuta su merge locale di integrazione (37+3, 0 failed).

## Chiusi

- D2 [2026-07-16 → 2026-07-16] [bug/dark-theme] Input bianchi in dark theme:
  fix su PR #85 (`--as-surface-raised`), contrasto misurato a runtime 10.24:1
  (era ~1.35:1). Light theme pixel-identico.

- D6 [2026-07-16 → 2026-07-16] [ci] Lane WebKit nel `Quality gate` GitHub:
  verde su PR #83 (webkit-desktop pass, 1m54s, run 29521841731).
