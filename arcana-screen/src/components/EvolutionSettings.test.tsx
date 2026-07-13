import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEvolutionStore } from '../store/useEvolutionStore';
import EvolutionSettings from './EvolutionSettings';

const state = () => useEvolutionStore.getState();

async function openSettings() {
  const user = userEvent.setup();
  render(<EvolutionSettings />);
  await user.click(screen.getByText('Appearance & language')); // open the <details>
  return user;
}

describe('EvolutionSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    useEvolutionStore.setState({
      personalTemplates: [], referencePacks: [], density: 'comfortable',
      locale: 'en', accentTheme: 'arcane', customAccent: '#6d4aa2',
    });
  });

  it('changes UI density', async () => {
    const user = await openSettings();
    await user.selectOptions(screen.getByLabelText('Density'), 'compact');
    expect(state().density).toBe('compact');
  });

  it('switches language and localizes the labels', async () => {
    const user = await openSettings();
    await user.selectOptions(screen.getByLabelText('Language'), 'it');
    expect(state().locale).toBe('it');
    expect(screen.getByText('Aspetto e lingua')).toBeInTheDocument();
  });

  it('changes the accent theme', async () => {
    const user = await openSettings();
    await user.selectOptions(screen.getByLabelText('Accent theme'), 'forest');
    expect(state().accentTheme).toBe('forest');
  });

  it('updates the custom accent color', async () => {
    await openSettings();
    fireEvent.change(screen.getByLabelText('Custom color'), { target: { value: '#00ff88' } });
    expect(state().customAccent).toBe('#00ff88');
  });

  it('states that cloud sync is off', async () => {
    await openSettings();
    expect(screen.getByText('Cloud sync is off')).toBeInTheDocument();
  });
});
