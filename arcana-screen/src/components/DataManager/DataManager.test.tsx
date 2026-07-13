import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultFocusWorkspace } from '../../domain/focusModel';
import { useScreenStore, type Screen } from '../../store/useScreenStore';
import { useEvolutionStore } from '../../store/useEvolutionStore';
import DataManager from './DataManager';

const screenFixture: Screen = {
  id: 'screen-1',
  name: 'Recovered Vhal',
  template: 'general',
  mode: 'run',
  folder: '',
  archived: false,
  tags: [],
  layoutMode: 'grid',
  layoutConfig: [],
  focusWorkspace: createDefaultFocusWorkspace(),
  favoriteWidgetIds: [],
  createdAt: '2026-07-13T10:00:00.000Z',
  updatedAt: '2026-07-13T10:00:00.000Z',
};

const backupText = (screens: Screen[]) => JSON.stringify({
  format: 'arcana-screen-backup',
  schemaVersion: 1,
  exportedAt: '2026-07-13T11:00:00.000Z',
  data: { screens, activeScreenId: screens[0]?.id ?? '', theme: 'light' },
});

async function openManager() {
  const user = userEvent.setup();
  render(<DataManager />);
  await user.click(screen.getByRole('button', { name: 'Data & recovery' }));
  expect(screen.getByRole('dialog', { name: 'Data and recovery' })).toBeInTheDocument();
  return user;
}

// userEvent.type treats "{" and "[" as special sequences, so paste JSON literally.
async function pasteBackup(user: ReturnType<typeof userEvent.setup>, json: string) {
  await user.click(screen.getByText('Paste backup JSON')); // open the <details>
  const textarea = screen.getByLabelText('Backup JSON');
  await user.click(textarea);
  await user.paste(json);
  await user.click(screen.getByRole('button', { name: 'Preview pasted backup' }));
}

describe('DataManager', () => {
  beforeEach(() => {
    localStorage.clear();
    useScreenStore.setState({ screens: [], activeScreenId: '' });
    useEvolutionStore.setState({
      personalTemplates: [], referencePacks: [], density: 'comfortable',
      locale: 'en', accentTheme: 'arcane', customAccent: '#6d4aa2',
    });
  });

  it('opens and closes the dialog', async () => {
    const user = await openManager();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('rejects an invalid pasted backup without importing', async () => {
    const user = await openManager();
    await pasteBackup(user, '{"format":"other"}');
    expect(screen.getByRole('alert')).toHaveTextContent('not an ArcanaScreen backup');
    expect(useScreenStore.getState().screens).toEqual([]);
  });

  it('previews then imports a valid backup only after confirmation', async () => {
    const user = await openManager();
    await pasteBackup(user, backupText([screenFixture]));

    expect(screen.getByText('Recovered Vhal')).toBeInTheDocument();
    expect(useScreenStore.getState().screens).toEqual([]); // nothing imported yet

    await user.click(screen.getByRole('button', { name: 'Confirm import' }));
    expect(useScreenStore.getState().screens.map((s) => s.name)).toContain('Recovered Vhal');
  });

  it('requires two steps to reset local data', async () => {
    const user = await openManager();
    await user.click(screen.getByRole('button', { name: 'Reset local data' }));
    expect(screen.getByRole('button', { name: 'Confirm local reset' })).toBeInTheDocument();
    expect(screen.getByText(/removes ArcanaScreen data/i)).toBeInTheDocument();
  });
});
