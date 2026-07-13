import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/safeStorage';

interface ThemeState {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  toggleTheme: () => void;
  toggleReducedMotion: () => void;
}

function applyThemeToDOM(theme: 'light' | 'dark') {
  document.body.classList.remove('dark-theme', 'light-theme');
  document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
}

function applyMotionToDOM(reducedMotion: boolean) {
  document.body.classList.toggle('reduce-motion', reducedMotion);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      reducedMotion: false,
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        applyThemeToDOM(newTheme);
        return { theme: newTheme };
      }),
      toggleReducedMotion: () => set((state) => {
        const reducedMotion = !state.reducedMotion;
        applyMotionToDOM(reducedMotion);
        return { reducedMotion };
      }),
    }),
    {
      name: 'arcana_theme',
      storage: createJSONStorage(() => safeLocalStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            applyThemeToDOM(state.theme);
            applyMotionToDOM(state.reducedMotion);
          }
        };
      },
    }
  )
);
