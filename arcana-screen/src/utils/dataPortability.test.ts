import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultFocusWorkspace } from '../domain/focusModel';
import { useScreenStore, type Screen } from '../store/useScreenStore';
import { importBackup, parseBackup } from './dataPortability';
import { useEvolutionStore } from '../store/useEvolutionStore';
import { usePartyStore } from '../store/usePartyStore';

const screen: Screen = {
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

describe('data portability', () => {
  beforeEach(() => {
    localStorage.clear();
    useScreenStore.setState({ screens: [], activeScreenId: '' });
    useEvolutionStore.setState({ personalTemplates: [], referencePacks: [], density: 'comfortable', locale: 'en', accentTheme: 'arcane', customAccent: '#6d4aa2' });
    usePartyStore.setState({ members: [] });
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

  it('restores M4 reusable content and appearance from schema 2 backups', () => {
    const payload = JSON.parse(backupText([screen]));
    payload.schemaVersion = 2;
    payload.data.evolution = {
      personalTemplates: [],
      referencePacks: [{ id: 'pack-1', name: 'Rules', links: [], createdAt: '2026-07-13T11:00:00.000Z' }],
      density: 'compact',
      locale: 'it',
      accentTheme: 'forest',
      customAccent: '#6d4aa2',
    };
    const result = parseBackup(JSON.stringify(payload));
    if (!result.ok) throw new Error('schema 2 fixture must parse');
    importBackup(result.preview, 'replace');
    expect(useEvolutionStore.getState()).toMatchObject({ density: 'compact', locale: 'it', accentTheme: 'forest' });
    expect(useEvolutionStore.getState().referencePacks[0].name).toBe('Rules');
  });

  it('round-trips the party roster and sanitizes it (schema 3)', () => {
    const payload = JSON.parse(backupText([screen]));
    payload.schemaVersion = 3;
    payload.data.party = [{ name: 'Ser Kael', ac: 18, maxHp: 24, hp: 24, initMod: 3 }];
    const result = parseBackup(JSON.stringify(payload));
    if (!result.ok) throw new Error('schema 3 fixture must parse');
    importBackup(result.preview, 'replace');
    expect(usePartyStore.getState().members).toHaveLength(1);
    expect(usePartyStore.getState().members[0]).toMatchObject({ name: 'Ser Kael', ac: 18, kind: 'pc', origin: 'mine' });
  });
});
