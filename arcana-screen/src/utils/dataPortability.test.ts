import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultFocusWorkspace } from '../domain/focusModel';
import { useScreenStore, type Screen } from '../store/useScreenStore';
import { describeImport, importBackup, listRecoverySnapshots, parseBackup, restoreRecoverySnapshot } from './dataPortability';
import { useEvolutionStore } from '../store/useEvolutionStore';
import { usePartyStore } from '../store/usePartyStore';
import { useThemeStore } from '../store/themeStore';

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

  it('merges without replacing the party, the preferences or the theme', () => {
    // "Merge with current screens" used to overwrite the roster, density, locale,
    // accent and theme too, and recovery snapshots only cover screens: merging
    // another DM's backup lost your party for good (docket D41).
    usePartyStore.getState().setMembers([{ id: 'pc-local', name: 'Lira Voss' }]);
    useEvolutionStore.setState({ density: 'comfortable', locale: 'en', accentTheme: 'arcane' });
    const themeBefore = useThemeStore.getState().theme;
    const payload = JSON.parse(backupText([screen]));
    payload.schemaVersion = 3;
    payload.data.theme = themeBefore === 'dark' ? 'light' : 'dark';
    payload.data.party = [{ id: 'pc-other', name: 'Ser Kael' }];
    payload.data.evolution = {
      personalTemplates: [],
      referencePacks: [{ id: 'pack-1', name: 'Rules', links: [], createdAt: '2026-07-13T11:00:00.000Z' }],
      density: 'compact',
      locale: 'it',
      accentTheme: 'forest',
      customAccent: '#6d4aa2',
    };
    const result = parseBackup(JSON.stringify(payload));
    if (!result.ok) throw new Error('fixture must parse');
    importBackup(result.preview, 'merge');

    expect(usePartyStore.getState().members.map((member) => member.name)).toEqual(['Lira Voss', 'Ser Kael']);
    expect(useEvolutionStore.getState()).toMatchObject({ density: 'comfortable', locale: 'en', accentTheme: 'arcane' });
    expect(useEvolutionStore.getState().referencePacks.map((pack) => pack.name)).toEqual(['Rules']);
    expect(useThemeStore.getState().theme).toBe(themeBefore);
  });

  it('brings the party and preferences back when a snapshot is restored after a replace', () => {
    // Snapshots used to hold screens only: a replace import (or a restore) lost the
    // party roster and preferences for good (docket D42).
    useScreenStore.getState().importScreens([{ ...screen, id: 'mine', name: 'My table' }], 'replace');
    usePartyStore.getState().setMembers([{ id: 'pc-local', name: 'Lira Voss' }]);
    useEvolutionStore.setState({ density: 'compact', locale: 'it' });
    const themeBefore = useThemeStore.getState().theme;

    const payload = JSON.parse(backupText([screen]));
    payload.schemaVersion = 3;
    payload.data.theme = themeBefore === 'dark' ? 'light' : 'dark';
    payload.data.party = [{ id: 'pc-other', name: 'Ser Kael' }];
    payload.data.evolution = { personalTemplates: [], referencePacks: [], density: 'comfortable', locale: 'en', accentTheme: 'arcane', customAccent: '#6d4aa2' };
    const result = parseBackup(JSON.stringify(payload));
    if (!result.ok) throw new Error('fixture must parse');
    importBackup(result.preview, 'replace');
    expect(usePartyStore.getState().members.map((member) => member.name)).toEqual(['Ser Kael']);

    const restored = restoreRecoverySnapshot(listRecoverySnapshots()[0]);
    expect(restored.ok).toBe(true);
    expect(useScreenStore.getState().screens.map((item) => item.name)).toEqual(['My table']);
    expect(usePartyStore.getState().members.map((member) => member.name)).toEqual(['Lira Voss']);
    expect(useEvolutionStore.getState()).toMatchObject({ density: 'compact', locale: 'it' });
    expect(useThemeStore.getState().theme).toBe(themeBefore);
  });

  it('says what each strategy will do before the import runs', () => {
    usePartyStore.getState().setMembers([{ id: 'pc-local', name: 'Lira Voss' }, { id: 'pc-2', name: 'Halric' }]);
    const payload = JSON.parse(backupText([screen]));
    payload.schemaVersion = 3;
    payload.data.party = [{ id: 'pc-other', name: 'Ser Kael' }];
    const result = parseBackup(JSON.stringify(payload));
    if (!result.ok) throw new Error('fixture must parse');

    expect(describeImport(result.preview, 'merge', 2)).toBe(
      'Adds 1 screen and 1 character to your party. Your party, preferences and theme stay as they are.',
    );
    expect(describeImport(result.preview, 'replace', 2)).toBe(
      'Replaces all your screens with 1 screen, your party (2 characters, replaced by 1) and your theme. A recovery snapshot can bring back what you had.',
    );
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
