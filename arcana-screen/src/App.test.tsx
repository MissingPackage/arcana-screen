import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { useScreenStore } from './store/useScreenStore';
import { useThemeStore } from './store/themeStore';

// The header's theme and motion controls had store tests only; this is the component
// level of the acceptance matrix row Theme/reduced motion.
describe('App header theme and motion controls', () => {
  beforeEach(() => {
    localStorage.clear();
    useScreenStore.setState({ screens: [], activeScreenId: '' });
    useScreenStore.getState().createScreen('Vhal Streets', 'general');
    useThemeStore.setState({ theme: 'light', reducedMotion: false });
    document.body.className = 'light-theme';
  });

  it('switches the theme from the header and names the next action', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
    expect(document.body).toHaveClass('dark-theme');
    expect(screen.getByRole('button', { name: 'Use light theme' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Use light theme' }));
    expect(document.body).toHaveClass('light-theme');
  });

  it('reduces interface motion from Help and resources, with a pressed state', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Help and resources', { selector: 'summary' }));
    const reduce = screen.getByRole('button', { name: 'Reduce interface motion' });
    expect(reduce).toHaveAttribute('aria-pressed', 'false');
    await user.click(reduce);
    expect(document.body).toHaveClass('reduce-motion');
    expect(screen.getByRole('button', { name: 'Enable interface motion' })).toHaveAttribute('aria-pressed', 'true');
  });
});
