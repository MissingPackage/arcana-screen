import { beforeEach, describe, expect, it } from 'vitest';
import { useScreenStore } from './useScreenStore';
import { useWidgetStore } from './useWidgetStore';

describe('Screen lifecycle and modes', () => {
  beforeEach(() => {
    localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
    useScreenStore.setState({ screens: [], activeScreenId: '' });
  });

  it('creates, renames, duplicates, deletes and restores without losing Focus state', () => {
    const id = useScreenStore.getState().createScreen('Original', 'combat');
    useScreenStore.getState().setActiveFocus('social');
    useScreenStore.getState().renameScreen(id, 'Vhal Social');
    const copyId = useScreenStore.getState().duplicateScreen(id);
    expect(copyId).not.toBeNull();
    expect(useScreenStore.getState().screens.find((item) => item.id === copyId)?.focusWorkspace.currentFocus).toBe('social');

    const deleted = useScreenStore.getState().deleteScreen(copyId!);
    expect(deleted?.screen.name).toBe('Vhal Social copy');
    if (!deleted) throw new Error('screen should be deleted');
    useScreenStore.getState().restoreDeletedScreen(deleted);
    expect(useScreenStore.getState().screens.some((item) => item.id === copyId)).toBe(true);
  });

  it('persists Prepare and Run as a Screen property', () => {
    const id = useScreenStore.getState().createScreen('Mode test', 'general');
    useScreenStore.getState().setActiveMode('run');
    expect(useScreenStore.getState().screens.find((item) => item.id === id)?.mode).toBe('run');
    useScreenStore.getState().setActiveMode('prepare');
    expect(useScreenStore.getState().screens.find((item) => item.id === id)?.mode).toBe('prepare');
  });

  it('stores M4 organization and independent device geometry', () => {
    const id = useScreenStore.getState().createScreen('Campaign hub', 'general');
    useScreenStore.getState().updateScreenOrganization(id, { folder: 'Vhal', tags: ['mystery', 'tier-2'] });
    useScreenStore.getState().setActiveLayoutMode('canvas');
    const widgetId = useWidgetStore.getState().widgets[0].id;
    useWidgetStore.getState().setWidgetGeometry(widgetId, 'mobile', { x: 12, y: 24, w: 320, h: 440 });

    const screen = useScreenStore.getState().screens.find((item) => item.id === id);
    expect(screen).toMatchObject({ folder: 'Vhal', tags: ['mystery', 'tier-2'], layoutMode: 'canvas' });
    expect(useWidgetStore.getState().widgets[0].deviceLayouts?.mobile).toEqual({ x: 12, y: 24, w: 320, h: 440 });
  });
});
