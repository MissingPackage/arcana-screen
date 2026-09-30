import type { EncounterCombatant } from './encounterModel';
import type { PartyMember } from './partyModel';

// Map a roster PC to an encounter combatant so the party auto-populates Combat (no re-keying).
export const combatantIdForMember = (memberId: string): string => `pc-${memberId}`;
export const combatantFromMember = (member: PartyMember): EncounterCombatant => {
  const maxHp = member.maxHp ?? member.hp ?? 10;
  return {
    id: combatantIdForMember(member.id),
    name: member.name,
    detail: member.playerName ?? 'Player character',
    initiative: member.initMod ?? 0,
    tieBreaker: member.initMod ?? 0,
    // No stored init modifier means the roll is unknown — flag it so the tracker shows "—" until the DM sets it.
    initiativeUnset: member.initMod === undefined ? true : undefined,
    hp: member.hp ?? maxHp,
    maxHp,
    tempHp: 0,
    conditions: [],
    ac: member.ac,
  };
};
