import { describe, expect, it } from 'vitest';
import { addCombatant, type EncounterState } from './encounterModel';
import { createPartyMember } from './partyModel';
import { combatantFromMember, combatantIdForMember } from '../components/session/RunWorkspace';

const emptyEncounter: EncounterState = { round: 1, currentIndex: null, combatants: [] };

describe('party → combat integration', () => {
  it('maps a roster PC to a combatant with AC/HP/init from the entity', () => {
    const member = createPartyMember({ name: 'Ser Kael', ac: 18, hp: 24, maxHp: 24, initMod: 3, playerName: 'Sam' });
    const combatant = combatantFromMember(member);
    expect(combatant).toMatchObject({
      id: combatantIdForMember(member.id), name: 'Ser Kael', ac: 18, hp: 24, maxHp: 24, initiative: 3, detail: 'Sam',
    });
    expect(combatant.initiativeUnset).toBeUndefined();
  });

  it('falls back to 10 HP and a generic detail when the roster values are unset', () => {
    const combatant = combatantFromMember(createPartyMember({ name: 'Blank' }));
    expect(combatant.maxHp).toBe(10);
    expect(combatant.hp).toBe(10);
    expect(combatant.detail).toBe('Player character');
  });

  it('flags an unrolled initiative so it never reads as a rolled 0', () => {
    expect(combatantFromMember(createPartyMember({ name: 'No mod' })).initiativeUnset).toBe(true);
    expect(combatantFromMember(createPartyMember({ name: 'Rolled', initMod: 0 })).initiativeUnset).toBeUndefined();
  });

  it('adds a combatant from the roster and keeps the list sorted by initiative', () => {
    const withVex = addCombatant(emptyEncounter, combatantFromMember(createPartyMember({ name: 'Vex', initMod: 2 })));
    const withKael = addCombatant(withVex, combatantFromMember(createPartyMember({ name: 'Kael', initMod: 8 })));
    expect(withKael.combatants.map((combatant) => combatant.name)).toEqual(['Kael', 'Vex']);
  });
});
