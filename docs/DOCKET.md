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
- D10 [2026-07-16] [decisione/ci] `.github/worklows/project-update.yml` (typo:
  "worklows") esiste dal commit di setup 342ae79 e NON è mai stato eseguito —
  GitHub legge solo `workflows/`. Automazione project-board su ogni push/PR:
  decidere se spostarla nella dir giusta (si attiverebbe di colpo) o eliminarla.
- D8b [2026-07-16] [merge] Mergiare PR #86 (bump react allineato 19.2.7) e poi
  CHIUDERE le PR dependabot #80 e #82 come superate (ciascuna da sola ha
  versioni react/react-dom disallineate e non potrà mai essere verde).
- D9 [2026-07-16] [decisione/ci] Raggruppare i pacchetti React in
  `.github/dependabot.yml` per impedire bump spezzati (yaml proposto nel corpo
  della PR #86): `groups: react: patterns ["react","react-dom","@types/react",
  "@types/react-dom"]`. File di automazione: ruling tuo, il loop non lo tocca.
- D8 [2026-07-16] [merge] Mergiare PR #85 (fix D2, input dark theme) — indipendente
  da #83/#84, merge in qualsiasi ordine. Nota: il lane WebKit della sua CI resta
  rosso finché #83 non è mergiata (l'app non carica in WebKit senza quel fix);
  evidenza full-matrix ottenuta su merge locale di integrazione (37+3, 0 failed).

## Chiusi

- D5 [2026-07-16 → 2026-07-16] [docs] Numeri budget in ROADMAP riconciliati con
  lo script (560 JS / 130 CSS, attuali 119.0 CSS / 191.8 max JS).

- D7 [2026-07-16 → 2026-07-16] [deps] Gate rosso PR dependabot react: root cause
  `react 19.2.7 vs react-dom 19.1.0` (dependabot ha spezzato il bump in #80/#82,
  ognuna incoerente da sola → tutte le 32 suite morivano all'import). Risolto con
  bump combinato su PR #86, 136/136 verdi.

- D2 [2026-07-16 → 2026-07-16] [bug/dark-theme] Input bianchi in dark theme:
  fix su PR #85 (`--as-surface-raised`), contrasto misurato a runtime 10.24:1
  (era ~1.35:1). Light theme pixel-identico.

- D6 [2026-07-16 → 2026-07-16] [ci] Lane WebKit nel `Quality gate` GitHub:
  verde su PR #83 (webkit-desktop pass, 1m54s, run 29521841731).
