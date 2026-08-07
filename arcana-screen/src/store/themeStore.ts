import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeLocalStorage } from '../utils/safeStorage';

interface ThemeState {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  toggleTheme: () => void;
  toggleReducedMotion: () => void;
}

/**
 * WebKit does not re-resolve a descendant's var() when a custom property
 * changes on an ancestor. After the theme class flips, body already carries the
 * new token values, but elements rendered before the flip keep their old
 * resolved colour - the Prepare grid ends up light ink on dark surfaces, and
 * stays that way until a reload (docket D17).
 *
 * Detaching and re-attaching body is the only remedy that works: eight others
 * were measured and failed (theme class on html, dummy custom property on html
 * or body, a bare offsetHeight read, getComputedStyle read, re-appended
 * <style>, class remove+re-add, `contain: style`, toggling
 * styleSheets.disabled).
 *
 * DO NOT DELETE the offsetHeight read below. A bare read is useless (it is in
 * the failed list above), but the read *between* the two display writes is what
 * forces the flush while body is detached - remove it and the two writes
 * coalesce, no re-attach happens, and WebKit goes back to stale ink. Measured:
 * without that line the dark axe gate fails on webkit-desktop.
 *
 * Focus, text selection and inner scroll positions all survive the remedy -
 * verified on Chromium, Firefox and WebKit desktop plus Chromium mobile. Note
 * this runs on every theme toggle AND on every page load, since the persist
 * middleware calls applyThemeToDOM from onRehydrateStorage; the startup
 * performance gate covers that path and stays green.
 */
function forceStyleReresolution() {
  const { body } = document;
  const previousDisplay = body.style.display;
  body.style.display = 'none';
  void body.offsetHeight;
  body.style.display = previousDisplay;
}

function applyThemeToDOM(theme: 'light' | 'dark') {
  document.body.classList.remove('dark-theme', 'light-theme');
  document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
  forceStyleReresolution();
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
