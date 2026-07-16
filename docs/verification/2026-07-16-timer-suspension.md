# 2026-07-16 — Timer: prova di sospensione lunga/background

## Contesto

ROADMAP M2.5 lasciava aperta una sola verifica: il comportamento del countdown
dopo una sospensione lunga del tab/dispositivo. Il modello
(`src/domain/timerModel.ts`) persiste `endAt` e ricalcola il residuo con
`ceil((endAt - now) / 1000)`; il dock (`UtilityDock.tsx`) fa tick ogni 250 ms —
durante una sospensione i tick non scattano, quindi solo l'aritmetica su
timestamp può mantenere il valore onesto.

## Metodo

Nuovo test `@critical timer stays truthful after a long background suspension`
in `e2e/critical-flows.spec.ts`, con il clock fittizio di Playwright:
`page.clock.fastForward` salta il tempo facendo scattare i timer al massimo una
volta — la semantica documentata è proprio "l'utente chiude il coperchio del
portatile e lo riapre più tardi".

Scenario: timer a 30:00 → 3 s di ticking live → sospensione di 12 minuti →
atteso ~17:5x → reload a timer attivo (endAt persistito) → sospensione di altri
20 minuti oltre la scadenza → atteso 00:00 esatto, mai negativo, controllo
tornato su "Start" (running azzerato).

## Esito

- Test verde su **chromium-desktop, chromium-mobile, firefox-desktop,
  webkit-desktop** (4/4).
- Matrice completa dopo l'aggiunta: **37 passed + 3 skip, 0 failed**.
- `npm run test:ci`: 136/136 Vitest, lint 0 errori, budget invariato
  (119.0/130 KiB CSS).

## Non verificato

- Sospensione reale del sistema operativo (sleep hardware) e throttling iOS
  Safari su device fisico: il clock fittizio modella la semantica dei timer
  sospesi, non il power management reale. Resta dentro il gate di accettazione
  prodotto su device reali (Sequenza immediata item 3).
