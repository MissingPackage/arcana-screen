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
  [key: string]: any;
}

export interface Combatant {
  id: number;
  name: string;
  initiative: number;
}

export interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  // SimpleTable
  columns?: TableColumn[];
  rows?: TableRow[];
  // CountdownTimer
  seconds?: number;
  isRunning?: boolean;
  // DiceRoller
  diceType?: number;
  numDice?: number;
  modifier?: number;
  advantage?: 'none' | 'adv' | 'dis';
  formula?: string;
  results?: number[];
  finalResult?: number | null;
  // InitiativeTracker
  combatants?: Combatant[];
  name?: string;
  initiative?: number;
  currentIndex?: number | null;
  turnChangeAnimation?: boolean;
}

interface WidgetStore {
  widgets: Widget[];
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
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
            w.id === id ? { ...w, ...updates } : w
          ),
        }),
      removeWidget: (id) =>
        set({ widgets: get().widgets.filter((w) => w.id !== id) }),
      clearWidgets: () => set({ widgets: [] }),
    }),
    {
      name: 'arcanaScreenLayout', // Nome della chiave in localStorage
    }
  )
);