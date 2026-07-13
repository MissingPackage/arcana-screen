import { describe, expect, it } from 'vitest';
import { Bug, Crosshair, Flame, MagicWand, PawPrint, ShieldChevron, Skull, Sword } from '@phosphor-icons/react';
import { combatantIcon, NPC_ICONS } from './RunWorkspace';

describe('combatantIcon', () => {
  it.each([
    ['Skeletal Archer', 'Undead · Ranged', Skull], // undead is checked before archer
    ['Phase Spider', 'Huge · Stealthy', Bug],
    ['Worg', 'Ferocious', PawPrint],
    ['Goblin Shaman', 'Spellcaster', MagicWand],
    ['Goblin Grunt', 'Minion · Melee', Sword],
    ['Fire Elemental', '', Flame],
    ['Lone Hunter', 'Ranged', Crosshair],
  ])('maps %s to a type-appropriate glyph', (name, detail, expected) => {
    expect(combatantIcon(name, detail)).toBe(expected);
  });

  it('falls back to a shield for unknown or humanoid types', () => {
    expect(combatantIcon('Ser Kael', 'Human · Paladin')).toBe(ShieldChevron);
    expect(combatantIcon('Mysterious Figure')).toBe(ShieldChevron);
  });
});

describe('NPC_ICONS', () => {
  it('provides multiple distinct glyphs so NPCs are not identical', () => {
    expect(NPC_ICONS.length).toBeGreaterThan(1);
    expect(new Set(NPC_ICONS).size).toBe(NPC_ICONS.length);
  });
});
