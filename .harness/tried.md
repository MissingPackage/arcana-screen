2026-09-25 D29 stato non solo colore: (a)+(b) aria su 10 siti, (c) 19/28 regole di stato solo-colore -> 5 vere corrette, 14 con segnale altrove, guardia stateCues.test.ts.
  Risultato: 147/147 unit, e2e axe verde su 3 progetti, guardia rossa sul CSS vecchio (5 siti), verde sul nuovo. Barra navy invisibile sul toggle Prepare/Run -> sottolineatura.
  Verdetto: keep. PR da fix/state-not-only-colour, merge all'utente.
2026-09-25 react-hooks 7: 7 errori veri in 5 file, corretti alla radice (idratazione in main.tsx, CSS @starting-style, lazy init, boundary per tool).
  Risultato: lint 0 errori con v7, 148/148 unit, e2e axe verde su 3 progetti; dissolvenza tour 0.44 -> 1 (prima mai animata: regola * fuori layer). Persistenza ok al reload.
  Verdetto: keep. PR da refactor/react-hooks-7 impilata sulla #114.
2026-09-25 D33 header: utility bar absolute (buco 5.5rem per 243px) + select min 11rem fuori dal wrapper min-w-0. Barra in griglia + picker min(11rem,100%).
  Risultato: sweep 390-1487 nome lungo/corto 0 sovrapposizioni (prima 2 a 390/768/800/1487); header invariato >1100, +46px <700. Scartati: flex-wrap globale (+58px a 1487), wrap <=1100 (resta 1487).
  Verdetto: keep. e2e @critical nuovo, rosso sul CSS vecchio. PR impilata su react-hooks 7.
