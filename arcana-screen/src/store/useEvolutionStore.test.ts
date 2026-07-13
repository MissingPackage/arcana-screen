import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultFocusWorkspace } from '../domain/focusModel';
import { createToolInstance } from '../components/widgets/toolRegistry';
import { useEvolutionStore } from './useEvolutionStore';

describe('M4 evolution preferences and reusable packs', () => {
  beforeEach(() => {
    localStorage.clear();
    useEvolutionStore.setState({
      personalTemplates: [],
      referencePacks: [],
      density: 'comfortable',
      locale: 'en',
      accentTheme: 'arcane',
      customAccent: '#6d4aa2',
    });
  });

  it('saves an isolated personal template', () => {
    const widget = createToolInstance('quick-notes');
    useEvolutionStore.getState().savePersonalTemplate({
      name: 'Vhal',
      layoutConfig: [widget],
      focusWorkspace: createDefaultFocusWorkspace(),
      layoutMode: 'canvas',
    });
    widget.text = 'mutated after save';

    expect(useEvolutionStore.getState().personalTemplates[0].layoutConfig[0].text).toBe('');
    expect(useEvolutionStore.getState().personalTemplates[0].layoutMode).toBe('canvas');
  });

  it('stores reusable reference packs and interface preferences', () => {
    useEvolutionStore.getState().saveReferencePack('Rules', [{ id: 'r1', label: 'SRD', url: 'https://example.com' }]);
    useEvolutionStore.getState().setDensity('compact');
    useEvolutionStore.getState().setLocale('it');
    useEvolutionStore.getState().setCustomAccent('#ff5500');

    expect(useEvolutionStore.getState()).toMatchObject({ density: 'compact', locale: 'it', accentTheme: 'custom', customAccent: '#ff5500' });
    expect(useEvolutionStore.getState().referencePacks[0].links[0].label).toBe('SRD');
  });
});
