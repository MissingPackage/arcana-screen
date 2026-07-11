# AGENTS.md - AI Assistant Guide for ArcanaScreen

This document provides comprehensive guidance for AI assistants working on the ArcanaScreen codebase.

## Project Overview

**ArcanaScreen** is a fully customizable virtual Dungeon Master (DM) screen built with React, TypeScript, and Vite. It provides Game Masters with a flexible interface to organize session resources, manage encounters, track players, and customize their screen layout through drag-and-drop widgets.

**Key Characteristics:**
- Client-side only (no backend required)
- Browser localStorage for data persistence
- Widget-based modular architecture
- Drag-and-drop layout customization

## Repository Structure

```
/arcana-screen/
├── .github/
│   └── worklows/               # GitHub Actions (project board automation)
├── .githooks/                  # Git hooks for commit validation
│   ├── pre-commit              # Branch name validation
│   └── commit-msg              # Commit message validation
├── arcana-screen/              # Main application directory
│   ├── src/
│   │   ├── components/
│   │   │   ├── Grid.tsx                    # Main grid layout with drag-drop
│   │   │   ├── widgets/                    # Widget components
│   │   │   │   ├── DiceRoller.tsx          # D&D dice rolling
│   │   │   │   ├── InitiativeTracker.tsx   # Combat turn tracking
│   │   │   │   ├── CountdownTimer.tsx      # Timer widget
│   │   │   │   ├── SimpleTable.tsx         # Editable table widget
│   │   │   │   ├── QuickNotes.tsx          # Text notes widget
│   │   │   │   ├── DiceIcons.tsx           # SVG dice icons
│   │   │   │   ├── WidgetConfig.tsx        # Widget metadata registry
│   │   │   │   └── WidgetComponents.ts     # Shared widget utilities
│   │   │   ├── WidgetSidebar/              # Left sidebar components
│   │   │   │   ├── WidgetSidebar.tsx
│   │   │   │   ├── SidebarHeader.tsx
│   │   │   │   ├── WidgetList.tsx
│   │   │   │   ├── WidgetItem.tsx
│   │   │   │   └── types.ts
│   │   │   └── ProfileManager/             # Profile save/load system
│   │   │       ├── ProfileManager.tsx
│   │   │       └── ProfileManagerPanel.tsx
│   │   ├── store/                          # Zustand state management
│   │   │   ├── useWidgetStore.ts           # Widget layout and data
│   │   │   ├── useProfileStore.ts          # Profile management
│   │   │   ├── themeStore.ts               # Theme state (light/dark)
│   │   │   └── appStore.ts                 # Global app state
│   │   ├── utils/
│   │   │   └── localStorageManager.tsx     # localStorage utilities
│   │   ├── assets/                         # Static assets
│   │   ├── App.tsx                         # Main App component
│   │   ├── main.tsx                        # React entry point
│   │   ├── index.css                       # Global styles & theme vars
│   │   └── App.css                         # App-specific styles
│   ├── public/                             # Static files
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.app.json
│   ├── eslint.config.js
│   └── tailwind.config.js
├── README.md
├── LICENSE
└── AGENTS.md                               # This file
```

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | ^19.0.0 |
| Language | TypeScript | ~5.7.2 |
| Build Tool | Vite | ^6.3.1 |
| State Management | Zustand | ^5.0.3 |
| CSS Framework | TailwindCSS | ^4.1.4 |
| Drag & Drop | React DnD | ^16.0.1 |
| Toast Notifications | react-hot-toast | ^2.5.2 |
| Linting | ESLint + typescript-eslint | ^9.25.1 |
| Code Formatting | Prettier | ^3.5.3 |

## Development Commands

All commands should be run from the `arcana-screen/arcana-screen/` directory:

```bash
npm run dev      # Start Vite dev server with HMR (port 5173)
npm run build    # Type-check (tsc) + Vite production build
npm run lint     # Run ESLint on project
npm run preview  # Preview production build locally
```

## Git Conventions

### Branch Naming

Branches must follow the pattern: `{type}/{issue-number}-{description}`

**Types:** `feature`, `fix`, `chore`, `refactor`

**Examples:**
- `feature/23-initiative-tracker`
- `fix/45-dice-roller-bug`
- `refactor/12-store-cleanup`

### Commit Messages

Commits must follow Conventional Commits format with issue reference:

```
{type}[({scope})]: {description} #{issue-number}
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `perf`, `ci`, `build`

**Examples:**
- `feat: add initiative tracker widget #23`
- `fix(dice-roller): correct advantage calculation #45`
- `docs: update README installation steps #12`

### Git Hooks

The repository includes git hooks in `.githooks/`:
- **pre-commit**: Validates branch name convention
- **commit-msg**: Validates commit message format

