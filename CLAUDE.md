# CLAUDE.md — AI Assistant Guide for ArcanaScreen

Guidance for AI assistants working on ArcanaScreen. Last verified: 2026-07-14.

## Project Overview

**ArcanaScreen** is a customizable, client-side virtual Dungeon Master screen (React + TypeScript + Vite). It keeps a DM's prepared info, live capture and current session action in one glanceable workspace. No backend; state lives in browser localStorage.

**Core model (read this first):**
- A **Screen** is the durable workspace (name, template, mode, current Focus, notebook, captures, references, universal dice/timer, per-Focus contextual state, schema version).
- **Mode** is either `Prepare` (configure/layout) or `Run` (protected live play).
- **Focus** is temporary session context: `narrative`, `social`, `exploration`, `combat`. Switching Focus changes the contextual tools but never touches notebook/capture/references/universal state.
- Design source of truth: `docs/specs/` and the reference mockups in `.codex/product-design/horizon-0-prototype/reference/`.

**Architecture note (important):** the app currently runs two UI systems:
- **Run** mode → `src/components/session/RunWorkspace.tsx` + `session.css` (`.arcana-session`), the polished Screen/Focus cockpit.
- **Prepare** mode (and pop-out) → the legacy widget grid: `src/components/Grid.tsx` + `ToolFrame.tsx` + `WidgetSidebar/` + `src/components/widgets/*` (react-dnd).
`src/App.tsx` branches on the active screen's mode; `FirstRun` renders when no screens exist. Reconciling these two into one model is an open product decision.

## Directory layout

Repo root: `/…/arcana-screen`. The app lives one level down in `arcana-screen/` (same name). **Run all commands from the app dir** (`cd arcana-screen` from the repo root).

```
arcana-screen/                      # repo root (README, LICENSE, ROADMAP.md, CHANGELOG.md, docs/, .codex/, .githooks/)
├── docs/                           # specs, verification, user guide, review ledger
│   ├── specs/                      # 00-product-model, 01-shell-and-design, focus-flows, acceptance-matrix
│   ├── verification/               # dated verification evidence
│   └── review/                     # design-review loop ledger
├── .codex/product-design/          # audits + horizon-0 prototype + reference mockups (design source of truth)
├── .githooks/                      # pre-commit (branch name) + commit-msg (conventional) — NOT active by default
└── arcana-screen/                  # the Vite app (run commands here)
    ├── e2e/critical-flows.spec.ts  # Playwright critical @critical suite (incl. axe accessibility)
    ├── playwright.config.ts        # projects: chromium-desktop, firefox-desktop, webkit-desktop, chromium-mobile
    ├── scripts/check-performance-budget.mjs
    ├── src/
    │   ├── App.tsx                 # shell: Prepare↔Run branch, header, FirstRun/presenter/popout
    │   ├── main.tsx                # entry (+ sw.js registration in PROD)
    │   ├── index.css               # shell + Prepare styles/tokens
    │   ├── components/
    │   │   ├── session/            # RunWorkspace, FocusSelector, QuickCaptureBar, UtilityDock, session.css
    │   │   ├── ScreenManager/      # screen switcher, create/manage panel, Prepare/Run toggle
    │   │   ├── DataManager/        # export/import/recovery dialog (trust layer)
    │   │   ├── FirstRun/           # empty-state screen creation
    │   │   ├── OnboardingTour/, WidgetSidebar/, WidgetHelpButton/, ProfileManager/ (legacy)
    │   │   ├── Grid.tsx, ToolFrame.tsx, WorkspaceSearch.tsx, EvolutionSettings.tsx
    │   │   └── widgets/            # DiceRoller, CountdownTimer, InitiativeTracker, QuickNotes,
    │   │                           # QuickCapture, QuickReference, SimpleTable, Counter, toolRegistry.tsx
    │   ├── store/                  # Zustand stores (see below)
    │   ├── domain/                 # focusModel, encounterModel, timerModel (pure logic + tests)
    │   └── utils/                  # dataPortability, safeStorage, deviceProfile, diceFormulaParser (+ tests)
    └── public/                     # manifest.webmanifest, sw.js, docs/, textures
```

## Tech stack

| Category | Tech | Version |
|----------|------|---------|
| Framework | React | ^19.0.0 |
| Language | TypeScript | ~5.7.2 |
| Build | Vite | ^6.3.1 |
| State | Zustand | ^5.0.3 |
| CSS | TailwindCSS (v4) | ^4.1.4 |
| Icons | @phosphor-icons/react | ^2.1.10 |
| Fonts | @fontsource (Cinzel, Work Sans) | ^5.x |
| Drag & drop | react-dnd | ^16.0.1 (legacy Prepare grid only) |
| Toasts | react-hot-toast | ^2.5.2 |
| Unit/component tests | Vitest + Testing Library | ^4.1.10 |
| E2E / a11y | @playwright/test + @axe-core/playwright | ^1.61 / ^4.12 |

## Development commands (run from the app dir)

