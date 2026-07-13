import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './themeStore';

describe('visual settings', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    useThemeStore.setState({ theme: 'light', reducedMotion: false });
  });

  it('applies and persists the selected theme', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.body).toHaveClass('dark-theme');
    expect(localStorage.getItem('arcana_theme')).toContain('dark');
  });

  it('applies and persists reduced motion', () => {
    useThemeStore.getState().toggleReducedMotion();
    expect(useThemeStore.getState().reducedMotion).toBe(true);
    expect(document.body).toHaveClass('reduce-motion');
    expect(localStorage.getItem('arcana_theme')).toContain('reducedMotion');
  });
});
