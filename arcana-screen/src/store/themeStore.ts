import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function applyThemeToDOM(theme: 'light' | 'dark') {
  document.body.classList.remove('dark-theme', 'light-theme');
  document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        applyThemeToDOM(newTheme);
        return { theme: newTheme };
      }),
    }),
    {
      name: 'arcana_theme',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            applyThemeToDOM(state.theme);
          }
        };
      },
    }
  )
);
