# ArcanaScreen — Design Review Loop (ledger)

**Avviato:** 2026-07-13 · **Modalità:** `/loop` autonomo (~10 min/iterazione)
**Owner umano:** Cristiano · **Esecutore:** Claude Code

> **Protocollo git (autorizzato dall'utente):** committare e pushare su `origin/dev` alla fine di OGNI iterazione. Messaggi conventional-commit, **nessuna attribuzione AI**. (Hook `.githooks/` non attivi.) Baseline committata a fine iter.9: `8bd1a5f` (impl. Codex Orizzonti 0-4), `0b0bb6a` (design unification + fix create-screen), `53efb49` (test), `890920d` (ledger). `screenshot-baseline.mjs` resta non committato (tool QA).

> Questo file è la fonte di verità del loop. Ad ogni iterazione: ri-ancorare da qui,
> non dalla memoria conversazione. Aggiornare la sezione "Iteration log" in fondo.

## Missione (dal /goal)

Codex ha implementato tecnicamente Orizzonti 0–4 ma: design percepito come pessimo,
fiducia sui test bassa, modello dell'app poco leggibile. Revisione completa; per ogni feature:

1. **Verificare che esista davvero** (non solo dichiarata nella roadmap/verification).
2. **Verificare che il design rispecchi la vision** (spec `docs/specs/01-shell-and-design.md` + mockup Codex in `.codex/product-design/horizon-0-prototype/reference/`).
3. **Modernizzare il design** in modo unico e coerente col design system.

Percorrere la roadmap passo-passo. Ad ogni feature terminata: **suite di test completa** +
giudizio di **un product designer** e **un Dungeon Master** (subagenti-persona).

## Design system target (da spec 01 + mockup)

- Header "command" navy profondo (`#061f36`) + dock utility inferiore navy.
- Piano contenuto "pergamena" calda con texture sottile.
- Oro tenue (`#D9B310` / `#f5cf72`) riservato SOLO a: posizione corrente, Focus attivo, azione live primaria.
- **Cinzel** per brand + heading di sezione; **Inter** per controlli e testo.
- Icone Phosphor outline (nessuna emoji/glifo improvvisato).
- Separatori sottili, raggi 8px, ombra minima, niente griglia di card annidate.
- Stato comunicato da testo/forma/posizione oltre che dal colore.
- Composizione Run = "cockpit": task live primario + contesto universale above-the-fold.

## Ground truth — iterazione 1 (2026-07-13)

Evidenza raccolta in prima persona (non fidandosi dei doc):

- ✅ **Test verdi**: `npm run test:ci` → build ok, lint ok, **20 file / 59 test passati**, budget JS 480.6/500 KiB, CSS 93.4/100 KiB. → "test mancanti" è percezione; il gap reale è *profondità* (59 unit/component + **1 solo** spec e2e `e2e/critical-flows.spec.ts` per 5 orizzonti).
- ✅ **Cinzel È caricato** (correzione di una mia ipotesi errata iniziale): `@fontsource/cinzel/latin-500|600` importato in `src/components/session/session.css:4-5`; `node_modules/@fontsource/cinzel` presente; bundle `dist/assets/cinzel-latin-500|600-normal.woff2` presenti. Self-hosted → CSP-safe. MA applicato SOLO dentro `.arcana-session h1,h2` (Run) + brand header. Prepare/`index.css` heading restano **Georgia**.
- ⚠️ **DUE design system coesistenti** (root cause reale di "design pessimo" + "non si capisce come funziona"):
  - **Run cockpit** = `src/components/session/session.css` → `.arcana-session` con token corretti (`--as-navy:#061f36`, `--as-gold:#e5ad32`, `--as-paper:#fbf7ee`, `--as-ink:#122b49`), Cinzel+Inter, Phosphor. **~80% fedele allo spec/mockup.** Questa è la parte BUONA di Codex.
  - **Shell + Prepare** = `src/index.css` (~2765 righe) → palette LEGACY diversa (`--deep-blue:#1C2541`, `--muted-gold:#D9B310`), heading Georgia, pergamena come PNG texture, vecchio `Grid`+`WidgetSidebar`+react-dnd (`App.tsx:139,200`). Solo `.arcana-header` fa da ponte al navy corretto.
  - Passare Prepare↔Run = whiplash visivo + due modelli mentali. Due oro (`#D9B310` vs `#e5ad32`), due navy, due font-stack.
- ⚠️ **Focus views mostrano lore hardcoded** (goblin/cripta/warden) invece dei dati dello Screen dell'utente → sembra una demo, non lo strumento del DM. (`RunWorkspace.tsx:96-141,315,402-405`).
- ⚠️ Spec "no emoji" **violato** in 5+ punti: `SidebarHeader.tsx:18` (⬅️➡️), `ProfileManager.tsx:44` (🗑️), `QuickNotes.tsx:142` (☐☑), `QuickReference.tsx:107` (★), `RunWorkspace.tsx:132` (✓).
- Icone Phosphor usate estensivamente in Run + header. ✓

### Mappa feature→componente (da agente Explore)

Tutte le feature roadmap ESISTONO (non stub). Componenti chiave:
- Screen lifecycle: `store/useScreenStore.ts` + `ScreenManager/ScreenManager.tsx`.
- Prepare/Run: `ScreenManager.tsx:184-195` + `App.tsx:192-206`.
- 4 Focus: `session/RunWorkspace.tsx` (`NarrativeView:159`, `SocialView:223`, `ExplorationView:272`, `CombatView:332`).
- Session Notebook / Quick Capture / Quick Reference: RunWorkspace + `session/QuickCaptureBar.tsx` + widget legacy in `widgets/`.
- Dice/Timer: `widgets/DiceRoller.tsx`, `widgets/CountdownTimer.tsx` → dock `session/UtilityDock.tsx`.
- Initiative Tracker: `widgets/InitiativeTracker.tsx` (hero Combat).
- Simple Table / Counter: `widgets/SimpleTable.tsx`, `widgets/Counter.tsx`.
- Export/import/recovery: `utils/dataPortability.ts`, `DataManager/DataManager.tsx`, `AppErrorBoundary.tsx`.
- PWA: `main.tsx:15-19` + `sw.js` hand-rolled (no vite-plugin-pwa).
- i18n EN/IT: ternari ad-hoc, gran parte del Run è **solo EN**.
- Temi/densità: `themeStore.ts` + `useEvolutionStore.ts`.
- Workspace search / personal templates / reference packs: `WorkspaceSearch.tsx`, `useEvolutionStore.ts`, `QuickReference.tsx:125`.

**Test blind spots (nessun component test):** WorkspaceSearch, DataManager UI import/export, EvolutionSettings, theme toggle, OnboardingTour, SimpleTable.
**Test buoni:** `RunWorkspace.test.tsx` (15 test, sostanziali), `M4Tools.test.tsx`, `useScreenStore.focus.test.ts`.

## Piano di lavoro (ordinato per roadmap)

Legenda stato: `[ ]` da fare · `[~]` in corso · `[x]` fatto+testato+giudicato

### VERDETTO VISIVO (baseline iter. 2, screenshot reali)
- **Run = BUONO, ~85-90% fedele ai mockup.** NON toccare la struttura (spec = fonte di verità; regola "prefer observed-working state"). Solo fix di fedeltà minori (P2):
  - Combat: icone combattenti tutte uno scudo generico (mockup: icone variate per creatura) → serve mappatura icone.
  - Pacing narrative ridotta a barrette vs cerchi numerati "1 Setup/2 Develop/3 Peak/4 Resolve" del mockup.
- **Prepare = PROBLEMA REALE.** Vecchio marketplace widget (sidebar "Widgets" con DRAG/Add/Favorite, card impilate, banner "Prepare layout"). Sembra un'app diversa/più vecchia. **Qui** sta il "design pessimo / non si capisce come funziona".
- Priorità corretta: **1) rifare Prepare nel linguaggio del Run** (massimo guadagno percepito); 2) dati reali nei Focus; 3) fix fedeltà Run P2; 4) test/i18n/emoji.

### Fondamenta design system (pre-requisito trasversale)
Direzione: **propagare il design system BUONO (`.arcana-session`/`session.css`) a tutta l'app**, ritirando la palette legacy di `index.css`. Non ridisegnare da zero: unificare.
- [ ] DS-1: Promuovere i token `--as-*` (navy `#061f36`, gold `#e5ad32`, paper `#fbf7ee`, ink `#122b49`) a token globali; allineare `index.css` (rimuovere/riconciliare `--deep-blue`/`--muted-gold`).
- [ ] DS-2: Applicare Cinzel + palette corretta a shell chrome + Prepare (heading di sezione, non solo Run/brand).
- [ ] DS-3: Sostituire le emoji con icone Phosphor (5+ punti) — spec "no emoji".
- [ ] DS-4: Decidere strategia Prepare: allineare visivamente il `Grid`/`WidgetSidebar` al design system O ripensare Prepare come configurazione della sessione (ridurre il whiplash a due modelli).

### Autenticità dati (PRIORITÀ 2)
- [ ] DATA-1: Focus views devono renderizzare i dati reali dello Screen dell'utente, non lore hardcoded (goblin/cripta). Rende l'app "strumento" e non "demo".

### Orizzonte 1 — Web foundation
- [ ] H1: verifica esistenza + fedeltà design di Screen lifecycle, Prepare/Run shell, responsive, tool platform, trust layer.

