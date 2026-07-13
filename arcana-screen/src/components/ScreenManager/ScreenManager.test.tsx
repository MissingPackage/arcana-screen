import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useScreenStore } from '../../store/useScreenStore';
import { useWidgetStore } from '../../store/useWidgetStore';
import ScreenManager from './ScreenManager';
import { useEvolutionStore } from '../../store/useEvolutionStore';

describe('ScreenManager', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
    useEvolutionStore.setState({ personalTemplates: [], referencePacks: [], density: 'comfortable', locale: 'en', accentTheme: 'arcane', customAccent: '#6d4aa2' });
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

  it('organizes screens by folder and creates a reusable personal template', async () => {
    const user = userEvent.setup();
    render(<ScreenManager />);
    await user.click(screen.getByRole('button', { name: 'Manage screens' }));
    await user.type(screen.getByLabelText('Folder for Cripta di Vhal'), 'Campaign Alpha');
    await user.tab();
    await user.type(screen.getByLabelText('Search names, folders or tags'), 'Campaign Alpha');

    expect(screen.getByText('Cripta di Vhal', { selector: 'strong' })).toBeInTheDocument();
    expect(useScreenStore.getState().screens[0].folder).toBe('Campaign Alpha');

    await user.click(screen.getByRole('button', { name: 'Save current as template' }));
    expect(useEvolutionStore.getState().personalTemplates).toHaveLength(1);
    expect(screen.getByText('Manage personal templates (1)')).toBeInTheDocument();
  });
});
