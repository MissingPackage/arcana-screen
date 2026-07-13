import { beforeEach, describe, expect, it } from 'vitest';
import { useScreenStore } from './useScreenStore';
import { useWidgetStore } from './useWidgetStore';

describe('Screen Focus persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWidgetStore.setState({ widgets: [], structuralHistory: [] });
    useScreenStore.setState({ screens: [], activeScreenId: '' });
  });

  it('creates Combat with Combat Focus and General without a forced Focus', () => {
    const combatId = useScreenStore.getState().createScreen('Combat test', 'combat');
    const combat = useScreenStore.getState().screens.find((screen) => screen.id === combatId);
    expect(combat?.focusWorkspace.currentFocus).toBe('combat');

    const generalId = useScreenStore.getState().createScreen('General test', 'general');
    const general = useScreenStore.getState().screens.find((screen) => screen.id === generalId);
    expect(general?.focusWorkspace.currentFocus).toBeNull();
  });

  it('changes Focus without replacing universal or other contextual state', () => {
    const id = useScreenStore.getState().createScreen('Continuity', 'general');
    const initial = useScreenStore.getState().screens.find((screen) => screen.id === id)?.focusWorkspace;
    expect(initial).toBeDefined();

    useScreenStore.getState().setActiveFocus('social');
    useScreenStore.getState().setActiveFocus('exploration');
    useScreenStore.getState().setActiveFocus('social');

    const result = useScreenStore.getState().screens.find((screen) => screen.id === id)?.focusWorkspace;
    expect(result?.currentFocus).toBe('social');
    expect(result?.universal).toEqual(initial?.universal);
    expect(result?.contexts).toEqual(initial?.contexts);
  });
});
