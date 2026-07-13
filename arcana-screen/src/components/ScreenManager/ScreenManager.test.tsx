import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useScreenStore } from '../../store/useScreenStore';
import { useWidgetStore } from '../../store/useWidgetStore';
import ScreenManager from './ScreenManager';

describe('ScreenManager', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
    useScreenStore.setState({ screens: [], activeScreenId: '' });
    useScreenStore.getState().createScreen('Cripta di Vhal', 'combat');
  });

  it('keeps Screen, workspace mode and management as separate controls', async () => {
    const user = userEvent.setup();
    render(<ScreenManager />);

    expect(screen.getByLabelText('Current screen')).toHaveValue(useScreenStore.getState().activeScreenId);
    expect(screen.getByRole('button', { name: 'Prepare' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(useScreenStore.getState().screens[0].mode).toBe('run');
    expect(screen.queryByRole('button', { name: 'Manage screens' })).not.toBeInTheDocument();
  });

  it('renames a Screen through the management surface', async () => {
    const user = userEvent.setup();
    render(<ScreenManager />);
    await user.click(screen.getByRole('button', { name: 'Manage screens' }));
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    const input = screen.getByLabelText('Screen name', { exact: true });
    await user.clear(input);
    await user.type(input, 'Cripta finale');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(useScreenStore.getState().screens[0].name).toBe('Cripta finale');
  });
});
