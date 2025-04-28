import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
  // Sync class on load
  ...(typeof window !== 'undefined' && (() => {
    const theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    return {};
  })()),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.body.classList.remove('dark-theme', 'light-theme');
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    return { theme: newTheme };
  }),
}));