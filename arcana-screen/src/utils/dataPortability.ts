import { getToolDefinitionByType, migrateToolInstance } from '../components/widgets/toolRegistry';
import { useScreenStore, type Screen, type ScreenImportStrategy } from '../store/useScreenStore';
import { useThemeStore } from '../store/themeStore';
import {
  getRecoverySnapshots,
  INVALID_STORAGE_PREFIX,
  RECOVERY_STORAGE_KEY,
  SCREEN_STORAGE_KEY,
  type RecoverySnapshot,
} from './safeStorage';

const BACKUP_FORMAT = 'arcana-screen-backup';
const BACKUP_SCHEMA_VERSION = 1;

interface ArcanaBackup {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: string;
  data: {
    screens: Screen[];
    activeScreenId: string;
    theme: 'light' | 'dark';
  };
}

export interface ImportPreview {
  backup: ArcanaBackup;
  screenNames: string[];
  warnings: string[];
}

type ParseBackupResult =
  | { ok: true; preview: ImportPreview }
  | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const validateScreen = (value: unknown, index: number) => {
  if (!isRecord(value)) return `Screen ${index + 1} is not an object.`;
  if (typeof value.id !== 'string' || !value.id) return `Screen ${index + 1} has no valid id.`;
  if (typeof value.name !== 'string') return `Screen ${index + 1} has no valid name.`;
  if (!Array.isArray(value.layoutConfig)) return `Screen ${index + 1} has no valid tool list.`;
  for (const [toolIndex, tool] of value.layoutConfig.entries()) {
    if (!isRecord(tool) || typeof tool.id !== 'string' || typeof tool.type !== 'string') {
      return `Tool ${toolIndex + 1} in screen ${index + 1} is invalid.`;
    }
  }
  return null;
};

export const parseBackup = (text: string): ParseBackupResult => {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
      return { ok: false, error: 'This file is not an ArcanaScreen backup.' };
    }
    if (parsed.schemaVersion !== BACKUP_SCHEMA_VERSION) {
      return { ok: false, error: 'This backup version is not supported.' };
    }
    if (!isRecord(parsed.data) || !Array.isArray(parsed.data.screens)) {
      return { ok: false, error: 'The backup does not contain a valid screen collection.' };
    }
    if (
      typeof parsed.data.activeScreenId !== 'string' ||
      (parsed.data.theme !== 'light' && parsed.data.theme !== 'dark')
    ) {
      return { ok: false, error: 'The backup preferences are invalid.' };
    }
    if (parsed.data.screens.length === 0) {
      return { ok: false, error: 'The backup contains no screens.' };
    }

    for (const [index, screen] of parsed.data.screens.entries()) {
      const error = validateScreen(screen, index);
      if (error) return { ok: false, error };
    }

    const backup = parsed as unknown as ArcanaBackup;
    const warnings = backup.data.screens.flatMap((screen) =>
      screen.layoutConfig
        .filter((widget) => !getToolDefinitionByType(widget.type))
        .map((widget) => `Unknown tool “${widget.type}” in ${screen.name} will be preserved but not rendered.`),
    );

    return {
      ok: true,
      preview: {
        backup,
        screenNames: backup.data.screens.map((screen) => screen.name),
        warnings,
      },
    };
  } catch {
    return { ok: false, error: 'The selected file is not valid JSON.' };
  }
};

const triggerJsonDownload = (value: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

export const exportBackup = () => {
  const screenState = useScreenStore.getState();
  const backup: ArcanaBackup = {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      screens: screenState.screens,
      activeScreenId: screenState.activeScreenId,
      theme: useThemeStore.getState().theme,
    },
  };
  triggerJsonDownload(backup, `arcana-screen-backup-${new Date().toISOString().slice(0, 10)}.json`);
};

export const importBackup = (preview: ImportPreview, strategy: ScreenImportStrategy) => {
  const activeId = preview.backup.data.activeScreenId;
  const screens = [...preview.backup.data.screens];
  if (strategy === 'replace') {
    screens.sort((a, b) => Number(b.id === activeId) - Number(a.id === activeId));
  }
  const imported = useScreenStore.getState().importScreens(screens, strategy);
  const currentTheme = useThemeStore.getState().theme;
  if (preview.backup.data.theme && preview.backup.data.theme !== currentTheme) {
    useThemeStore.getState().toggleTheme();
  }
  return imported;
};

export const exportRawLocalData = () => {
  const data: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && (key.startsWith('arcana') || key === 'theme')) {
      data[key] = localStorage.getItem(key) ?? '';
    }
  }
  triggerJsonDownload(
    { exportedAt: new Date().toISOString(), data },
    `arcana-screen-raw-data-${new Date().toISOString().slice(0, 10)}.json`,
  );
};

export const listRecoverySnapshots = () => getRecoverySnapshots();

export const restoreRecoverySnapshot = (snapshot: RecoverySnapshot) => {
  try {
    const envelope = JSON.parse(snapshot.payload) as {
      state?: { screens?: Screen[]; activeScreenId?: string };
    };
    const screens = envelope.state?.screens;
    if (!Array.isArray(screens) || screens.length === 0) {
      return { ok: false as const, error: 'This recovery snapshot is invalid.' };
    }
    const normalized = screens.map((screen) => ({
      ...screen,
      layoutConfig: screen.layoutConfig.map(migrateToolInstance),
    }));
    const activeId = envelope.state?.activeScreenId;
    if (activeId) {
      normalized.sort((a, b) => Number(b.id === activeId) - Number(a.id === activeId));
    }
    useScreenStore.getState().importScreens(normalized, 'replace');
    return { ok: true as const, count: normalized.length };
  } catch {
    return { ok: false as const, error: 'This recovery snapshot could not be read.' };
  }
};

export const resetArcanaData = () => {
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (
      key &&
      (key.startsWith('arcana') ||
        key === SCREEN_STORAGE_KEY ||
        key === RECOVERY_STORAGE_KEY ||
        key.startsWith(INVALID_STORAGE_PREFIX))
    ) {
      keys.push(key);
    }
  }
  keys.forEach((key) => localStorage.removeItem(key));
};
