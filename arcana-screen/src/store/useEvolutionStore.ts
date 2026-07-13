import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FocusWorkspace } from '../domain/focusModel';
import type { ReferenceLink, Widget } from './useWidgetStore';
import type { Screen } from './useScreenStore';
import { safeLocalStorage } from '../utils/safeStorage';

export type AppDensity = 'comfortable' | 'compact';
export type AppLocale = 'en' | 'it';
export type AccentTheme = 'arcane' | 'ember' | 'forest' | 'custom';

export interface PersonalScreenTemplate {
  id: string;
  name: string;
  description: string;
  layoutConfig: Widget[];
  focusWorkspace: FocusWorkspace;
  layoutMode?: Screen['layoutMode'];
  createdAt: string;
}

export interface ReferencePack {
  id: string;
  name: string;
  links: ReferenceLink[];
  createdAt: string;
}

interface EvolutionState {
  personalTemplates: PersonalScreenTemplate[];
  referencePacks: ReferencePack[];
  density: AppDensity;
  locale: AppLocale;
  accentTheme: AccentTheme;
  customAccent: string;
  savePersonalTemplate: (screen: Pick<Screen, 'name' | 'layoutConfig' | 'focusWorkspace' | 'layoutMode'>, name?: string) => string;
  deletePersonalTemplate: (id: string) => void;
  importPersonalTemplates: (templates: PersonalScreenTemplate[]) => number;
  saveReferencePack: (name: string, links: ReferenceLink[]) => string;
  deleteReferencePack: (id: string) => void;
  setDensity: (density: AppDensity) => void;
  setLocale: (locale: AppLocale) => void;
  setAccentTheme: (theme: AccentTheme) => void;
  setCustomAccent: (color: string) => void;
}

const createId = (prefix: string) =>
  globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const useEvolutionStore = create<EvolutionState>()(
  persist(
    (set) => ({
      personalTemplates: [],
      referencePacks: [],
      density: 'comfortable',
      locale: 'en',
      accentTheme: 'arcane',
      customAccent: '#6d4aa2',

      savePersonalTemplate: (screen, name) => {
        const id = createId('template');
        const template: PersonalScreenTemplate = {
          id,
          name: name?.trim() || `${screen.name} template`,
          description: `Personal setup with ${screen.layoutConfig.length} tools`,
          layoutConfig: clone(screen.layoutConfig),
          focusWorkspace: clone(screen.focusWorkspace),
          layoutMode: screen.layoutMode,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ personalTemplates: [template, ...state.personalTemplates] }));
        return id;
      },

      deletePersonalTemplate: (id) => set((state) => ({
        personalTemplates: state.personalTemplates.filter((template) => template.id !== id),
      })),

      importPersonalTemplates: (templates) => {
        const valid = templates.filter((template) =>
          template && typeof template.name === 'string' && Array.isArray(template.layoutConfig) && template.focusWorkspace,
        ).map((template) => ({
          ...clone(template),
          id: createId('template'),
          createdAt: new Date().toISOString(),
        }));
        set((state) => ({ personalTemplates: [...valid, ...state.personalTemplates] }));
        return valid.length;
      },

      saveReferencePack: (name, links) => {
        const id = createId('reference-pack');
        const pack: ReferencePack = {
          id,
          name: name.trim() || 'Reference pack',
          links: clone(links),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ referencePacks: [pack, ...state.referencePacks] }));
        return id;
      },

      deleteReferencePack: (id) => set((state) => ({
        referencePacks: state.referencePacks.filter((pack) => pack.id !== id),
      })),

      setDensity: (density) => set({ density }),
      setLocale: (locale) => set({ locale }),
      setAccentTheme: (accentTheme) => set({ accentTheme }),
      setCustomAccent: (customAccent) => set({ customAccent, accentTheme: 'custom' }),
    }),
    {
      name: 'arcana_evolution',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<EvolutionState>;
        return {
          ...state,
          personalTemplates: state.personalTemplates ?? [],
          referencePacks: state.referencePacks ?? [],
          density: state.density ?? 'comfortable',
          locale: state.locale ?? 'en',
          accentTheme: state.accentTheme ?? 'arcane',
          customAccent: state.customAccent ?? '#6d4aa2',
        } as EvolutionState;
      },
    },
  ),
);
