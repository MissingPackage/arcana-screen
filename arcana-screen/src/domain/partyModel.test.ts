import { describe, expect, it } from 'vitest';
import { createPartyMember, sanitizePartyMember } from './partyModel';

describe('partyModel', () => {
  it('creates a PC with a trimmed name and unset (blank) numeric fields', () => {
    const member = createPartyMember({ name: '  Ser Kael  ' });
    expect(member).toMatchObject({ kind: 'pc', name: 'Ser Kael', reveal: 'known', origin: 'mine' });
    // numbers are undefined until the DM sets them, so the UI shows a blank not a wrong "10"
    expect(member.ac).toBeUndefined();
    expect(member.hp).toBeUndefined();
    expect(member.maxHp).toBeUndefined();
    expect(member.id).toBeTruthy();
  });

  it('keeps provided values and clamps negatives to zero', () => {
    expect(createPartyMember({ ac: 18, maxHp: 30 })).toMatchObject({ ac: 18, maxHp: 30 });
    expect(createPartyMember({ ac: -5 }).ac).toBe(0);
    expect(createPartyMember({ hp: -2 }).hp).toBe(0);
    expect(createPartyMember({ initMod: -1 }).initMod).toBe(-1); // init modifier may be negative
  });

  it('falls back to a placeholder name when empty', () => {
    expect(createPartyMember({ name: '   ' }).name).toBe('New character');
  });

  it('coerces string numbers and the new fields when importing', () => {
    const member = sanitizePartyMember({
      name: 'Lira', playerName: 'Sam', ac: '16', maxHp: '30', initMod: '5',
      passiveInvestigation: '13', spellSaveDc: '14', spellAttack: '6',
    });
    expect(member).toMatchObject({
      name: 'Lira', playerName: 'Sam', ac: 16, maxHp: 30, initMod: 5,
      passiveInvestigation: 13, spellSaveDc: 14, spellAttack: 6,
    });
    // unset fields stay undefined
    expect(member?.hp).toBeUndefined();
  });

  it('treats empty strings as unset', () => {
    expect(createPartyMember({ ac: '' as unknown as number }).ac).toBeUndefined();
  });

  it('rejects non-objects', () => {
    expect(sanitizePartyMember(null)).toBeNull();
    expect(sanitizePartyMember('nope')).toBeNull();
  });
});
