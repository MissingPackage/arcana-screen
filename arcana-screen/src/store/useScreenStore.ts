import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAppStore } from './appStore';
import { createTemplateWidgets, type ScreenTemplate } from './screenTemplates';
import { useWidgetStore, type Widget } from './useWidgetStore';
import { migrateToolInstance } from '../components/widgets/toolRegistry';
import { safeLocalStorage } from '../utils/safeStorage';
import { useTrustStore } from './trustStore';
import {
  createDefaultFocusWorkspace,
  migrateFocusWorkspace,
  switchFocus,
  type FocusId,
  type FocusWorkspace,
} from '../domain/focusModel';

export interface Screen {
  id: string;
  name: string;
  template: ScreenTemplate;
  mode: ScreenMode;
  layoutConfig: Widget[];
  focusWorkspace: FocusWorkspace;
  favoriteWidgetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type ScreenMode = 'prepare' | 'run';
export type ScreenImportStrategy = 'merge' | 'replace';

export interface DeletedScreen {
  screen: Screen;
  index: number;
  wasActive: boolean;
}

interface ScreenStoreState {
  screens: Screen[];
  activeScreenId: string;
  createScreen: (name: string, template: ScreenTemplate) => string;
  openScreen: (id: string) => void;
  renameScreen: (id: string, name: string) => void;
  duplicateScreen: (id: string) => string | null;
  deleteScreen: (id: string) => DeletedScreen | null;
  restoreDeletedScreen: (deleted: DeletedScreen) => Screen;
  setActiveMode: (mode: ScreenMode) => void;
  setActiveFocus: (focus: FocusId) => void;
  updateActiveFocusWorkspace: (update: (workspace: FocusWorkspace) => FocusWorkspace) => void;
  importScreens: (screens: Screen[], strategy: ScreenImportStrategy) => number;
  saveActiveContent: (widgets: Widget[], favoriteWidgetIds: string[]) => void;
  hydrateActiveScreen: () => void;
}

const STORAGE_KEY = 'arcana_screens';

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `screen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneWidgets = (widgets: Widget[]): Widget[] =>
  widgets.map((widget) => ({
    ...widget,
    id: `${widget.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    position: { ...widget.position },
    size: { ...widget.size },
    columns: widget.columns?.map((column) => ({ ...column })),
    rows: widget.rows?.map((row) => ({ ...row })),
    combatants: widget.combatants?.map((combatant) => ({ ...combatant })),
    initiativeUndo: widget.initiativeUndo
      ? {
          ...widget.initiativeUndo,
          combatants: widget.initiativeUndo.combatants.map((combatant) => ({ ...combatant })),
        }
      : widget.initiativeUndo,
    captures: widget.captures?.map((capture) => ({ ...capture })),
    referenceLinks: widget.referenceLinks?.map((link) => ({ ...link })),
    results: widget.results ? [...widget.results] : undefined,
    rollBreakdown: widget.rollBreakdown ? [...widget.rollBreakdown] : undefined,
  }));

const createFocusWorkspaceForTemplate = (template: ScreenTemplate): FocusWorkspace => {
  const workspace = createDefaultFocusWorkspace();
  return {
    ...workspace,
    currentFocus: template === 'combat' ? 'combat' : null,
  };
};

const cloneFocusWorkspace = (workspace: FocusWorkspace): FocusWorkspace =>
  JSON.parse(JSON.stringify(workspace)) as FocusWorkspace;

const readLegacyWidgets = (): Widget[] | null => {
  try {
    const raw = localStorage.getItem('arcanaScreenLayout');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { widgets?: Widget[] } };
    return Array.isArray(parsed.state?.widgets) ? parsed.state.widgets : null;
  } catch {
    return null;
  }
};

interface LegacyProfile {
  id: string;
  name: string;
  layoutConfig: Widget[];
  favoriteWidgetIds?: string[];
}

