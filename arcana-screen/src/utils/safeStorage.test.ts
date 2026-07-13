import { beforeEach, describe, expect, it } from 'vitest';
import { getRecoverySnapshots, INVALID_STORAGE_PREFIX, safeLocalStorage } from './safeStorage';
import { useTrustStore } from '../store/trustStore';

const envelope = (id: string) => JSON.stringify({ state: { screens: [{ id, layoutConfig: [] }], activeScreenId: id }, version: 3 });

describe('safe local storage', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrustStore.setState({ status: 'saved', message: null, lastSavedAt: null });
  });

  it('archives an invalid payload instead of hydrating it', () => {
    localStorage.setItem('arcana_screens', '{"broken":true}');
    expect(safeLocalStorage.getItem('arcana_screens')).toBeNull();
    expect(useTrustStore.getState().status).toBe('error');
    expect(Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).some((key) => key?.startsWith(INVALID_STORAGE_PREFIX))).toBe(true);
  });

  it('keeps the previous valid payload as a recovery snapshot before overwriting', () => {
    safeLocalStorage.setItem('arcana_screens', envelope('one'));
    safeLocalStorage.setItem('arcana_screens', envelope('two'));
    const snapshots = getRecoverySnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].payload).toBe(envelope('one'));
    expect(localStorage.getItem('arcana_screens')).toBe(envelope('two'));
  });
});
