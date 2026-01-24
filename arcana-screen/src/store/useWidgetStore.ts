// src/store/useWidgetStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TableColumn {
  id: number;
  key: string;
  label: string;
}

export interface TableRow {
  id: number;
  [key: string]: string | number;
}

export interface Combatant {
  id: number;
  name: string;
  initiative: number;
}

interface BaseWidget {
  id: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

export interface SimpleTableWidget extends BaseWidget {
  type: 'SimpleTable';
  columns: TableColumn[];
  rows: TableRow[];
}

export interface CountdownTimerWidget extends BaseWidget {
  type: 'CountdownTimer';
  seconds: number;
  isRunning: boolean;
}

export interface DiceRollerWidget extends BaseWidget {
  type: 'DiceRoller';
  diceType: number;
  numDice: number;
  modifier: number;
  advantage: 'none' | 'adv' | 'dis';
  formula: string;
  results: number[];
  finalResult: number | null;
}

export interface InitiativeTrackerWidget extends BaseWidget {
  type: 'InitiativeTracker';
  combatants: Combatant[];
  name: string;
  initiative: number;
  currentIndex: number | null;
  turnChangeAnimation: boolean;
}

export interface QuickNotesWidget extends BaseWidget {
  type: 'QuickNotes';
}

export type Widget =
  | SimpleTableWidget
  | CountdownTimerWidget
  | DiceRollerWidget
  | InitiativeTrackerWidget
  | QuickNotesWidget;

interface WidgetStore {
  widgets: Widget[];
  addWidget: (widget: Widget) => void;
  updateWidget: <T extends Widget>(id: string, updates: Partial<Omit<T, 'id'>>) => void;
  removeWidget: (id: string) => void;
  clearWidgets: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      addWidget: (widget) => set({ widgets: [...get().widgets, widget] }),
      updateWidget: (id, updates) =>
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, ...updates } as Widget : w
          ),
        }),
      removeWidget: (id) =>
        set({ widgets: get().widgets.filter((w) => w.id !== id) }),
      clearWidgets: () => set({ widgets: [] }),
    }),
    {
      name: 'arcanaScreenLayout', // Name of the key in localStorage
    }
  )
);