import { describe, expect, it } from 'vitest';
import { mintNpc } from './npcModel';

describe('NPC model', () => {
  it('mints an NPC by drawing the first of each table', () => {
    expect(mintNpc(undefined, () => 0)).toEqual({
      name: 'Bram', role: 'Innkeeper', attitude: 'Guarded', motive: 'wants coin', secret: 'is lying about their name',
    });
  });

  it('pins the role the player already named, still rolling the rest', () => {
    const npc = mintNpc('Bartender', () => 0);
    expect(npc.role).toBe('Bartender');
    expect(npc.name).toBe('Bram'); // other fields still drawn
  });

  it('ignores a blank role and draws one', () => {
    expect(mintNpc('   ', () => 0).role).toBe('Innkeeper');
  });

  it('draws different entries as the rng varies', () => {
    const low = mintNpc(undefined, () => 0);
    const high = mintNpc(undefined, () => 0.99);
    expect(high.name).not.toBe(low.name);
    expect(high.role).not.toBe(low.role);
  });
});
