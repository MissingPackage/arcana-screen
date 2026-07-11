import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  // Favorites
  favoriteWidgetIds: string[];
  toggleFavorite: (id: string) => void;
  setFavorites: (ids: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      // Favorites
      favoriteWidgetIds: [],
      toggleFavorite: (id: string) => set((state) => {
        const isFav = state.favoriteWidgetIds.includes(id);
        const newFavs = isFav
          ? state.favoriteWidgetIds.filter(favId => favId !== id)
          : [...state.favoriteWidgetIds, id];
        return { favoriteWidgetIds: newFavs };
      }),
      setFavorites: (ids: string[]) => set({ favoriteWidgetIds: ids }),
    }),
    { name: 'arcana_app_state' }
  )
);