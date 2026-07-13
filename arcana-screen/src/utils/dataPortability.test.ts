import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultFocusWorkspace } from '../domain/focusModel';
import { useScreenStore, type Screen } from '../store/useScreenStore';
import { importBackup, parseBackup } from './dataPortability';

const screen: Screen = {
  id: 'screen-1',
  name: 'Recovered Vhal',
  template: 'general',
  mode: 'run',
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

describe('data portability', () => {
  beforeEach(() => {
    localStorage.clear();
    useScreenStore.setState({ screens: [], activeScreenId: '' });
  });

  it('previews a complete backup including Focus state without mutating the store', () => {
    const result = parseBackup(backupText([screen]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preview.screenNames).toEqual(['Recovered Vhal']);
    expect(result.preview.backup.data.screens[0].focusWorkspace.currentFocus).toBe('narrative');
    expect(useScreenStore.getState().screens).toEqual([]);
  });

  it('rejects invalid payloads and imports only after explicit confirmation', () => {
    expect(parseBackup('{"format":"other"}')).toEqual({ ok: false, error: 'This file is not an ArcanaScreen backup.' });
    const result = parseBackup(backupText([screen]));
    if (!result.ok) throw new Error('fixture must parse');
    expect(importBackup(result.preview, 'replace')).toBe(1);
    expect(useScreenStore.getState().screens[0].name).toBe('Recovered Vhal');
    expect(useScreenStore.getState().screens[0].focusWorkspace.contexts.social.sceneClock).toBe(3);
  });
});