const readLegacyProfiles = (): LegacyProfile[] => {
  try {
    const raw = localStorage.getItem('arcana_profiles');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegacyProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const createFallbackScreen = (): Screen => {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name: 'General Screen',
    template: 'general',
    mode: 'prepare',
    layoutConfig: createTemplateWidgets('general'),
    focusWorkspace: createFocusWorkspaceForTemplate('general'),
    favoriteWidgetIds: useAppStore.getState().favoriteWidgetIds,
    createdAt: now,
    updatedAt: now,
  };
};

const createInitialScreens = (): Screen[] => {
  const now = new Date().toISOString();
  const legacyWidgets = readLegacyWidgets();
  const legacyProfiles = readLegacyProfiles();
  const migratedProfiles = legacyProfiles.map((profile) => ({
    id: `migrated-${profile.id}-${createId()}`,
    name: profile.name || 'Imported Screen',
    template: 'general' as const,
    mode: 'prepare' as const,
    layoutConfig: Array.isArray(profile.layoutConfig) ? profile.layoutConfig : [],
    focusWorkspace: createFocusWorkspaceForTemplate('general'),
    favoriteWidgetIds: profile.favoriteWidgetIds ?? [],
    createdAt: now,
    updatedAt: now,
  }));

  if (legacyWidgets?.length) {
    return [
      {
        id: createId(),
        name: 'My Screen',
        template: 'general',
        mode: 'prepare',
        layoutConfig: legacyWidgets,
        focusWorkspace: createFocusWorkspaceForTemplate('general'),
        favoriteWidgetIds: useAppStore.getState().favoriteWidgetIds,
        createdAt: now,
        updatedAt: now,
      },
      ...migratedProfiles,
    ];
  }

  return migratedProfiles;
};

const initialScreens = createInitialScreens();
const initialScreen = initialScreens[0];

const applyScreen = (screen: Screen) => {
  useWidgetStore.getState().replaceWidgets(screen.layoutConfig.map(migrateToolInstance));
  useAppStore.getState().setFavorites(screen.favoriteWidgetIds);
};

export const useScreenStore = create<ScreenStoreState>()(
  persist(
    (set, get) => ({
      screens: initialScreens,
      activeScreenId: initialScreen?.id ?? '',

      createScreen: (name, template) => {
        get().saveActiveContent(
          useWidgetStore.getState().widgets,
          useAppStore.getState().favoriteWidgetIds,
        );

        const now = new Date().toISOString();
        const screen: Screen = {
          id: createId(),
          name: name.trim(),
          template,
          mode: 'prepare',
          layoutConfig: createTemplateWidgets(template),
          focusWorkspace: createFocusWorkspaceForTemplate(template),
          favoriteWidgetIds: useAppStore.getState().favoriteWidgetIds,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          screens: [screen, ...state.screens],
          activeScreenId: screen.id,
        }));
        applyScreen(screen);
        return screen.id;
      },

      openScreen: (id) => {
        const target = get().screens.find((screen) => screen.id === id);
        if (!target || id === get().activeScreenId) return;

        get().saveActiveContent(
          useWidgetStore.getState().widgets,
          useAppStore.getState().favoriteWidgetIds,
        );
        set({ activeScreenId: id });
        applyScreen(target);
      },

      renameScreen: (id, name) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        set((state) => ({
          screens: state.screens.map((screen) =>
            screen.id === id
              ? { ...screen, name: trimmedName, updatedAt: new Date().toISOString() }
              : screen,
          ),
        }));
      },

      duplicateScreen: (id) => {
        const source = get().screens.find((screen) => screen.id === id);
        if (!source) return null;

        get().saveActiveContent(
          useWidgetStore.getState().widgets,
          useAppStore.getState().favoriteWidgetIds,
        );
        const refreshedSource = get().screens.find((screen) => screen.id === id) ?? source;
        const now = new Date().toISOString();
        const duplicate: Screen = {
          ...refreshedSource,
          id: createId(),
          name: `${refreshedSource.name} copy`,
          layoutConfig: cloneWidgets(refreshedSource.layoutConfig),
          focusWorkspace: cloneFocusWorkspace(refreshedSource.focusWorkspace),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          screens: [duplicate, ...state.screens],
          activeScreenId: duplicate.id,
        }));
        applyScreen(duplicate);
        return duplicate.id;
      },

      deleteScreen: (id) => {
        const state = get();
        const index = state.screens.findIndex((screen) => screen.id === id);
        if (index < 0) return null;

        const deleted = state.screens[index];
        const remaining = state.screens.filter((screen) => screen.id !== id);
        let nextScreens = remaining;
        let nextActiveId = state.activeScreenId;

        if (remaining.length === 0) {
          const replacement = createFallbackScreen();
          nextScreens = [replacement];
          nextActiveId = replacement.id;
        } else if (state.activeScreenId === id) {
          nextActiveId = remaining[Math.min(index, remaining.length - 1)].id;
        }

        const deletion: DeletedScreen = {
          screen: deleted,
          index,
          wasActive: state.activeScreenId === id,
        };

        set({
          screens: nextScreens,
          activeScreenId: nextActiveId,
        });

        if (state.activeScreenId === id) {
          const next = nextScreens.find((screen) => screen.id === nextActiveId);
          if (next) applyScreen(next);
        }

        return deletion;
      },

      restoreDeletedScreen: (deleted) => {
        const screens = [...get().screens];
        screens.splice(Math.min(deleted.index, screens.length), 0, deleted.screen);
        set({
          screens,
          activeScreenId: deleted.wasActive ? deleted.screen.id : get().activeScreenId,
        });

        if (deleted.wasActive) applyScreen(deleted.screen);
        return deleted.screen;
      },

      setActiveMode: (mode) => {
        const activeId = get().activeScreenId;
        set((state) => ({
          screens: state.screens.map((screen) =>
            screen.id === activeId
              ? { ...screen, mode, updatedAt: new Date().toISOString() }
              : screen,
          ),
        }));
      },

      setActiveFocus: (focus) => {
        const activeId = get().activeScreenId;
        useTrustStore.getState().markSaving();
        set((state) => ({
          screens: state.screens.map((screen) =>
            screen.id === activeId
              ? {
                  ...screen,
                  focusWorkspace: switchFocus(screen.focusWorkspace, focus),
                  updatedAt: new Date().toISOString(),
                }
              : screen,
          ),
        }));
      },

      updateActiveFocusWorkspace: (update) => {
        const activeId = get().activeScreenId;
        useTrustStore.getState().markSaving();
        set((state) => ({
          screens: state.screens.map((screen) =>
            screen.id === activeId
              ? {
                  ...screen,
                  focusWorkspace: update(screen.focusWorkspace),
                  updatedAt: new Date().toISOString(),
                }
              : screen,
          ),
        }));
      },

      importScreens: (importedScreens, strategy) => {
        if (importedScreens.length === 0) return 0;
        const now = new Date().toISOString();
        const existingIds = new Set(get().screens.map((screen) => screen.id));
        const normalized = importedScreens.map((screen, index) => {
          const hasCollision = existingIds.has(screen.id);
          const id = strategy === 'merge' && hasCollision ? createId() : screen.id || createId();
          existingIds.add(id);
          return {
            ...screen,
            id,
            name: screen.name?.trim() || `Imported Screen ${index + 1}`,
            template: screen.template ?? 'general',
            mode: screen.mode ?? 'prepare',
            layoutConfig: screen.layoutConfig.map(migrateToolInstance),
            focusWorkspace: migrateFocusWorkspace(screen.focusWorkspace ?? createFocusWorkspaceForTemplate(screen.template ?? 'general')),
            favoriteWidgetIds: screen.favoriteWidgetIds ?? [],
            createdAt: screen.createdAt ?? now,
            updatedAt: now,
          };
        });

        if (strategy === 'replace') {
          set({ screens: normalized, activeScreenId: normalized[0].id });
          applyScreen(normalized[0]);
        } else {
          set((state) => ({ screens: [...normalized, ...state.screens] }));
        }

        return normalized.length;
      },

      saveActiveContent: (widgets, favoriteWidgetIds) => {
        const activeId = get().activeScreenId;
        set((state) => ({
          screens: state.screens.map((screen) =>
            screen.id === activeId
              ? {
                  ...screen,
                  layoutConfig: widgets,
                  favoriteWidgetIds,
                  updatedAt: new Date().toISOString(),
                }
              : screen,
          ),
        }));
      },

      hydrateActiveScreen: () => {
        const state = get();
        const active =
          state.screens.find((screen) => screen.id === state.activeScreenId) ??
          state.screens[0];
        if (!active) return;
        if (active.id !== state.activeScreenId) set({ activeScreenId: active.id });
        applyScreen(active);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 4,
      storage: createJSONStorage(() => safeLocalStorage),
      migrate: (persistedState) => {
        const state = persistedState as Pick<ScreenStoreState, 'screens' | 'activeScreenId'>;
        return {
          ...state,
          screens: state.screens.map((screen) => ({
            ...screen,
            mode: screen.mode ?? 'prepare',
            layoutConfig: screen.layoutConfig.map(migrateToolInstance),
            focusWorkspace: migrateFocusWorkspace(screen.focusWorkspace ?? createFocusWorkspaceForTemplate(screen.template ?? 'general')),
          })),
        };
      },
      partialize: (state) => ({
        screens: state.screens,
        activeScreenId: state.activeScreenId,
      }),
    },
  ),
);
