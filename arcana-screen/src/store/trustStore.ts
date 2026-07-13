import { create } from 'zustand';

export type SaveStatus = 'saved' | 'saving' | 'error';

interface TrustState {
  status: SaveStatus;
  message: string | null;
  lastSavedAt: string | null;
  markSaving: () => void;
  markSaved: () => void;
  markError: (message: string) => void;
  clearError: () => void;
}

export const useTrustStore = create<TrustState>((set) => ({
  status: 'saved',
  message: null,
  lastSavedAt: null,
  markSaving: () => set((state) => (
    state.status === 'error' ? state : { status: 'saving', message: null }
  )),
  markSaved: () => set((state) => (
    state.status === 'error'
      ? state
      : {
          status: 'saved',
          message: null,
          lastSavedAt: new Date().toISOString(),
        }
  )),
  markError: (message) => set({ status: 'error', message }),
  clearError: () => set({ status: 'saved', message: null }),
}));