To enable hooks: `git config core.hooksPath .githooks`

## Code Patterns & Conventions

### Component Structure

All components are functional React components using hooks:

```typescript
interface WidgetProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget?: (id: string) => void;
}

const MyWidget: React.FC<WidgetProps> = ({ id }) => {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));
  const updateWidget = useWidgetStore(state => state.updateWidget);
  const [localState, setLocalState] = useState(...);

  // Component logic and JSX
};
```

### State Management (Zustand)

Stores are organized by feature with persist middleware for localStorage:

```typescript
// Store pattern
export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      addWidget: (widget) => set({ widgets: [...get().widgets, widget] }),
      updateWidget: (id, updates) =>
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }),
      // ...
    }),
    { name: 'arcanaScreenLayout' }
  )
);
```

**Store Files:**
- `useWidgetStore.ts` - Widget layout and data (key: `arcanaScreenLayout`)
- `useProfileStore.ts` - Profile management (key: `arcana_profiles`)
- `themeStore.ts` - Theme state (key: `theme`)
- `appStore.ts` - App state including favorites (key: `arcana_favorites`)

### Styling

- **Primary:** TailwindCSS utility classes
- **Secondary:** Inline styles for dynamic values
- **Theming:** Class-based dark mode using `dark-theme` and `light-theme` classes
- **Global CSS:** CSS variables defined in `index.css`

### Naming Conventions

- **Components:** PascalCase (e.g., `DiceRoller`, `InitiativeTracker`)
- **Files:** Match component name (e.g., `DiceRoller.tsx`)
- **Functions/variables:** camelCase
- **Types/Interfaces:** PascalCase (e.g., `WidgetProps`, `TableColumn`)

### Drag & Drop (React DnD)

Item types used in the application:
- `'WIDGET'` - Widget cards from sidebar
- `'ROW'` / `'COLUMN'` - Table row/column reordering

## Widget System

### Available Widgets

| Widget | ID | Purpose |
|--------|-----|---------|
| Countdown Timer | `countdown-timer` | Time tracking for encounters |
| Dice Roller | `dice-roller` | D2-D100 rolling with advantage/disadvantage |
| Initiative Tracker | `initiative-tracker` | Combat turn order management |
| Quick Notes | `quick-notes` | Text note taking |
| Simple Table | `simple-table` | Editable data tables |

### Adding a New Widget

1. Create component in `src/components/widgets/NewWidget.tsx`
2. Add metadata to `WidgetConfig.tsx`:
   ```typescript
   {
     id: 'new-widget',
     name: 'New Widget',
     tags: ['tag1', 'tag2'],
     isFavorite: false
   }
   ```
3. Add widget case to `Grid.tsx` render logic
4. Define widget-specific properties in `Widget` interface (`useWidgetStore.ts`)

### Widget Props Pattern

Widgets receive:
- `id` - Unique widget instance identifier
- Access store directly via `useWidgetStore`
- Update state via `updateWidget(id, { ...updates })`

## Testing

**Current State:** No formal test suite configured.

Validation relies on:
- TypeScript strict mode type checking
- ESLint static analysis
- Manual browser testing

## Important Notes for AI Assistants

### Do's

- Always run `npm run build` to verify TypeScript compilation
- Follow the established patterns for components and stores
- Use TailwindCSS for styling when possible
- Keep widget components self-contained
- Persist important state to localStorage via Zustand middleware
- Reference issue numbers in commits

### Don'ts

- Don't add backend dependencies (client-side only)
- Don't bypass git hooks without explicit permission
- Don't modify localStorage keys without updating all references
- Don't introduce dependencies without clear justification

### Code Quality Checklist

Before submitting changes:
1. [ ] TypeScript compiles without errors (`npm run build`)
2. [ ] ESLint passes (`npm run lint`)
3. [ ] Branch name follows convention
4. [ ] Commit messages follow Conventional Commits with issue reference
5. [ ] No `any` types without justification
6. [ ] New widgets registered in `WidgetConfig.tsx`
7. [ ] State properly persisted if needed

### Known Legacy Issues

- Some code comments are in Italian (migrating to English)
- Some debugging console.log statements may exist
- Type safety could be improved in some store definitions

## Useful File References

- **Main entry:** `arcana-screen/src/main.tsx`
- **App component:** `arcana-screen/src/App.tsx`
- **Widget registry:** `arcana-screen/src/components/widgets/WidgetConfig.tsx`
- **Widget store:** `arcana-screen/src/store/useWidgetStore.ts`
- **Grid layout:** `arcana-screen/src/components/Grid.tsx`
- **Theme variables:** `arcana-screen/src/index.css`
