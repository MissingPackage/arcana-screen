import { describe, expect, it } from 'vitest';
import { adjustTemporaryHp, advanceTurn, applyDamage, createCombatant, removeCombatant, reorderTiedCombatant, sortCombatants, type EncounterState } from './encounterModel';

const encounter = (): EncounterState => ({
  round: 3,
  currentIndex: 1,
  combatants: [
    { id: 'kael', name: 'Ser Kael', initiative: 18, tieBreaker: 2, hp: 24, maxHp: 24, tempHp: 0, conditions: ['Blessed'] },
    { id: 'scout', name: 'Goblin Scout', initiative: 15, tieBreaker: 1, hp: 7, maxHp: 7, tempHp: 0, conditions: [] },
  ],
});

describe('Encounter model', () => {
  it('sorts by initiative, tie-break and name without mutating input', () => {
    const input = [
      { id: 'b', name: 'Beta', initiative: 12, tieBreaker: 1, hp: 5, maxHp: 5, tempHp: 0, conditions: [] },
      { id: 'a', name: 'Alpha', initiative: 12, tieBreaker: 3, hp: 5, maxHp: 5, tempHp: 0, conditions: [] },
      { id: 'c', name: 'Cinder', initiative: 17, tieBreaker: 0, hp: 5, maxHp: 5, tempHp: 0, conditions: [] },
    ];

    expect(sortCombatants(input).map((item) => item.id)).toEqual(['c', 'a', 'b']);
    expect(input.map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('wraps to the first combatant and increments the round', () => {
    const result = advanceTurn(encounter());
    expect(result.currentIndex).toBe(0);
    expect(result.round).toBe(4);
  });

  it('absorbs damage with temporary HP before current HP', () => {
    const initial = encounter();
    initial.combatants[0].tempHp = 5;
    const result = applyDamage(initial, 'kael', 7);

    expect(result.combatants[0].tempHp).toBe(0);
    expect(result.combatants[0].hp).toBe(22);
  });

  it('adjusts temporary HP without allowing negative values', () => {
    const initial = encounter();
    expect(adjustTemporaryHp(initial, 'kael', 3).combatants[0].tempHp).toBe(3);
    expect(adjustTemporaryHp(initial, 'kael', -1).combatants[0].tempHp).toBe(0);
  });

  it('builds an ad-hoc combatant, flagging an omitted initiative as unset', () => {
    const bugbear = createCombatant('npc-bugbear', { name: 'Bugbear', ac: 16, hp: 27, initiative: 12 });
    expect(bugbear).toMatchObject({ id: 'npc-bugbear', name: 'Bugbear', ac: 16, hp: 27, maxHp: 27, initiative: 12, tempHp: 0, conditions: [] });
    expect(bugbear.initiativeUnset).toBeUndefined();

    const blank = createCombatant('npc-thug', { name: 'Thug' });
    expect(blank.initiativeUnset).toBe(true);
    expect(blank.hp).toBe(10);
    expect(blank.maxHp).toBe(10);
    expect(blank.ac).toBeUndefined();
  });

  it('removes a combatant and keeps the same one active', () => {
    const base: EncounterState = { ...encounter(), currentIndex: 1 };
    const removed = removeCombatant(base, 'kael'); // index 0, before the active one
    expect(removed.combatants.map((combatant) => combatant.id)).toEqual(['scout']);
    expect(removed.combatants[removed.currentIndex ?? -1]?.id).toBe('scout'); // still Goblin Scout
  });

  it('reorders a tied combatant while leaving other initiatives untouched', () => {
    const tie: EncounterState = { round: 1, currentIndex: null, combatants: [
      { id: 'a', name: 'Alda', initiative: 15, tieBreaker: 0, hp: 5, maxHp: 5, tempHp: 0, conditions: [] },
      { id: 'b', name: 'Bram', initiative: 15, tieBreaker: 0, hp: 5, maxHp: 5, tempHp: 0, conditions: [] },
      { id: 'c', name: 'Cyra', initiative: 20, tieBreaker: 0, hp: 5, maxHp: 5, tempHp: 0, conditions: [] },
    ] };
    expect(sortCombatants(tie.combatants).map((combatant) => combatant.id)).toEqual(['c', 'a', 'b']); // tie breaks by name

    const up = reorderTiedCombatant(tie, 'b', 'up');
    expect(up.combatants.map((combatant) => combatant.id)).toEqual(['c', 'b', 'a']); // Bram jumps ahead of Alda

    // Cyra (a different initiative) can't be dragged into the tie below it
    expect(reorderTiedCombatant(tie, 'c', 'down')).toEqual(tie);
  });

  it('clears the active index when the last combatant is removed', () => {
    const single: EncounterState = { round: 1, currentIndex: 0, combatants: [encounter().combatants[0]] };
    const removed = removeCombatant(single, 'kael');
    expect(removed.combatants).toEqual([]);
    expect(removed.currentIndex).toBeNull();
  });
});
