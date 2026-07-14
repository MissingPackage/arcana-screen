import { describe, expect, it } from 'vitest';
import { mintNpc } from './npcModel';

describe('NPC model', () => {
  it('mints an NPC by drawing the first of each table', () => {
    expect(mintNpc(() => 0)).toEqual({
      name: 'Bram', role: 'Innkeeper', attitude: 'Guarded', motive: 'wants coin', secret: 'is lying about their name',
    });
  });

  it('draws different entries as the rng varies', () => {
    const low = mintNpc(() => 0);
    const high = mintNpc(() => 0.99);
    expect(high.name).not.toBe(low.name);
    expect(high.role).not.toBe(low.role);
  });

  it('always yields a valid attitude', () => {
    for (const value of [0, 0.4, 0.8]) {
      expect(['Guarded', 'Friendly', 'Neutral']).toContain(mintNpc(() => value).attitude);
    }
  });
});
