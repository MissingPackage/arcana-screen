// src/store/useWidgetStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useTrustStore } from './trustStore';
import { safeLocalStorage } from '../utils/safeStorage';

export interface TableColumn {
  id: number;
  key: string;
  label: string;
}

export interface TableRow {
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Dynamic columns require any type
}

export interface Combatant {
  id: number;
  name: string;
  initiative: number;
  tieBreaker?: number;
  currentHp?: number;
  maxHp?: number;
  tempHp?: number;
  conditions?: string;
}

export interface CaptureItem {
  id: string;
  text: string;
  createdAt: string;
  status: 'inbox' | 'kept' | 'promoted';
}

export interface ReferenceLink {
  id: string;
  label: string;
  url: string;
}

export interface InitiativeSnapshot {
  combatants: Combatant[];
  currentIndex: number | null;
  round: number;
}

export type WidgetDisplaySize = 'compact' | 'standard' | 'wide';

export interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  displaySize?: WidgetDisplaySize;
  schemaVersion?: number;
  // SimpleTable
  columns?: TableColumn[];
  rows?: TableRow[];
  // CountdownTimer
  seconds?: number;
  isRunning?: boolean;
  timerDurationSeconds?: number;
  timerEndAt?: number | null;
  // DiceRoller
  diceType?: number;
  numDice?: number;
  modifier?: number;
  advantage?: 'none' | 'adv' | 'dis';
  formula?: string;
  results?: number[];
  finalResult?: number | null;
  rollBreakdown?: string[];
  formulaError?: string;
  // InitiativeTracker
  combatants?: Combatant[];
  name?: string;
  initiative?: number;
  currentHp?: number;
  maxHp?: number;
  currentIndex?: number | null;
  round?: number;
  initiativeUndo?: InitiativeSnapshot | null;
  turnChangeAnimation?: boolean;
  // QuickNotes
  title?: string;
  text?: string;
  // QuickCapture
  captures?: CaptureItem[];
  // QuickReference
  referenceTitle?: string;
  referenceBody?: string;
  referenceLinks?: ReferenceLink[];
}

interface WidgetStore {
  widgets: Widget[];
  structuralHistory: Widget[][];
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  clearWidgets: () => void;
  replaceWidgets: (widgets: Widget[]) => void;
  moveWidget: (from: number, to: number) => void;
  setWidgetDisplaySize: (id: string, size: WidgetDisplaySize) => void;
  undoStructuralChange: () => void;
}

const withSnapshot = (widgets: Widget[], history: Widget[][]) =>
  [...history, widgets].slice(-20);

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      structuralHistory: [],
      addWidget: (widget) => {
        useTrustStore.getState().markSaving();
        set({
          widgets: [...get().widgets, widget],
          structuralHistory: withSnapshot(get().widgets, get().structuralHistory),
        });
      },
      updateWidget: (id, updates) => {
        useTrustStore.getState().markSaving();
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        });
      },
      removeWidget: (id) => {
        useTrustStore.getState().markSaving();
        set({
          widgets: get().widgets.filter((w) => w.id !== id),
          structuralHistory: withSnapshot(get().widgets, get().structuralHistory),
        });
      },
      clearWidgets: () => {
        useTrustStore.getState().markSaving();
        set({
          widgets: [],
          structuralHistory: withSnapshot(get().widgets, get().structuralHistory),
        });
      },
      replaceWidgets: (widgets) => set({ widgets, structuralHistory: [] }),
      moveWidget: (from, to) => {
        const widgets = get().widgets;
        if (from === to || from < 0 || to < 0 || from >= widgets.length || to >= widgets.length) {
          return;
        }
        useTrustStore.getState().markSaving();
        const reordered = [...widgets];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        set({
          widgets: reordered,
          structuralHistory: withSnapshot(widgets, get().structuralHistory),
        });
      },
      setWidgetDisplaySize: (id, size) => {
        const widgets = get().widgets;
        const widget = widgets.find((item) => item.id === id);
        if (!widget || (widget.displaySize ?? 'standard') === size) return;
        useTrustStore.getState().markSaving();
        set({
          widgets: widgets.map((item) =>
            item.id === id ? { ...item, displaySize: size } : item,
          ),
          structuralHistory: withSnapshot(widgets, get().structuralHistory),
        });
      },
      undoStructuralChange: () => {
        const history = get().structuralHistory;
        const previous = history[history.length - 1];
        if (!previous) return;
        useTrustStore.getState().markSaving();
        set({ widgets: previous, structuralHistory: history.slice(0, -1) });
      },
    }),
    {
      name: 'arcanaScreenLayout', // localStorage key
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ widgets: state.widgets }),
    }
  )
);