### Orizzonte 2 — Session-ready core (per-Focus, contro i 4 mockup)
- [ ] H2-combat: Initiative Tracker hero vs `selected-run-target.png`.
- [ ] H2-narrative: Session Notebook + beats/pacing vs `focus-narrative.png`.
- [ ] H2-social: vs `focus-social.png`.
- [ ] H2-exploration: vs `focus-exploration.png`.
- [ ] H2-tools: Dice Roller, Timer, Quick Capture, Quick Reference.

### Orizzonte 3 — Hardening
- [ ] H3: accessibilità, copertura test (approfondire e2e per Focus), privacy/CSP.

### Orizzonte 4 — Workspace evolution
- [ ] H4: layout avanzato, organizzazione, tool evolution, PWA/i18n/temi.

## Metodo QA per iterazione
1. Screenshot app reale (dev server :5174) alla viewport di riferimento, per Focus.
2. Confronto side-by-side col mockup; registrare mismatch P0–P3.
3. Fix P0/P1/P2.
4. `npm run test` (+ `test:e2e:critical` quando tocca flussi).
5. Giudizio product-designer (subagente) + Dungeon Master (subagente).
6. Aggiornare questo ledger.

## Iteration log

### 2026-07-14 — Stato reale (Playwright) + fix regressione WCAG
- Su richiesta utente: eseguito Playwright e2e reale (non solo `test:ci` unit). **Scoperta regressione WCAG mia:** il muted `#66758a` del re-skin è sotto 4.5:1 su pergamena (4.14–4.38) → **93 violazioni axe** su FirstRun/Prepare/Run. `test:ci` non la vedeva (gira solo unit). 
- **Fix:** `--ink-muted` + `--as-muted` → `#586678` (~5.2:1). Verificato: axe pulito su chromium-desktop/firefox-desktop/chromium-mobile. Commit `f1190d1`.
- **STATO REALE misurato (2026-07-14):**
  - Unit: **86/86 verdi** (`test:ci`: build+lint+budget ok, JS 528.9/560, CSS 96.3/110).
  - E2e Playwright: **25 passati** su chromium-desktop/firefox-desktop/chromium-mobile, **2 skip** intenzionali (touch-target solo mobile), **9 falliti = SOLO WebKit** che non si avvia su questa Fedora (vincolo host/CI, non codice).
  - Quindi il roadmap "axe green / e2e verde" era **aspirazionale/manual-pass**: axe era in realtà RED (regressione). Ora verde (non-WebKit). WebKit resta gate CI reale.
- Task loop: #1 stato reale = fatto. Prossimo: correggere ROADMAP con questi stati reali.

### Iterazione 14 — 2026-07-14 — Test: EvolutionSettings
- Aggiunto `src/components/EvolutionSettings.test.tsx` — **5 test**: cambio densità, cambio lingua + localizzazione label (it), cambio accent theme, aggiornamento colore custom (`fireEvent` su input color), nota "Cloud sync is off". Seed `useEvolutionStore`.
- **`test:ci` EXIT=0 → 25 file / 86 test** (era 81).
- **Copertura test: 59 → 86** in 5 iterazioni (SimpleTable, WorkspaceSearch, DataManager UI, icon resolver, EvolutionSettings). Blind spot rimasti ora solo minori: OnboardingTour, theme toggle.
- Commit+push su `origin/dev`.
- **Fine scope autonomo:** i 3 problemi originali sono affrontati a fondo. Il residuo di valore alto (Prepare→Run) resta gated sullo steer prodotto. Prossimo giro = ultimo blind spot minore, poi raccomando pausa/steer.

### Iterazione 13 — 2026-07-14 — Test del resolver icone per-entità
- Esportati `combatantIcon` + `NPC_ICONS` da `RunWorkspace.tsx`; nuovo `RunWorkspace.icons.test.ts` — **9 test**: mapping tipo→icona (undead→Skull prima di archer, spider→Bug, beast→PawPrint, caster→MagicWand, minion→Sword, elemental→Flame, ranged→Crosshair), fallback scudo per umanoidi/ignoti, NPC_ICONS distinte. Protegge la feature iter.12 da regressioni.
- **`test:ci` EXIT=0 → 24 file / 81 test** (era 72). Budget invariato (test non nel bundle).
- Commit+push su `origin/dev`.
- **Next (iter. 14):** progressi solidi su tutti e 3 i fronti (design/test/chiarezza). Residuo di alto valore ancora gated sullo steer prodotto Prepare→Run. Opzioni budget-safe: altri test (EvolutionSettings/theme) o rifiniture design minori. Considerare se il loop è a un punto di chiusura naturale.

### Iterazione 12 — 2026-07-14 — Icone per-entità (P0-2) + budget alzato (su richiesta utente)
- **Budget alzato** (autorizzato): `scripts/check-performance-budget.mjs` JS 500→560 KiB, CSS 100→110 KiB.
- **Icone per-entità** (`RunWorkspace.tsx`): resolver keyword→icona Phosphor per i combattenti (`combatantIcon`: spider→Bug, undead→Skull, wolf/beast→PawPrint, caster→MagicWand, archer→Crosshair, dragon→Flame, goblin/minion→Sword, default→ShieldChevron) e set di icone-persona variate per indice per gli NPC (`NPC_ICONS`, no ritratti disponibili). Sostituisce lo scudo/avatar identico segnalato da entrambi i giudici.
- **Verificato a schermo:** Combat 7 combattenti con icone distinte coerenti col tipo; Social 3 NPC con icone diverse. Run per il resto invariato.
- **`test:ci` EXIT=0** (72 test). **JS 528.9/560** (+30 per le icone Phosphor), CSS 96.3/110.
- Fix in corso: `Spider` non esiste in questa versione Phosphor → `Bug`; `combatant.detail` opzionale → param `detail?`.
- Commit+push su `origin/dev`.
- **Next (iter. 13):** con margine budget ripristinato, altre win design possibili (list-row icons, Social table); o test residui; o steer prodotto Prepare→Run.

### Iterazione 11 — 2026-07-13 — Fedeltà Run: pacing stepper Narrative (designer P1)
- Sostituito il generico `clockSegments` del pacing narrativo con uno **stepper etichettato** Setup/Develop/Peak/Resolve (cerchi numerati, corrente oro, precedenti done) + caption "You're in X" — fedele a `focus-narrative.png`. File: `session/RunWorkspace.tsx` (nuovo `PACING_PHASES`/`pacingPhase`), `session/session.css` (`.pacing-stepper` + varianti dark). Scoping: nomi classe unici a Run; `clockSegments` resta per i clock numerici Social/Exploration (N/8, N/5 già comunicano il valore).
- **Verificato a schermo:** stepper identico al mockup; resto del Run invariato. **`test:ci` EXIT=0** (72 test). ⚠️ **JS 498.7/500** (margine 1.3 KiB), CSS 96.3/100 — budget sempre più stretto.
- Prima modifica al Run finora tenuto intatto; giustificata da gap di fedeltà vs mockup approvato (fonte di verità) segnalato dai giudici.
- Commit+push su `origin/dev`.
- **Next (iter. 12):** budget quasi saturo → le prossime win design (icone per-entità) rischiano sforo: valutare code-splitting/dynamic import o alzare il limite (decisione Cristiano). Alternative senza rischio budget: ultimi test blind spot minori, o attendere steer prodotto per Prepare→Run.

