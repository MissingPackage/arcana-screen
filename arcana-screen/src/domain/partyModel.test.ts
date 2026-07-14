import { describe, expect, it } from 'vitest';
import { createPartyMember, sanitizePartyMember } from './partyModel';

describe('partyModel', () => {
  it('creates a PC with sane defaults and a trimmed name', () => {
    const member = createPartyMember({ name: '  Ser Kael  ' });
    expect(member).toMatchObject({
      kind: 'pc', name: 'Ser Kael', ac: 10, maxHp: 10, hp: 10,
      initMod: 0, passivePerception: 10, passiveInsight: 10, reveal: 'known', origin: 'mine',
    });
    expect(member.id).toBeTruthy();
  });

  it('defaults current HP to max HP and clamps negatives to zero', () => {
    expect(createPartyMember({ maxHp: 30 }).hp).toBe(30);
    expect(createPartyMember({ ac: -5, maxHp: 12 }).ac).toBe(0);
    expect(createPartyMember({ hp: -2, maxHp: 12 }).hp).toBe(0);
  });

  it('falls back to a placeholder name when empty', () => {
    expect(createPartyMember({ name: '   ' }).name).toBe('New character');
  });

  it('coerces string numbers when importing', () => {
    const member = sanitizePartyMember({ name: 'Lira', ac: '16', maxHp: '30', initMod: '5' });
    expect(member).toMatchObject({ name: 'Lira', ac: 16, maxHp: 30, hp: 30, initMod: 5 });
  });

  it('rejects non-objects', () => {
    expect(sanitizePartyMember(null)).toBeNull();
    expect(sanitizePartyMember('nope')).toBeNull();
  });
});
