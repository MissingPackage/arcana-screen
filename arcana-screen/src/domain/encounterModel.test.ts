import { describe, expect, it } from 'vitest';
import { adjustTemporaryHp, advanceTurn, applyDamage, sortCombatants, type EncounterState } from './encounterModel';

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
});