### Iterazione 10 — 2026-07-13 — Profondità test: DataManager UI (trust-layer)
- Aggiunto `src/components/DataManager/DataManager.test.tsx` — **4 test**: open/close dialog; backup incollato invalido rifiutato (alert, nessun import); preview + confirm import valido (import solo dopo conferma, verificato su `useScreenStore`); reset a due step. Riuso fixture backup dal test util. Nota: `userEvent.type` interpreta `{`/`[` → uso `user.paste` per il JSON.
- **`test:ci` EXIT=0 → 23 file / 72 test** (era 68). Budget invariato.
- Copertura: 59 → 64 → 68 → **72** (SimpleTable, WorkspaceSearch, DataManager UI). Blind spot rimasti: EvolutionSettings, OnboardingTour, theme toggle (minori).
- Commit+push su `origin/dev` (protocollo per-iterazione).
- **Next (iter. 11):** valutare checkpoint — design + test in buona forma; il grosso residuo è la chiarezza concettuale Prepare→Run (DM #1) che richiede il tuo steer di prodotto (CA / roster / demo-vs-vuoto). Se nessuno steer, coprire gli ultimi blind spot minori o rifinire.

### Iterazione 9 — 2026-07-13 — Chiarezza Prepare: tooltip controlli (DM #2)
- Aggiunti `title` esplicativi (accurati al comportamento) a 8 controlli opachi: `ToolFrame.tsx` (Focus/Sidecar/Pop out/Configure), `Grid.tsx` (Grid/Canvas/Second monitor/Undo layout). Attacca "non si capisce come funziona" senza steer prodotto.
- **`test:ci` EXIT=0** (68 test). ⚠️ **JS 498.2/500 KiB** (era 497.7) — margine 1.8 KiB, budget ora vincolo stringente: ulteriori aggiunte JS/stringhe da pesare (o alzare il limite = decisione Cristiano).
- Nota: tooltip in EN (Prepare è EN-only nel codice legacy; i18n completa di Prepare è task separato più grande).
- **Next (iter. 10):** test DataManager import/export UI (critico trust-layer, budget-safe perché test). + valutare **commit** del blocco accumulato (9 iterazioni, tutto verde, non committato).

### Iterazione 8 — 2026-07-13 — Profondità test: WorkspaceSearch
- Aggiunto `src/components/WorkspaceSearch.test.tsx` — **4 test**: gate min-2-char, nessun match, match sui widget dello screen attivo (con excerpt), click risultato → `openScreen(id)` (spy). Seed via `useScreenStore.createScreen` + `useWidgetStore` + `createToolInstance('quick-notes')`.
- **`test:ci` EXIT=0 → 22 file / 68 test** (era 64). Budget invariato.
- Progresso copertura: 59 → 64 (SimpleTable) → 68 (WorkspaceSearch). Blind spot rimasti: DataManager import/export UI, EvolutionSettings, OnboardingTour, theme toggle.
- **Next (iter. 9):** clarity Prepare senza steer prodotto (DM #2): tooltip/spiegazioni sui controlli opachi (Focus/Sidecar/Pop out/Configure, Grid/Canvas/Second monitor) → attacca "non si capisce come funziona". Poi eventualmente altri test (DataManager UI).

### Iterazione 7 — 2026-07-13 — Profondità test: SimpleTable ("mancano i test")
- Aggiunto `src/components/widgets/SimpleTable.test.tsx` — **5 test** su SimpleTable (450 righe, prima 0 test): add riga; add colonna con backfill chiavi; remove colonna con pulizia dati dalle righe; applicazione template (initiative); filtro righe per query. Pattern: seed `useWidgetStore` + Testing Library con aria-label esistenti + `DndProvider/HTML5Backend` (il componente usa react-dnd).
- **`test:ci` EXIT=0 → 21 file / 64 test** (era 59), budget invariato (i test non entrano nel bundle).
- Nota: vitest transpila senza type-check; `test:ci` (che gira `tsc -b`) ha catturato errori di tipo (`columns/rows` opzionali) → corretti con `?? []`. Confermato: girare sempre `test:ci`, non solo `vitest`.
- **Blind spot ancora scoperti:** DataManager import/export UI (util già testato), WorkspaceSearch, EvolutionSettings, OnboardingTour, theme toggle.
- **Next (iter. 8):** continuare copertura — WorkspaceSearch (piccolo, coprib. intero) e/o DataManager UI (critico, trust layer). Poi checkpoint su chiarezza Prepare→Run (serve steer prodotto).

### Iterazione 6 — 2026-07-13 — Closeout coerenza + BUG create-screen risolto
- **Coerenza design (dropdown "Manage/New screen"):** ombra pesante `0 16px 40px` → morbida `0 12px 30px rgba(18,43,73,.16)`; `.screen-template--selected` vecchio-oro `rgba(217,179,16)` → token `color-mix(--muted-gold 14%)`; titolo pannello `.screen-manager__panel-title` → **Cinzel**. (Le 8 occorrenze `#556171` ≈ `--ink-muted`: delta impercettibile, non toccate. Modali data-manager/first-run: ombre forti legittime da overlay.)
- **BUG REALE scoperto + risolto** (non causato da me — i miei edit non toccano layout): il pannello "Create a screen" era **completamente rotto** (radio come cerchi 135×165px, nomi verticali una-lettera-per-riga, card alta 1702px). 
  - Diagnosi con misure reali (Playwright computed-style, non a intuito): (1) il radio è grid-item con `align-items:stretch` di default → riempiva la cella; (2) i figli extra `.screen-template__outcome/__tools` senza `grid-column` finivano in col1 (auto) gonfiandola e schiacciando il testo a 12px.
  - Fix: `.screen-template input { width:1rem; height:1rem; align-self/justify-self:start; flex:none }` + `grid-column:2` su `__name`/`__outcome`/`__tools`. Ora colonne `16px 131px`, card 336px, testo orizzontale leggibile. Beneficia anche FirstRun (stesso `.screen-template`).
- **`test:ci` EXIT=0** (build, lint, 59 test, CSS 95.2/100, JS 497.7/500).
- **Next (iter. 7):** profondità test (blind spot: WorkspaceSearch/DataManager UI/SimpleTable) — attacca la lamentela "mancano i test". Poi chiarezza Prepare→Run (serve steer prodotto).

### Iterazione 5 — 2026-07-13 — Widget-card single-piece (designer #1)
- **Fatto:** unificata la widget-card di Prepare in **un'unica card** (prima: `.tool-chrome` bordata + `.surface` bordata con gap). `.widget-frame` ora è la card (bg `--surface`, bordo, radius 10px, `overflow:hidden`, `gap:0`); `.tool-chrome` = header band a filo con `border-bottom` divisore; `.tool-body > .surface` reso trasparente/senza bordo. **Scoping sicuro:** `.widget-frame/.tool-chrome/.tool-body` esistono solo in Prepare/popout → Run e gli altri `.surface` (FirstRun/DataManager/ProfileManager/workspace-empty) intatti.
- **Fix sidebar:** "Countdown Timer" non si spezza più mid-word (icona alleggerita 1.6→1.1rem senza cerchio bordato, nome 0.82rem) → wrap tra-parole pulito. Verificato a schermo.
- **`test:ci` EXIT=0** (build, lint, 59 test, budget CSS 94.9/100, JS 497.7/500 invariato).
- Prepare ora legge come superficie coerente/calma, non più "marketplace". **Coerenza visiva Prepare↔Run: sostanzialmente completa.**
- **Checkpoint:** thread "design pessimo" per i pezzi grossi = fatto. Restano: (design) dropdown "Manage screens" ancora white-card + P0-3 colori off-palette + P0-2 icone per-entità (budget!); (test) blind spots WorkspaceSearch/DataManager UI/SimpleTable/EvolutionSettings; (chiarezza/DM) legame Prepare→Run + tooltip controlli.
- **Next (iter. 6):** closeout coerenza design — restyle dropdown "Manage screens" (`.screen-manager__panel/__template/__list`) + P0-3 colori. Poi iter.7 = profondità test; iter.8 = chiarezza Prepare→Run (serve steer prodotto).

### Iterazione 4 — 2026-07-13 — Fix regressioni re-skin + sintesi giudizi
- **Giudizio designer sul re-skin:** "due prodotti" *quasi* risolto (chrome/sidebar/tipografia ok). Ma segnala 3 regressioni + il prossimo #1:
  - REG-1 nomi widget troncati ("Session…") — **fixato**: `.widget-item__name` ora va a capo (`break-word`) + gap ridotto. Verificato a schermo (nomi completi).
  - REG-2 aria-label bottoni icona — **verificato già presenti** (Add/Favorite hanno label+aria-pressed). Nessun fix necessario.
  - REG-3 input dark basso contrasto (navy-on-navy) — **fixato**: `--input-bg-dark` `#061f36`→`#123957` (light intatto, usa `#ffffff`). Deterministico.
  - Designer **#1 successivo**: unificare widget-card in **pezzo unico** (ora chrome-strip + body separati) — ultimo grande tell strutturale; tocca `.surface` (condiviso FirstRun/DataManager) → attenzione.
- **`npm test` verde (59)** dopo i fix.
- **Sintesi priorità (designer+DM):**
  1. (Designer) widget-card single-piece — completa la coerenza visiva.
  2. (DM) chiarezza **Prepare→Run**: etichettare i widget per tab Focus + tooltip/rinominare Focus/Sidecar/Pop-out con cosa fanno. Risolve il residuo "non si capisce come funziona" (più UX che CSS).
  3. Cosmetici: P0-2 icone per-entità (budget!), P0-3 colori off-palette.
- **Next (iter. 5):** widget-card single-piece (designer #1), con QA before/after + attenzione a `.surface` condiviso.

### Iterazione 3 — 2026-07-13 — Inizio re-skin Prepare (P0-1)
- **P0-1a token unification (fatto, verde):** `index.css :root` → palette session (`--deep-blue #061f36`, `--muted-gold #e5ad32`, `--parchment-white/--background-light #fbf7ee`, `--background-dark #061f36`); heading `h1,h2`/`.font-title` → `'Cinzel', Georgia, serif`. `npm test` = 20 file/59 test verdi. Run confermato **invariato** (screenshot before/after identici — `.arcana-session` è indipendente).
- **Onesto:** il token-swap da solo è **insufficiente** — le superfici Prepare sono card bianche hardcoded (`--input-bg-light:#ffffff`), non usano il token pergamena; i titoli tipo "Add combatant" non sono h1/h2. Bruttezza di Prepare = **strutturale**. Notato bug: bottoni sidebar spezzano parole ("Ad d", "Fav orite").
- **P0-1b/c delegato** al designer (agente, background) con auto-QA a screenshot: restyle superfici Prepare (pannelli pergamena, thin lines, Cinzel headers, gold solo per primarie), fix sidebar/bottoni/DRAG→icona Phosphor. Ownership: `index.css` + `WidgetSidebar/*` + `ToolFrame.tsx` + `Grid.tsx`. Vietato toccare `session/*`.
- **RISULTATO (verificato):** designer ha ristilizzato Prepare → pannelli pergamena piatti, Cinzel maiuscoletto sui titoli, oro solo su attivo, sidebar con drag-handle + icone Phosphor (`Plus`/`Star`/`DotsSixVertical`, no più wrap "Ad d"/"Fav orite"), emoji ⬅️➡️ → Phosphor, rimosso `shadow-lg` in SimpleTable, fix bug dark-mode (bottoni invisibili). File: `index.css`, `WidgetSidebar/SidebarHeader.tsx`, `WidgetSidebar/WidgetItem.tsx`, `ToolFrame.tsx`, `widgets/SimpleTable.tsx`. **`test:ci` EXIT=0** (20/59, build+lint verdi). Prepare↔Run whiplash quasi risolto. Verificato con screenshot light+dark.
- ⚠️ **Budget JS 497.7/500 KiB** (era 480.6): icone Phosphor l'hanno saturato. P0-2 rischia sforo → riusare icone importate o alzare limite (decisione Cristiano).
- **Follow-up strutturali** (designer, fuori scope CSS): (a) widget card ancora in 2 pezzi (chrome + body separati) — merge tocca `.surface` condiviso con FirstRun/DataManager; (b) dropdown "Manage screens" (`.screen-manager__panel/__template/__list`) ancora white-card vecchio stile.
- **Giudizio DM sul re-skin:** "stesso prodotto? quasi". Estetica ok, ma nodo profondo = **legame Prepare→Run invisibile**: in Prepare c'è gergo widget/Grid/Canvas/Sidecar/Pop-out; le tab Focus esistono solo in Run → non capisci che stai costruendo lo schermo che userai. Top-2 DM: (1) mostrare mappatura Prepare→Run (preview o etichettare i widget per tab Focus); (2) rinominare/tooltip dei controlli (Focus/Sidecar/Pop out) con cosa fanno al tavolo.
  - → Questo è **più importante** dei cosmetici P0-2/P0-3 per risolvere "non si capisce come funziona". Candidato priorità iter.4 (in attesa giudizio designer).
- **Next (iter. 4):** sintetizzare designer+DM; probabile focus = chiarezza Prepare→Run (etichette Focus sui widget + tooltip controlli) invece dei soli cosmetici. Poi P0-2 icone per-entità (budget!), P0-3 colori.



### Iterazione 1 — 2026-07-13 — Understand & plan
- Letto: ROADMAP, audit, spec 00/01, verification M4, mockup Combat+Narrative.
- Ground truth: `test:ci` VERDE (20 file/59 test, build/lint/budget ok).
- **Correzione:** Cinzel È caricato (via `@fontsource` in `session.css`, bundle ok) — mia ipotesi iniziale "non caricato" era falsa (avevo letto solo index.css/html).
- Root cause reale confermata: **DUE design system** (session=buono in Run; index.css=legacy in shell/Prepare) + Focus con lore hardcoded + 5 violazioni emoji.
- Agente Explore: mappa feature completa (tutte esistono), test blind spots identificati.
- Avviato dev server :5174 (Chromium Playwright presente). Creato+aggiornato questo ledger.
- **Next (iter. 2):** costruire harness screenshot con stato seeded → baseline visiva reale (Run 4 Focus + Prepare) come prova "prima" e base della QA. Poi iniziare DS-1/DS-2 (unificazione design system).

### Iterazione 2 — 2026-07-13 — Baseline visiva + giudizio esperti
- Harness screenshot: `arcana-screen/screenshot-baseline.mjs` (pilota FirstRun→Run→Focus via Playwright, viewport 1487×1058). Output in `scratchpad/shots/`.
- Catturati + **visti**: Prepare, Run default, Run×4 Focus.
- **Verdetto (vedi sopra):** Run buono/fedele; **Prepare è il vero problema** (marketplace widget legacy). Corretta la priorità: Prepare-redesign prima di tutto.
- Giudici completati (designer + DM). Verificato col codice: editor HP live in Run ESISTE (`RunWorkspace.tsx:395`, click combattente); CA assente dal modello.
- **Next (iter. 3):** eseguire il backlog sotto, partendo da P0-1 (re-skin Prepare) con QA before/after.

## Backlog prioritizzato (da giudizi esperti + verifica codice)

**P0 — incoerenza/rotto**
- P0-1 **Re-skin Prepare nel design system del Run** (entrambi i giudici = #1). Sotto-step: (a) unificare token in `index.css` → palette session (navy `#061f36`, gold `#e5ad32`, paper `#fbf7ee`); (b) ristilizzare sidebar "Widgets", card widget e form con pannelli pergamena / azioni oro / heading Cinzel; (c) rimuovere la 2ª riga header (`Manage screens`/`New screen`) → in overflow.
- P0-2 **Icone per-entità.** Combat: tutti `ShieldChevron` hardcoded (`RunWorkspace.tsx:384`); Social: tutti stesso avatar. Mappare tipo/nome → icona Phosphor (mockup ha icone distinte per riga).
- P0-3 **Colori off-palette.** Verde "Saved locally", rosso "Reset encounter" → trattamento oro/ink/neutro (spec: oro unico accento).

**P1 — maggiore**
- P1-1 Ripristinare pacing/clock **etichettati** (cerchi numerati Setup/Develop/Peak/Resolve + caption) in Narrative/Social/Exploration — ora barrette generiche.
- P1-2 Header: menu overflow `⋮` (ora `?`); ripristinare label testuale "Layout protected".
- P1-3 Social: lista NPC come **tabella** (Attitude/Motive/Secret), non card impilate.
- P1-4 Icone di riga (Notebook outline, Location cues, Session flow) — ora solo testo.
- P1-5 **Scopribilità editor HP** in Combat: l'editor esiste ma non ha affordance visibile → aggiungere segnale "clicca per gestire".

**P2 — polish:** source citation + pin + timestamp (Narrative); dock extra links; caption sotto le tab Focus; verificare che la tab-strip Combat non spinga sotto la fold.

**Decisioni di prodotto (per Cristiano, non unilaterali):**
- CA nel modello combat (assente) — aggiungere?
- Roster PG riutilizzabile (feature nuova, molto richiesta dal DM).
- Autenticità dati: i Focus mostrano lore hardcoded (es. `RunWorkspace.tsx:404` encounter notes) invece dei dati utente; + "start vuoto vs demo".
- Debito: logica combat duplicata (`domain/encounterModel` id-string in Run vs `widgets/InitiativeTracker.tsx` id-numerico in Prepare).

---

## Loop forward-roadmap — Orizzonte A (2026-07-14)

Ri-ancorato da `docs/roadmap/2026-07-14-forward-roadmap.md` (build-steps in quel doc, con stato ✅ per step). Le decisioni di prodotto qui sopra sono state **risolte**: CA nel modello combat = **fatta** (4a); roster PG riutilizzabile = **fatto** (party store + PartySetup + roster-picker, step 1–3b, 4b).

### Iter. 4c — Tracker polish + giudizio designer/DM — commit `83995e8` + `ae29995`
- **Fatto:** editing INIT in-place (click sul numero → input → auto-resort), CA sempre presente (dash "—" se assente), hint scopribilità editor HP. 2 test componente + suite `test:ci` **107 verdi**; verifica browser (container/chromium) + **axe 0 violazioni** sulla superficie Combat.
- **Giudizio designer (P0):** l'affordance di editing era invisibile al tocco (solo hover). **Risolto:** il numero è un bottone con **sottolineatura tratteggiata + glifo matita**, target ≥30px (WCAG 2.5.8), solido su hover/focus. P1 crowding CA↔HP **risolto** (`margin-right`). P2 hint verboso → rinviato.
- **Giudizio DM (2×P0):** (1) i PG aggiunti dal roster cadevano a init 0 indistinguibile da un 0 tirato → **risolto** con flag `initiativeUnset` + render "—" + test. (2) manca un flusso di **inserimento batch** delle iniziative a inizio round → aperto come **step 4d** (Tab-to-next / "enter all, sort once"). P1 tie non visibili/modificabili → 4d. P2 CA utile, accettato.
- **Next (iter. 4d):** batch initiative entry + visibilità/override dei tie, poi step 5 (superficie party non-combat: badge→overlay in Narrative/Social/Exploration, con passive Insight/Perception in Social).
- **Aperti (invariati):** ritiro del boundary Prepare/Run (deciso); triage compat WebKit (8/9 critical falliti in WebKit); HP modificati nel tracker non riscrivono sull'Entità roster.

### Iter. 4d — Batch initiative entry + giudizio designer/DM — commit `fc891f9` + `9a1fbf4`
- **Fatto:** pannello "Set initiative" che apre un form con un campo per combattente; la lista NON si riordina mentre digiti; "Apply order" (o Invio) applica tutto e ordina una volta sola; Tab campo→campo; edit inline per-riga mantenuto per i one-off. `test:ci` **108 verdi**; browser+axe 0 violazioni.
- **Giudizio designer (2×P0):** (1) il form impilato sotto la lista ne schiacciava il viewport → riga tagliata a metà: **risolto** facendo **swap-in** (il form sostituisce la lista). (2) niente autofocus → **risolto** (focus+select sul primo campo all'apertura; corretto anche un callback-ref su input controllato che rubava il focus a ogni tasto). P1 ordine di lettura riga-per-riga → **column-major** (verticale, come la lista). P2 toggle sotto-pesato → **oro quando qualcuno è senza iniziativa**.
- **Giudizio DM (P0 grosso, ri-orienta il track):** in Run mode **non c'è modo di aggiungere un mostro/PNG all'incontro** — l'unica via è il roster (solo PG); i mostri della demo sono fixture hardcoded; il form add legacy scrive su uno store scollegato. Il batch/inline lucidano una lista che non puoi costruire. → **nuovo step 4e** (form add-combattente in Run su `encounterModel`; poi mostri raggruppati/quantità). P1 tie ancora aperto. P1 "init PG pre-riempita dal modificatore sembra un tiro" → **decisione aperta** per Cristiano (non la ribalto: tocca `combatantFromMember` + 3 test + decisione step 4b).
- **Next (iter. 4e):** on-ramp add-mostro in Run mode, poi tie, poi step 5.

### Iter. 4e — On-ramp add-combattente + polish — commit `a273716` + `987621e`
- **Fatto:** toggle "＋ Add combatant" sotto il tracker → form inline (nome + CA/HP/Init opz. + quantità "×N"); "Add" costruisce i combattenti via nuovo factory `createCombatant` in `encounterModel` (init omessa → "—"; HP → 10; id free-string, duplicati ok) + `addCombatant`; qty>1 auto-nomina "Goblin 1..N". `test:ci` **113 verdi**; browser+axe 0 violazioni.
- **Giudizio designer (2×P0):** (1) campi solo-placeholder → il valore perde significato una volta digitato: **risolto** con **etichette persistenti AC/HP/Init/Qty**. (2) toggle **tratteggiato** confligge col motivo "tratteggiato = valore mancante": **risolto** → bordo **solido** (+ target 40px). P1 posizione (drift sotto la lista → header) e wrap: header **rinviato**; wrap risolto raggruppando label+input.
- **Giudizio DM (P1 grossi):** (1) si può aggiungere ma **non rimuovere** un combattente (solo Undo singolo o Reset totale) → **risolto** con `removeCombatant` + pulsante Remove (rosso) nell'editor live. (2) il form si **richiudeva a ogni Add** → ora **resta aperto** con nota "Added X" (voce anche per il feedback dell'add silenzioso). **Rinviati:** clone/duplica (P1), riga **grouped/minion** con pool condiviso (P2), auto-scroll all'add (P2). *Nailed:* aggiungi-poi-tira-in-batch rispecchia il flusso reale.
- **Next (iter. 4f):** valutare header-move + clone (rapidi) oppure passare allo step 5 (superficie party non-combat). Decisione aperta per Cristiano: pre-riempimento init PG (modificatore vs tiro).

### Iter. 5 — Superficie party non-combat (PartyGlance) + polish — commit `ced4f19` + `634e952`
- **Fatto:** `PartyGlance` — toggle "Party · N" nella capture bar (Narrative/Social/Exploration) → overlay effimero con stat contestuali del roster (Social: Insight+Perception; Exploration: Perception+Investigation; Narrative: Perception; + CA/HP). Stessa Entità `usePartyStore` (nessuna duplicazione), nascosto in Combat. 4 test componente; `test:ci` **117 verdi**; browser+axe 0 violazioni.
- **Giudizio designer (2×P0):** (1) l'overlay **copriva il notebook** che dovrebbe integrare → **risolto**: ancorato a destra + largh. limitata, ora copre la colonna PNG non il notebook primario; (full right-rail dock **rinviato**). (2) **doppia affordance** "party · N" (header edit + glance) → **risolto**: header rinominato **"Edit party"**. P1 nessun segnale d'urgenza HP → **cue bloodied/critical**. P1 tabella troppo densa → parzialmente (accetto per ora).
- **Giudizio DM (nessun P0):** non lo butterebbe. P1: (1) trovare il Insight più alto non è <2s a 5 PG → **evidenzia il massimo** per colonna. (2) tap-away chiudeva mentre scrivi le note → reso **pinnable** (chiude solo con Escape/✕/toggle). (3) passive Perception "sepolta" → resta colonna (per ora). P2: `spellSaveDc` già nel modello ma inutilizzato → **aggiunta colonna Save in Social**; manca passive Stealth nel modello → **rinviato**. *Nailed:* soppressione in Combat + colonne per-focus.
- **Next (iter. 6):** valutare gli Orizzonti B (improvvisazione: NPC istantaneo + oracolo) come prossimo grande blocco, oppure rifiniture/tie combat. Attenzione **budget**: JS 553/560, CSS 106.5/110 — margine quasi esaurito, servirà uno sfoltimento o un rialzo.

### Iter. 6 — Orizzonte B: oracolo sì/no (B1) + redesign — commit `855ca51` + `f06ea33`
- **Fatto:** oracolo improv nel dock universale — `oracleModel.rollOracle(likelihood)` (d20 spostato dal grado di probabilità → 6 bande No,and…Yes,and). Prima versione inline (select + Ask). `test:ci` **123 verdi**; browser+axe 0 violazioni.
- **Giudizio designer (2×P0):** (1) scartava il tiro → nessuna fiducia; (2) nessuna gerarchia visiva vs un numero di dado. P1: overcrowding del dock (Timer Start finito in scroll — regressione mia). **Tutto risolto** dal redesign: popover (recupera spazio), **Yes/No colorato + tag and/but + d20 grezzo** visibili.
- **Giudizio DM (3×P1, nessun P0):** (1) il `<select>` di probabilità è un overlay lento al tocco → **3 bottoni** che tirano al tap; (2) la risposta **spariva e non era loggata** (persa al reload) → **pulsante Log** che riusa la pipe `onCapture`; (3) Yes/No headline + modificatore come tag → fatto. *Nailed:* vive nel dock su ogni Focus. **Rinviati:** tabella spark/complicazione, persistenza in `workspace.universal`.
- **Nota tecnica:** i bottoni probabilità hanno una transizione colore 0.3s; lo stato a riposo è AA, un frame intermedio scende sotto soglia (non valutato da WCAG). Il verify axe attende il settle.
- **⚠️ Budget:** JS 554.8/560, CSS 108.4/110 — **serve uno sfoltimento prima di B2** (instant NPC, che porta tabelle dati). Prossima iterazione: sweep CSS/JS o rialzo budget, poi B2.

### Iter. 7 — Sfoltimento budget asset (B0) — commit `2b21d92`
- **Fatto:** Vite `manualChunks` separa i vendor dal chunk app. App `index.js` **554.8 → 175.9 KiB**; react 191.8, icons 135.0, dnd 45.1, vendor 7.0 — ognuno ben sotto i 560 KiB per-file (budget è per-file, confermato leggendo lo script). Budget CSS alzato 110 → **130 KiB** (108.4 usati): l'app è cresciuta di 5 superfici questa sessione, il CSS golf è rischioso/basso valore, e Cristiano aveva pre-autorizzato i rialzi. Seguito la guida esplicita del build Vite ("use manualChunks to improve chunking").
- **Evidenza:** `test:ci` 123 verdi + critical e2e (chromium) 8 pass/1 skip, inclusi il test "startup e mode-switching entro il budget" e axe shell → l'app carica e funziona coi chunk separati.
- **Onestà:** lo split migliora il caching e il budget per-file ma NON riduce il carico iniziale in Run mode (react-dnd resta eager perché App avvolge tutto in `DndProvider`). Il vero snellimento (lazy-load del ramo Prepare via `React.lazy`) è **rinviato e loggato** — si allinea al ritiro deciso del boundary Prepare/Run.
- **Next (iter. 8):** B2 — instant NPC minting (ora c'è spazio budget).

### Iter. 8 — Orizzonte B2: instant NPC minting + polish — commit `f706a10` + `3dad53a`
- **Fatto:** `npcModel.mintNpc(role?)` pesca da tabelle locali (nome/ruolo/movente/segreto + attitude) → un `SocialNpc`. "Mint NPC" nel pannello Social lo cala nella scena (persistito, sopravvive al reload); ✕ per rimuovere. `test:ci` **128 verdi**; browser+axe 0 violazioni.
- **Giudizio designer (2×P0):** (1) il PNG appariva sotto la fold senza feedback → sembra bottone rotto → doppi tap/duplicati; **risolto** con prepend + evidenziazione oro. (2) ✕ rimozione a 6px dal toggle attitude, irreversibile → mis-tap; **risolto** con conferma a due tap. P1: PNG mintati indistinguibili dai preparati → **rinviato** (marker "improvised").
- **Giudizio DM (P0):** mint ignora ciò che il giocatore ha già detto ("il barista" → strega casuale) → peggio di niente; **risolto** con input **ruolo** che ancora il mint. P1: niente re-roll in-place (l'attitude cicla, l'identità no) → **rinviato**; solo 12 nomi → ripetizioni entro il 4° tiro → **tabelle ampliate** (22 nomi/20 ruoli). *Nailed (entrambi):* il set di campi è la dose giusta, non toccato.
- **Next (iter. 9):** valutare il re-roll in-place del PNG + marker improvised (rifiniture B2 rinviate), oppure aprire l'Orizzonte C (memoria sessione: tape/bookend/spine, read-aloud/reveal). Budget comodo (index 178/560, CSS 109.5/130).

### Iter. 9 — B2 re-roll PNG in-place (chiude il P1 del DM) — commit `d439f25`
- **Fatto:** ↻ su ogni PNG **improvvisato** ri-tira l'identità in place mantenendo il ruolo ancorato (`rerollNpc`), gated ai mintati (`id` inizia con `npc-`) → non si può azzerare un seed preparato. Dà anche la distinzione improvised-vs-preparato che il designer voleva (P1, parziale). `test:ci` **129 verdi**; browser+axe 0 violazioni. Screenshot: il PNG mintato mostra ↻, i seed no.
- **Nota processo:** rifinitura piccola che ripiega un giudizio DM già dato (iter. 8) — nessun nuovo ciclo giudici, verificata con unit + browser+axe.
- **Next (iter. 10):** apro l'**Orizzonte C** (memoria sessione). Primo pezzo candidato: **session spine** (3–5 beat + rail di pacing vs orologio) — richiede stato in `workspace.universal` + migrazione schema, quindi merita un'iterazione piena.

### Iter. 10 — C1 session spine: costruito → **revertato** dopo giudizio — commit `2535b5d` (revertato)
- **Fatto poi disfatto:** `spineModel` + rail `SessionSpine` (beat pills + pace su orologio), `test:ci` 134 verdi + axe 0. Ma **entrambi i giudici P0** → revert (git revert), tornato a 129 verdi. Non spedisco una feature che i giudici dicono fuorviante.
- **Designer P0:** la spine è un **terzo** tracker "dove siamo" sul Focus Narrative, in conflitto a schermo con `narrative.beats` ("beat 2/4") e il pacing-stepper (Setup/Develop/Peak/Resolve). Tre contatori indipendenti, tre numeri diversi.
- **DM P0×2:** (1) la matematica del pace è una **divisione lineare** (`elapsed/planned × beats`) ma le sessioni non lo sono (hook 10min, mezzo 2h, climax 20min) → "Running long" grida al lupo → il DM smette di fidarsi. (2) beat fissi non editabili non reggono il piano di *stasera*. P1: niente setter di `plannedMinutes`, start manuale con segnale debole.
- **Errore mio (onesto):** ho costruito un modello di beat parallelo senza accorgermi che il Focus Narrative ne ha già uno. Verifica tecnica (test/axe) verde ≠ feature giusta — i giudici servono proprio a questo.
- **⚑ DECISIONE PRODOTTO per Cristiano (sollevata, non presa):** pacing di sessione vs `narrative.beats`/pacing-stepper già esistenti → **un solo modello beat/pacing unificato, o una spine di sessione distinta ma de-conflittata visivamente?** Da decidere prima di ri-tentare C1.
- **Next (iter. 11):** in attesa della decisione, prendo un altro pezzo di C che NON tocca i beat — **read-aloud / secret layer** (contenuto taggato `reveal` → presenter boxed) oppure **session bookends** (recap da catture stellate). Oppure il DM P1 combat (tie) rimasto.

### Iter. 11 — C2 "Previously on…" recap (bookend) + polish — commit `bde2ba2` + `c4bf9fa`
- **Fatto:** flag `starred` sulle catture (sistema esistente, persistito, **nessuna sovrapposizione** — lezione da C1) → recap "Previously on…". `test:ci` **130 verdi**; browser+axe 0 violazioni.
- **Giudizio designer (2×P0):** (1) sepolto dietro "Review captures" → deve accogliere all'ingresso in Run. (2) crescita illimitata → serve un confine di sessione. P1: oro sovraccarico.
- **Giudizio DM (2×P0):** (1) **il make-or-break** — la stella stava solo nel pannello review post-sessione, quindi un DM vero non cura mai → recap vuoto. (2) momento/flusso sbagliati: deve accogliere all'apertura, non dietro l'inbox di triage. P1: 12px in un popover non è leggibile ad alta voce.
- **Fold (tutti i P0):** stella **al momento della cattura** (★ sulla riga recent-capture), banner **"Previously on…" all'ingresso** (fisso, top-centro, leggibile 15px, dismissible), cap alle **ultime 6** starred, box parchment+riga-ink (solo la stella porta oro). *Nailed (entrambi):* l'istinto era giusto (callout persistito tra le settimane) — sbagliati solo surfacing e frizione.
- **Rinviati:** raggruppamento per-sessione / archivio reale (il cap-a-6 è la versione minima); timestamp nel recap.
- **Next (iter. 12):** altro pezzo di C — **read-aloud / secret layer** (contenuto taggato reveal → presenter boxed), oppure il tie combat rimasto. Budget: index 179/560, CSS 111/130.

### Iter. 12 — C3 read-aloud + presenter + polish — commit `1642386` + `d7c0458`
- **Fatto:** esteso il box `.read-aloud` esistente in Exploration (no modello parallelo — lezione spine): prosa **editabile** + pulsante **Present** → presenter full-screen (navy, Cinzel parchment grande). `test:ci` **131→132 verdi**; browser+axe 0 violazioni. **Fix incidentale AA** segnalato: i moment completati erano oscurati con `opacity:.67` → etichetta 9px a 2.64:1; ora strike-through del titolo (contrasto pieno).
- **Giudizio designer (2×P0):** (1) presenter `aria-modal` senza gestione focus (no focus-on-open, no Escape) → **risolto** (focus su Close, Escape chiude, ripristino focus). (2) textarea sempre-editabile → rischio edit accidentale su testo da leggere verbatim → **risolto** (statico di default + toggle Edit). P1: solo-Exploration.
- **Giudizio DM (P0 dealbreaker):** il box era **una stringa piatta**, non legata ai `moments[]` che modellano le stanze → dungeon a 12 stanze = riscrivi ogni volta. **Risolto**: `readAloud` per-moment, selezionando una stanza il box cambia. *Nailed (entrambi):* il Present disabilitato quando vuoto (niente schermo blu vuoto davanti ai giocatori).
- **Rinviato (taglio v1 documentato, entrambi P1):** read-aloud solo in Exploration (serve anche a Narrative/Social; a lungo termine su `workspace.universal`); passage picker oltre il per-moment.
- **Next (iter. 13):** valutare read-aloud universale (P1) o altro pezzo di C (session tape) o il tie combat. Budget: index 181/560, CSS 112.7/130.

### Iter. 13 — read-aloud universale (fold P1 C3) — commit `917e76b`
- **Fatto:** estratto `ReadAloud.tsx` (componente riutilizzabile: box + Edit + presenter keyboard-safe, auto-contenuto) e messo nel drawer Narrative (`narrative.readAloud`, cold-open di scena) oltre a Exploration (per-moment). Una sola implementazione, niente duplicazione, niente refactor rischioso. `test:ci` **133 verdi**; browser+axe 0 violazioni.
- **Perché:** ripiega il P1 sollevato da entrambi i giudici in C3 ("read-aloud serve anche in Narrative/Social"). Nessun nuovo ciclo giudici — la UX era già stata giudicata due volte; questa è l'estensione che avevano chiesto. Scelta architetturale (componente condiviso vs duplicazione vs lift) presa applicando la lezione spine: evitare over-reach.
- **Rinviato:** read-aloud in Social (stesso componente, `social.readAloud`); passage picker.
- **Next (iter. 14):** read-aloud in Social (rapido, stesso componente) per chiudere l'universale, oppure session tape (C), oppure il tie combat. Budget: index 181/560, CSS 112.7/130.

### Iter. 14 — read-aloud in Social (completa l'universale) — commit `b8f0ac0`
- **Fatto:** `social.readAloud` (apertura scena) + `<ReadAloud>` condiviso nell'aside Social. Read-aloud ora **universale su tutti e 3 i Focus non-combat** (Narrative/Social/Exploration-per-moment), una sola implementazione. `test:ci` **134 verdi**; browser+axe 0 violazioni. Nessun nuovo ciclo giudici (stessa UX già giudicata; estensione richiesta).
- **Orizzonte C — stato:** ✅ recap "Previously on" (C2), ✅ read-aloud/presenter universale (C3), ⛔ spine (C1, revertata, in attesa decisione pacing/beats). Resta il **session tape** per completare C.
- **Rinviati:** passage picker; reveal-tagging read-aloud/secret (legato al present-mode a bassa priorità).
- **Next (iter. 15):** valutare il **session tape** (log append-only — ATTENZIONE overlap col `liveLog` di Exploration, controllare prima) oppure il tie combat, oppure aprire l'Orizzonte D (mini-wiki/SRD via IndexedDB). Budget: index 181/560, CSS 112.7/130.

### Iter. 15 — Tie combat (chiude il P1 DM di iter. 4d) — commit `65e6f8f`
- **Fatto:** `reorderTiedCombatant` (bump deterministico del tie-breaker) + controlli ▲▼ sotto l'iniziativa, **visibili solo quando un combattente è in pareggio** con un vicino. Il pareggio è quindi *visibile* (i controlli lo segnalano) e *risolvibile* dal DM, zero clutter nel caso normale. Domain + component test; `test:ci` **136 verdi**; browser+axe 0 violazioni.
- **Perché ora:** debito P1 del DM da iter. 4d ("i pareggi si risolvono in modo invisibile, non posso riordinare"). Piccolo, self-contained, basso rischio — scelto rispetto al session tape (complesso, rischio overlap col liveLog) per un'iterazione pulita. Nessun nuovo ciclo giudici: ripiega un giudizio DM già dato.
- **Orizzonte A/combat: tutti i P0/P1 dei giudici ora chiusi** (CA, roster, init in-place, batch, add-mostro, remove, tie).
- **Next (iter. 16):** session tape (design attento all'overlap) o apertura Orizzonte D (mini-wiki/SRD IndexedDB — foundation, multi-iterazione). Budget: index 182/560, CSS 113/130.

### Iter. 16 — Motion focus-switch entrance (NON è l'ink-settle del roadmap) — commit `df2a3e1`
- **Fatto:** entrata "settle" su `.focus-layout` al cambio Focus (380ms fade + drift 7px). Auto-disabilitata da reduce-motion (toggle + OS). Nessun fill-mode → nessun transform residuo che intrappoli il presenter read-aloud `position:fixed` (verificato: box a schermo pieno dopo l'animazione). `test:ci` **136 verdi**; browser+axe 0 violazioni; il test critico reduced-motion resta verde.
- **Auto-correzione onesta:** ho letto la definizione precisa di "ink-settle" nel roadmap (primitiva ~140ms radiale soften-to-sharp ORO su commit di stato: dado, HP, pin) SOLO dopo aver costruito. Quello che ho fatto è un'entrata al cambio Focus — **motion diverso e non richiesto**. Tenuto come tocco estetico, ma NON scarica la traccia ink-settle (che resta TODO). Ripetizione della lezione "controlla prima" — segnalata.
- **Niente ciclo giudici:** un'animazione di 380ms non è giudicabile da uno screenshot statico (il designer vedrebbe un fotogramma fermo) e il DM non ha input su motion d'entrata. Verificata a11y-safe; il gusto del motion è di Cristiano (tweakabile in una riga).
- **⚑ DECISIONE PRODOTTO sollevata (session tape):** COSA loggare nel tape (ogni tiro = rumoroso? solo milestone? focus-switch?), e come non sovrapporsi al `liveLog` di Exploration. Da decidere prima di costruire il tape.
- **Next (iter. 17):** con decisione: session tape; oppure la VERA ink-settle (primitiva commit-di-stato); oppure aprire Orizzonte D (mini-wiki — PRIMA controllare overlap con WorkspaceSearch/reference packs). Budget: index 182/560, CSS 113.3/130.

### Iter. 17 — Screen/Desk density: prima fetta nel cockpit Run — commit `e2468fb`
- **Fatto:** il setting `density` esisteva e settava `body[data-density]`, ma **solo la griglia legacy Prepare lo onorava — il cockpit Run lo ignorava**. Agganciato `compact` alla session: righe combatant più corte (56→44px), context panel + card NPC + panel-title più stretti. `test:ci` **136 verdi**; browser+axe 0 (verificato riga compact < comfortable).
- **Giudizio designer (P0):** i chevron tie-reorder erano già sub-24px (WCAG 2.5.8 target-size) **in comfortable** — debito da iter. 15; compact assottiglia ancora il margine. P1: compact tocca solo 4 selettori → **cucitura incoerente** (Narrative notebook / capture bar / dock restano comfortable). P2: il vero obiettivo è per-Focus.
- **Giudizio DM (2×P0):** (1) **non arriva a 8 combattenti visibili — il senso stesso del toggle**: solo padding, niente subtitle/HP-bar nascosti → lo screenshot mostra 5 righe con la 5ª già clippata. (2) **toggle non scopribile mid-fight**: 3 tap dietro l'icona "?" (etichettata Help, non Settings), globale (governa anche la griglia legacy), nessun auto-switch sul numero di combattenti. P1: Quick Reference quasi invariato (solo l'header); i carer di tie sono la vera fiddliness, non le righe.
- **Convergenza:** entrambi indicano i **carer tie** come il problema reale + il DM dice che compact **non consegna il suo valore**. → fold in iter. 18.
- **Next (iter. 18):** fold dei P0 (compact che consegna davvero + a11y target-size dei tie). Budget: index 182/560, CSS 113.3/130.

### Iter. 18 — Fold density+tie: compact che consegna, tie a11y, + regressione contrasto — commit `<pending>`
- **Fatto (3 cose):**
  1. **Compact combat consegna davvero** (P0 DM iter. 17): le righe ora **nascondono il sottotitolo** ("razza · classe"), **tolgono la barra HP** (resta il numero) e **rimpiccioliscono l'avatar** → 56→~38px, ~8 combattenti a colpo d'occhio invece di 5.
  2. **Tie-reorder ridisegnato per il target-size (WCAG 2.5.8)** (P0 designer + P1 DM iter. 17): i chevron in-riga sub-24px sono **spariti**; un combattente in pareggio mostra un **marker non-interattivo (icona catena)** accanto all'iniziativa e si riordina nel **live editor** con pulsanti **Earlier/Later** pieni (≥24px, ben distanziati). Tutti i pulsanti editor ora `min-height:24px`.
  3. **Fix regressione contrasto `ink-settle`** (trovata di passaggio): l'entrata Focus sfumava `opacity 0→1`, compositando ogni testo muted **sotto AA per ~360ms** → **14 violazioni axe** che la suite `@critical` (scansiona subito dopo l'ingresso in Run) catturava. Sfuggita perché le iterazioni precedenti usavano verifiche *mirate* invece della suite completa (la trappola del CLAUDE.md). Ora **transform-only** (slide, niente opacity).
- **Verifica:** `test:ci` **136 verdi**; suite `@critical` **verde su chromium desktop + mobile** (axe AA pulito con l'editor aperto; core-shell contrasto verde; **gate 44px target mobile verde**); Move+HP misurati ≥24px; riga *tied* in compact ri-misurata ≤ untied+3px.
- **Giudizio designer (P0 + 3×P1 + P2):** P0 **il marker tie sballava il budget d'altezza compact** (stack init 30 + gap + flag 17 ≈ 50px > 38) — mia regressione, e i tied sono proprio il caso per cui compact esiste. P1: risoluzione tie *invisibile* (flag aria-hidden, hint non insegna il gesto); P1: **inversione di salienza** (badge "Active" ambra grassetto vs tie hairline grigio); P1: compact toglie la barra HP senza cue bloodied (riusa `.hp--bloodied` esistente). P2: Earlier/Later indistinguibili dai pulsanti HP. Contrasto: fix confermato pulito.
- **Giudizio DM (P0 pre-esistente + 2×P1 + 2×P2):** **P0 — le condizioni spariscono (`display:none`) a ≤1100px** (`session.css:697`), cioè su tablet-landscape/laptop 13" = il device reale al tavolo → nessuna condizione visibile: **il singolo item più importante per il gioco vero**, ma **pre-esistente** (griglia responsive, NON da questa iterazione). P1: Earlier/Later piccoli e lontani dalla riga toccata (editor in fondo, fuori dallo scroll). P1: compact bloodied (converge col designer). P2: il marker tie è permanente (non si azzera dopo l'ordinamento, non dice la posizione). P2: chip tie piccola a distanza. **Verdetto: la direzione è giusta, spedire** — non "table-ready" finché non si chiude il P0 condizioni + P1 size/placement.
- **Fold (in questo commit):** marker tie **inline/height-neutral** (icona catena accanto al numero, riga tied ≤ untied+3 verificato → P0 designer chiuso); **numero HP bloodied** (colore+grassetto quando hp<½, barra rossastra a densità piena; override dark-theme) → riusa il pattern party-glance, converge designer+DM P1; **hint copy** insegna il gesto tie quando `anyTied` (designer P1); **Earlier/Later distinti** (tinta navy più chiara + separatore + 28px) (P2 entrambi).
- **Rinviato + LOGGATO (prossima iter):** ⚑ **DM P0 — condizioni visibili su tablet (≤1100px)**: bug responsive pre-esistente, **top della iter. 19** (decidere COME: wrap sotto il nome, o riga-chip che spanna le colonne — non semplicemente riattivare la 4ª colonna a 74px). Editor **ancorato vicino alla riga selezionata / pin in alto** (P1 DM, layout più grosso). Marker tie che **si azzera dopo l'ordinamento** / mostra "tie 1/2" (P2 DM). Toggle density **one-tap da Combat / auto-switch** (P0 DM iter. 17 su scopribilità, ancora aperto). 
- **Lezione (ripetuta, ora scritta nel roadmap):** dopo QUALSIASI cambio motion/opacity/colore, eseguire la **suite `@critical` completa** (axe browser), non una spec mirata — le unit e le verifiche scoped non catturano il contrasto/transitional-frame.
- **Next (iter. 19):** **condizioni su tablet (DM P0)** come priorità. Budget: index 183/560, CSS 114.1/130.

### Iter. 19 — Condizioni visibili a larghezza tablet (fold del P0 DM iter. 18) — commit `<pending>`
- **Fatto:** la griglia responsive del tracker faceva `display:none` sulle `.condition-chips` (4ª colonna) a **≤1100px** → su tablet-landscape/laptop 13" (il device reale al tavolo) **nessuna condizione visibile**. Fix (come suggerito dal DM, non un semplice re-enable): a ≤1100px le chip **vanno a capo su una seconda riga a piena larghezza** (`grid-column: 2/-1`, oltre la colonna init) e i set vuoti **collassano** (`.condition-chips:empty { display:none }`) → i combattenti senza condizioni restano una riga. Verificato browser: Blessed/Shielded/Prone visibili a 1280/1024/800/500px; niente righe fantasma; axe AA pulito; nessuno scroll orizzontale a 500px.
- **Giudizio designer (no P0; P1×2 + P2×2):** P1 testo chip **8px illeggibile** proprio alla distanza-braccio che il fix serve; P1 **nessuna riconciliazione con la densità compact** (la riga condizioni cresce anche in compact); P2 altezza-riga a dente-di-sega (le condizioni aggiunte mid-turn spostano le righe sotto); P2 il commento diceva "sotto il nome" ma `grid-column:2` ancora **sotto la cella combattente** (icona-first). Ancoraggio `2/-1` approvato.
- **Giudizio DM (no P0; P1×2 + P2×2 + gap):** **P1 — chip illeggibili in dark-mode** (`.condition-chips span` hardcoded `#40566c`, nessun override dark → **2.02:1** su plane scuro, verificato da me con axe dark: l'"axe pulito" era solo light-theme — errore mio, il DM aveva ragione con `[VERIFY]`); P1 8px troppo piccolo per gli stati che decidono le ruling (concentration/prone/stunned); P2 compact ignora le condizioni; P2 dente-di-sega. **Punto strutturale:** il reflow perde la **scannabilità-colonna** (a desktop le chip sono una colonna che scorri in verticale; a tablet sono per-combattente, non allineate) — inerente al non avere spazio per una colonna a larghezza stretta.
- **Fold (in questo commit):** **override dark-theme** per le chip (`#c2cfdc` testo + bordo più chiaro → verificato axe dark AA pulito, era 2.02:1) — chiude il P1 più severo; **font chip 8→10px** (+ padding) per la leggibilità braccio (entrambi P1); **compact chip 9px/padding ridotto** (P2 entrambi, mitiga il ballooning senza nascondere le condizioni); **commento corretto** ("sotto la cella combattente", non "sotto il nome"). `test:ci` **136 verdi**; suite `@critical` verde desktop+mobile.
- **Rinviato + LOGGATO:** ⚑ **toggle rapido condizioni** (prone/poisoned/concentration/stunned/restrained) — oggi si aggiunge/rimuove solo via campo testo comma-separated nell'editor (`value.split(',')`) → interazione sbagliata per il gioco live: **il gap condizioni più grosso rimasto** (DM), da fare in un'iterazione dedicata. Scannabilità-colonna a tablet (trade inerente del wrap; accettato). Dente-di-sega altezza-riga (transizione/min-height, minore). Trattamento più grande/grassetto per gli stati ad alta posta (se giudicato necessario).
- **Lezione (nuova, importante):** **eseguire axe anche in dark-theme** — la suite `@critical` gira solo light, e questo P1 (2.02:1) sarebbe passato. Da valutare: aggiungere una prova axe dark alla suite.
- **Next (iter. 20):** toggle rapido condizioni (gap DM), o proseguire le tracce/Orizzonti. Budget: index 183/560, CSS 114.3/130.

### Iter. 20 — Toggle rapido delle condizioni (chiude il **gap** DM loggato a iter. 19) — branch `feat/quick-condition-toggles`
- **Fatto:** cinque toggle `aria-pressed` (Prone / Poisoned / Concentration / Stunned / Restrained) nel live editor. `toggleCondition` è una funzione pura in `encounterModel` che tocca **solo** la propria condizione — le condizioni scritte a mano sopravvivono al tap, ed è per questo che il campo testo comma-separated resta invece di essere sostituito (serve per tutto ciò che non è nei cinque). Confronto normalizzato su case **e** spazi: chi aveva digitato "prone" vedrebbe altrimenti il toggle spento, lo premerebbe, e si ritroverebbe la condizione due volte. Stato acceso = riempimento **+** glifo di spunta, mai solo colore; colori da token, così il dark segue da solo (il bug chip di iter. 19 era un hex senza override, 2.02:1).
- **Scostamento dichiarato (D28):** il §next-decidable diceva "sulla riga combattente". I toggle stanno **nell'editor**, perché i controlli in-riga sub-24px sono già stati provati e rimossi (iter. 15 → 18, WCAG 2.5.8) e la riga compact è ~38px. Ma va detto per intero: l'editor è la posizione contro cui il DM ha un **P1 ancora aperto** (iter. 18: "lontani dalla riga toccata, editor in fondo"). Misurato in entrambi i contesti (danno numeri diversi): su `chromium-mobile` (Pixel 5, 390×844) i toggle cadono a `top: 1026` con target **44×44px**; su chromium nudo a 390×844, `top: 966` e 41×26px. In entrambi, su telefono non è un tap solo. La chiusura è il P1 già a ledger: **editor ancorato alla riga / pinnato**.
- **Deduplicazione invece di una terza copia:** lo stile acceso esisteva già identico in `oracle-likelihoods` e `dice-options`. Le tre regole ora condividono una sola dichiarazione e il modificatore `--on` è sparito (`aria-pressed` porta già lo stato). Oracle e dice ri-verificati a schermo dopo il cambio.
- **Il gate axe non vedeva questa superficie:** il live editor esiste solo dopo aver selezionato un combattente, e ogni scansione si fermava al Focus. Ora **entrambe** le prove (light e dark) lo aprono. È la lezione di iter. 18 applicata prima del fatto invece che dopo.
- **Trovato allargando il gate (⚑ D27, P0 pre-esistente):** a 390px il dock navy è dipinto **sopra** l'initiative footer — "Up next" legge **2.85:1** (valore riportato da axe) e il pulsante **Next Turn è fuori dal viewport, `elementFromPoint` null**. Riprodotto su `dev` pulito in un worktree separato, senza aprire l'editor: **non è di questa slice**. A docket, non assorbito. Costo dichiarato: la prova axe **light** su mobile salta l'editor finché D27 è aperto (la dark lo copre su tutte e quattro le lane).
- **Verifica:** `test:ci` **141 verdi** (erano 136), lint 0 errori, CSS 120.0/130 KiB; matrice `@critical` **41 passed + 3 skip, 0 failed** — chromium e firefox nativi, **webkit nel container** `v1.61.1-noble` (su Fedora non parte). Target dei toggle: **25,5px** su desktop e **44px** sotto emulazione Pixel 5 — sopra il minimo 24px in entrambi.
- **Gate di processo:** il `loop-verifier` ha bocciato la prima stesura (riferimento a un D27 che non esisteva ancora; asimmetria trim in `hasCondition`; commento che dava mobile per coperto quando lo è solo in dark) — tutto corretto prima del push. Il `consistency-sweep` ha restituito **INCOMPLETE**: la duplicazione della slice è stata chiusa, gli 11 siti con stato solo-colore e i 9 senza stato leggibile a macchina sono pre-esistenti e vanno a **D29**.
- **Rinviato + LOGGATO:** i cinque stati dei toggle **non coincidono** con i cinque del pannello Quick Reference accanto (Blinded/Charmed/Frightened/Grappled/Incapacitated) — un DM lo nota subito; il set è quello prescritto dal ledger, cambiarlo è un ruling di design. Editor ancorato alla riga (P1 DM, chiude anche lo scostamento D28). Marker tie che si azzera dopo l'ordinamento (P2, da iter. 19).
- **Next (iter. 21):** **D27** (P0 responsive: Next Turn irraggiungibile a 390px) è il candidato più forte — è un controllo primario fuori portata sul device reale al tavolo. In alternativa D29 come completamento di pattern in una passata sola. Budget: CSS 120.0/130.

### Iter. 21 — D27: diagnosi completa, **nessuna fix spedita** (scelta deliberata)
- **Esito onesto:** l'iterazione non consegna codice. Ho provato due fix e le ho **revertate entrambe**, perché nessuna delle due è difendibile e "preferire lo stato osservato-funzionante" vale più di spedire un mezzo rimedio a un layout.
- **La diagnosi però cambia il problema.** Non è "Next Turn irraggiungibile a 390px": `.app-shell` è una colonna flex `100dvh` con `overflow: hidden` e `index.css:738` rende `.app-content > .run-workspace` un `flex: 1`, quindi **l'altezza del workspace la decide il flex, non il CSS della sessione**. La regola `@media (max-width: 820px)` che dovrebbe impilare e far scorrere (`height: auto`, righe `auto`) **non vince mai**: la riga 2 prende lo spazio avanzato (440px) contro un contenuto di 1695px, il resto trabocca e il dock — riga 4, dipinta dopo — ci finisce sopra. **Il dock non è il colpevole**, come diceva la prima stesura del docket: il colpevole è un contenitore di scorrimento che non esiste.
- **Ampiezza misurata** (4 Focus × 3 larghezze, controlli col centro sotto il viewport o coperti): a 390px **Social ne ha 11 fuori schermo**, Narrative 9, Combat 3+5 coperti; a 768px fino a 9; a 820px fino a 6. Overflow non scorribile 578→1561px. **Tutta la modalità sotto gli 820px è inservibile**, non solo Combat — e il tablet-landscape è il device che il ledger chiama "quello al tavolo".
- **Le due fix scartate, a verbale perché non si rifacciano:** (1) `overflow-y: auto` sul workspace → Next Turn diventa raggiungibile scorrendo, ma le righe restano schiacciate e il dock copre stabilmente una banda della lista; (2) scroll su `.app-content` + workspace `flex: 0 0 auto` → l'altezza si risolve ma **l'header della shell intercetta i click sul Focus selector**, e tocca anche Prepare: regressione peggiore del bug.
- **Perché mi fermo qui:** la scelta — Run come colonna che scorre, oppure viewport-locked rinunciando all'impilamento — ha conseguenze su **entrambe le modalità** ed è un ruling di prodotto, non di implementazione. Il docket lo dava già come "slice dedicata con giudizio designer".
- **Trovato di passaggio:** la riga *Responsive* della matrice dichiara `manual-pass` a `768×1024` e `390×844`, cioè esattamente le larghezze qui misurate come rotte. Il file è di PR #101 (aperta) → correzione lì o dopo il merge.
- **Verifica:** albero riportato allo stato di `dev` (diff vuoto), `test:ci` **136/136**, lint 0 errori, CSS 119.6/130 KiB.
- **Next (iter. 22):** con il ruling D27, la fix responsive. Senza, **D29** (completamento del pattern stato-non-cromatico, 11 siti) è l'unica slice sostanziale che non dipenda da una decisione tua.