```bash
npm run dev               # Vite dev server (HMR)
npm run build             # tsc -b && vite build
npm run lint              # eslint
npm test                  # vitest run (unit/component) — currently 86 tests
npm run test:ci           # build + lint + test + check:budget   ← does NOT run e2e
npm run test:e2e:critical # Playwright @critical suite (browsers + axe)  ← run this for browser/a11y
npm run check:budget      # per-file asset budget: 560 KiB per JS chunk / 130 KiB CSS (vendors split via manualChunks)
npm run preview           # serve the production build (used by Playwright webServer on :4173)
```

**Testing reality (verified 2026-07-16):** `test:ci` runs unit only. Browser flows, responsive, and **axe accessibility/contrast** are only covered by `test:e2e:critical`. Always run the Playwright suite after visual/CSS changes - unit tests will not catch contrast/a11y regressions. Real state: 136/136 unit green; e2e **37 pass + 3 skip on the full matrix, WebKit included** (the historical WebKit failures were a real cross-browser bug - `upgrade-insecure-requests` in the CSP meta - fixed 2026-07-16, see docs/verification/2026-07-16-webkit-gate.md). On hosts without WebKit system deps the webkit lane needs `sudo npx playwright install-deps webkit` first.

## State management (Zustand, localStorage-persisted)

| Store | File | Key | Purpose |
|-------|------|-----|---------|
| Screens | `store/useScreenStore.ts` | `arcana_screens` | Screen lifecycle, mode, Focus, workspace |
| Widgets (legacy) | `store/useWidgetStore.ts` | `arcanaScreenLayout` | Prepare grid widgets + layout |
| Evolution | `store/useEvolutionStore.ts` | `arcana_evolution` | density, locale (EN/IT), accent theme, templates, reference packs |
| Theme | `store/themeStore.ts` | `arcana_theme` | light/dark, reduced motion |
| Trust | `store/trustStore.ts` | (autosave status) | save/health status surfaced in UI |
| Tour | `store/tourStore.ts` | `arcana_tour` | onboarding tour |
| App | `store/appStore.ts` | `arcana_app_state` | favorites/global |
| Profiles (legacy) | `store/useProfileStore.ts` | `arcana_profiles` | older profile system |

`store/screenTemplates.ts` holds the General/Combat/Blank template catalog.

## Design system

The intended language (both modes should share it): deep-navy header/dock (`#061f36`), warm parchment plane (`#fbf7ee`), muted gold (`#e5ad32`) reserved for active/primary state, **Cinzel** for headings + **Work Sans** for body (bundled via `@fontsource`, CSP-safe), Phosphor outline icons (no emoji), thin borders, ~8px radii, minimal shadow, state signalled by text/shape/position not only colour. Tokens: **`src/styles/tokens.css`** is the canonical layer (ported 2026-07-16 from the Claude Design project "Arcana Screen Dungeon Master": colors incl. `.dark-theme`, typography, spacing/radii, elevation, motion, all `--as-*`); `session.css` and `index.css` consume it — `index.css` legacy names (`--ink`, `--ink-muted`, `--line`, …) are aliases onto `--as-*`. Alias gotcha: a `var()` inside a custom property substitutes where it is **declared**, so theme-dependent aliases must be re-declared under `body.dark-theme` (see index.css). **Muted text is `#586678`** (do not lighten below WCAG AA 4.5:1 on parchment).

## Adding a tool/widget

Legacy widgets are registered in `src/components/widgets/toolRegistry.tsx` (typed defaults + schema/migration). Run-mode Focus tools live in `session/RunWorkspace.tsx`. Persist widget state via the widget store; persist Screen state via `useScreenStore`.

## Git conventions

- **Commit + push to `origin/dev` at the end of each unit of work.** Conventional Commits (`feat|fix|chore|refactor|docs|style|test|perf|ci|build: …`).
- **Never** add AI attribution (no `Co-Authored-By`, no "Generated with") to commits/PRs.
- Hooks in `.githooks/` validate branch names (`{type}/{issue}-{desc}`) and commit-msg (`type: desc #issue`) **but are not active** unless `git config core.hooksPath .githooks` is set. Current work commits directly on `dev`.

## Do / Don't

**Do:** run `npm run test:ci` **and** `npm run test:e2e:critical` before claiming done; keep the two modes visually coherent with the session design system; use Phosphor icons; keep new widgets self-contained; watch the asset budget (560 KiB per JS chunk / 130 KiB CSS).
**Don't:** add a backend; ship emoji glyphs; lighten muted text below AA; change a localStorage key without updating all references; claim "green" from unit tests alone (they miss browser/a11y).

## Key file references

- Shell/branch: `src/App.tsx` · Entry: `src/main.tsx`
- Run cockpit: `src/components/session/RunWorkspace.tsx` (+ `session.css`)
- Prepare grid: `src/components/Grid.tsx`, `ToolFrame.tsx`, `WidgetSidebar/`
- Screen lifecycle: `src/store/useScreenStore.ts` · Screen mgmt UI: `src/components/ScreenManager/`
- Tool registry: `src/components/widgets/toolRegistry.tsx`
- Trust layer: `src/utils/dataPortability.ts`, `src/components/DataManager/`
- E2E/a11y: `arcana-screen/e2e/critical-flows.spec.ts`
- Design specs: `docs/specs/` · Reference mockups: `.codex/product-design/horizon-0-prototype/reference/`
- Review ledger: `docs/review/2026-07-13-design-review-loop.md`
