import type { StateStorage } from 'zustand/middleware';
import { useTrustStore } from '../store/trustStore';

export const SCREEN_STORAGE_KEY = 'arcana_screens';
export const RECOVERY_STORAGE_KEY = 'arcana_recovery_snapshots';
export const INVALID_STORAGE_PREFIX = 'arcana_invalid_payload_';

export interface RecoverySnapshot {
  id: string;
  createdAt: string;
  payload: string;
}

const MAX_RECOVERY_SNAPSHOTS = 5;

const storageErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return 'Local storage is full. Export your data before making more changes.';
  }
  return 'ArcanaScreen could not save locally. Your current session remains open.';
};

const isValidScreenEnvelope = (raw: string) => {
  try {
    const parsed = JSON.parse(raw) as {
      state?: { screens?: unknown; activeScreenId?: unknown };
    };
    const screensAreValid =
      Array.isArray(parsed?.state?.screens) &&
      parsed.state.screens.length > 0 &&
      parsed.state.screens.every(
        (screen) =>
          typeof screen === 'object' &&
          screen !== null &&
          typeof (screen as { id?: unknown }).id === 'string' &&
          Array.isArray((screen as { layoutConfig?: unknown }).layoutConfig),
      );

    return Boolean(
      parsed &&
      parsed.state &&
      screensAreValid &&
      typeof parsed.state.activeScreenId === 'string',
    );
  } catch {
    return false;
  }
};

const archiveInvalidPayload = (raw: string) => {
  try {
    localStorage.setItem(`${INVALID_STORAGE_PREFIX}${Date.now()}`, raw);
  } catch {
    // The original payload remains available under its existing key.
  }
};

const readRecoverySnapshots = (): RecoverySnapshot[] => {
  try {
    const raw = localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecoverySnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const captureRecoverySnapshot = (previousPayload: string, nextPayload: string) => {
  if (previousPayload === nextPayload || !isValidScreenEnvelope(previousPayload)) return;

  const snapshots = readRecoverySnapshots();
  if (snapshots[0]?.payload === previousPayload) return;

  const snapshot: RecoverySnapshot = {
    id: globalThis.crypto?.randomUUID?.() ?? `recovery-${Date.now()}`,
    createdAt: new Date().toISOString(),
    payload: previousPayload,
  };
  localStorage.setItem(
    RECOVERY_STORAGE_KEY,
    JSON.stringify([snapshot, ...snapshots].slice(0, MAX_RECOVERY_SNAPSHOTS)),
  );
};

export const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (name === SCREEN_STORAGE_KEY && raw && !isValidScreenEnvelope(raw)) {
        archiveInvalidPayload(raw);
        useTrustStore.getState().markError(
          'Stored screen data was invalid. ArcanaScreen opened a safe fallback.',
        );
        return null;
      }
      return raw;
    } catch (error) {
      useTrustStore.getState().markError(storageErrorMessage(error));
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (name === SCREEN_STORAGE_KEY) {
        const previous = localStorage.getItem(name);
        if (previous) {
          try {
            captureRecoverySnapshot(previous, value);
          } catch {
            // A full recovery ring must not prevent the primary save from succeeding.
          }
        }
      }
      localStorage.setItem(name, value);
      if (name === SCREEN_STORAGE_KEY) useTrustStore.getState().markSaved();
    } catch (error) {
      useTrustStore.getState().markError(storageErrorMessage(error));
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      useTrustStore.getState().markError(storageErrorMessage(error));
    }
  },
};

export const getRecoverySnapshots = () => readRecoverySnapshots();

export const verifyStorageHealth = () => {
  const key = 'arcana_storage_health_check';
  try {
    localStorage.setItem(key, 'ok');
    const passed = localStorage.getItem(key) === 'ok';
    localStorage.removeItem(key);
    if (!passed) throw new Error('Storage read-back failed');
    useTrustStore.getState().clearError();
    return { ok: true as const };
  } catch (error) {
    const message = storageErrorMessage(error);
    useTrustStore.getState().markError(message);
    return { ok: false as const, message };
  }
};
