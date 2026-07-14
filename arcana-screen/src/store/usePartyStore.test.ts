import { beforeEach, describe, expect, it } from 'vitest';
import { usePartyStore } from './usePartyStore';

const party = () => usePartyStore.getState();

describe('usePartyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePartyStore.setState({ members: [] });
  });

  it('adds a member and returns its id', () => {
    const id = party().addMember({ name: 'Ser Kael', ac: 18 });
    expect(party().members).toHaveLength(1);
    expect(party().members[0]).toMatchObject({ id, name: 'Ser Kael', ac: 18, kind: 'pc' });
  });

  it('updates a member and keeps values valid', () => {
    const id = party().addMember({ name: 'Vex', maxHp: 27, hp: 27 });
    party().updateMember(id, { hp: 12, ac: 16 });
    expect(party().members[0]).toMatchObject({ hp: 12, ac: 16, maxHp: 27 });
  });

  it('removes a member', () => {
    const a = party().addMember({ name: 'A' });
    party().addMember({ name: 'B' });
    party().removeMember(a);
    expect(party().members.map((member) => member.name)).toEqual(['B']);
  });

  it('reorders members', () => {
    party().addMember({ name: 'A' });
    const b = party().addMember({ name: 'B' });
    party().addMember({ name: 'C' });
    party().reorderMember(b, 0);
    expect(party().members.map((member) => member.name)).toEqual(['B', 'A', 'C']);
  });

  it('replaces the roster on import and sanitizes records', () => {
    party().addMember({ name: 'old' });
    party().setMembers([{ name: 'Imported', ac: 15 }]);
    expect(party().members).toHaveLength(1);
    expect(party().members[0]).toMatchObject({ name: 'Imported', ac: 15, kind: 'pc', origin: 'mine' });
  });
});
