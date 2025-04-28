import { create } from 'zustand';

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  // Preferiti
  favoriteWidgetIds: string[];
  toggleFavorite: (id: string) => void;
  setFavorites: (ids: string[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  // Preferiti
  favoriteWidgetIds: (() => {
    try {
      const stored = localStorage.getItem('arcana_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  toggleFavorite: (id: string) => set((state) => {
    const isFav = state.favoriteWidgetIds.includes(id);
    const newFavs = isFav
      ? state.favoriteWidgetIds.filter(favId => favId !== id)
      : [...state.favoriteWidgetIds, id];
    localStorage.setItem('arcana_favorites', JSON.stringify(newFavs));
    return { favoriteWidgetIds: newFavs };
  }),
  setFavorites: (ids: string[]) => {
    localStorage.setItem('arcana_favorites', JSON.stringify(ids));
    set({ favoriteWidgetIds: ids });
  },
}));