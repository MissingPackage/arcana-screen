import {
  Bug,
  Crosshair,
  Flame,
  MagicWand,
  PawPrint,
  ShieldChevron,
  Skull,
  Sword,
  User,
  UserCircle,
  UserFocus,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';

// Per-entity icons: give each combatant/NPC a distinct glyph instead of one shared shield.
const COMBATANT_ICONS: Array<[RegExp, Icon]> = [
  [/spider|insect|swarm|vermin|beetle/, Bug],
  [/undead|skelet|zombie|wraith|ghost|lich/, Skull],
  [/wolf|worg|hound|\bdog\b|beast|bear|boar|feral|ferocious/, PawPrint],
  [/shaman|mage|wizard|warlock|sorcer|spellcast|caster|cleric|priest|witch|druid/, MagicWand],
  [/archer|ranged|\bbow\b|hunter|sniper/, Crosshair],
  [/dragon|drake|wyrm|flame|\bfire\b|elemental/, Flame],
  [/goblin|kobold|\borc\b|minion|grunt|bandit|soldier|melee|brute|thug/, Sword],
];
export const combatantIcon = (name: string, detail?: string): Icon => {
  const haystack = `${name} ${detail ?? ''}`.toLowerCase();
  return COMBATANT_ICONS.find(([pattern]) => pattern.test(haystack))?.[1] ?? ShieldChevron;
};
// No portrait data available, so vary the NPC glyph deterministically by position.
export const NPC_ICONS: Icon[] = [UserCircle, User, UserFocus, UsersThree];
