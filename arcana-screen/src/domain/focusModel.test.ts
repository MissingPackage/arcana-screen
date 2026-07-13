import { describe, expect, it } from 'vitest';
import {
  advanceNarrativeBeat,
  advanceSocialClock,
  completeExplorationMoment,
  createDefaultFocusWorkspace,
  migrateFocusWorkspace,
  selectExplorationMoment,
  switchFocus,
} from './focusModel';

describe('Focus workspace', () => {
  it('keeps universal state and every contextual state intact across Focus changes', () => {
    const initial = createDefaultFocusWorkspace();
    initial.universal.notebook.title = 'Cripta di Vhal';
    initial.universal.captures.push({ id: 'capture-1', text: 'The gate opened', createdAt: '2026-07-13T10:00:00.000Z' });
    initial.contexts.social.sceneClock = 4;
    initial.contexts.exploration.discoveryClock = 2;
    initial.contexts.combat.round = 3;

    const result = ['social', 'exploration', 'combat', 'narrative', 'social'].reduce(
      (workspace, focus) => switchFocus(workspace, focus as 'narrative' | 'social' | 'exploration' | 'combat'),
      initial,
    );

    expect(result.currentFocus).toBe('social');
    expect(result.universal).toEqual(initial.universal);
    expect(result.contexts).toEqual(initial.contexts);
  });

  it('advances Narrative beats without changing other Focus state', () => {
    const initial = createDefaultFocusWorkspace();
    const result = advanceNarrativeBeat(initial);

    expect(initial.contexts.narrative.currentBeat).toBe(2);
    expect(initial.contexts.narrative.beats[0]?.completed).toBe(true);
    expect(result.contexts.narrative.currentBeat).toBe(3);
    expect(result.contexts.narrative.beats[0].completed).toBe(true);
    expect(result.contexts.social).toEqual(initial.contexts.social);
  });

  it('clamps the Social scene clock to eight segments', () => {
    const initial = createDefaultFocusWorkspace();
    initial.contexts.social.sceneClock = 7;

    const once = advanceSocialClock(initial);
    const twice = advanceSocialClock(once);

    expect(once.contexts.social.sceneClock).toBe(8);
    expect(twice.contexts.social.sceneClock).toBe(8);
  });

  it('completes the active Exploration moment and activates the next prepared moment', () => {
    const initial = createDefaultFocusWorkspace();
    const currentId = initial.contexts.exploration.currentMomentId;
    const nextId = initial.contexts.exploration.moments.find((moment) => moment.status === 'prepared')?.id;
    const result = completeExplorationMoment(initial);

    expect(result.contexts.exploration.moments.find((moment) => moment.id === currentId)?.status).toBe('completed');
    expect(result.contexts.exploration.currentMomentId).toBe(nextId);
    expect(result.contexts.exploration.moments.find((moment) => moment.id === nextId)?.status).toBe('active');
  });

  it('selects exactly one Exploration moment and keeps the previous one recoverable', () => {
    const initial = createDefaultFocusWorkspace();
    const result = selectExplorationMoment(initial, 'archive');

    expect(result.contexts.exploration.currentMomentId).toBe('archive');
    expect(result.contexts.exploration.moments.filter((moment) => moment.status === 'active')).toHaveLength(1);
    expect(result.contexts.exploration.moments.find((moment) => moment.id === 'archive')?.status).toBe('active');
    expect(result.contexts.exploration.moments.find((moment) => moment.id === 'galleries')?.status).toBe('prepared');
  });

  it('adds new universal defaults without replacing persisted Focus state', () => {
    const legacy = createDefaultFocusWorkspace();
    legacy.currentFocus = 'social';
    legacy.contexts.social.sceneClock = 6;
    legacy.universal.captures.push({ id: 'legacy', text: 'Keep me', createdAt: '2026-07-13T10:00:00.000Z' });
    delete (legacy.universal.dice as Partial<typeof legacy.universal.dice>).formula;
    delete (legacy.universal.dice as Partial<typeof legacy.universal.dice>).mode;

    const migrated = migrateFocusWorkspace(legacy);
    expect(migrated.currentFocus).toBe('social');
    expect(migrated.contexts.social.sceneClock).toBe(6);
    expect(migrated.universal.captures[0].text).toBe('Keep me');
    expect(migrated.universal.dice.formula).toBe('');
    expect(migrated.universal.dice.mode).toBe('normal');
  });
});
