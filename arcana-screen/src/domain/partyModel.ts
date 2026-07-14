// The party roster. A PC is the first concrete "Entity": a monster stat block,
// an NPC and a wiki note will later share this shape (id/kind/name/reveal/origin).
//
// Numeric fields are OPTIONAL: undefined means "not set yet" so the setup UI can
// show a blank (placeholder) instead of a misleading default like 10/0. Read
// sites (combat, party surface) apply their own fallbacks.
export type EntityReveal = 'secret' | 'known';

export interface PartyMember {
  id: string;
  kind: 'pc';
  name: string;
  playerName?: string;
  ac?: number;
  hp?: number;
  maxHp?: number;
  initMod?: number;
  passivePerception?: number;
  passiveInsight?: number;
  passiveInvestigation?: number;
  spellSaveDc?: number;
  spellAttack?: number;
  notes: string; // saves, resistances, reminders — free text
  reveal: EntityReveal; // PCs are known to players by default
  origin: 'mine'; // authored locally; stays in the portable JSON backup
}

export const createPartyMemberId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `pc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Coerce to an integer, or undefined when empty/blank/invalid ("not set"). */
const optInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};
const nonNeg = (n: number | undefined): number | undefined => (n === undefined ? undefined : n < 0 ? 0 : n);
const optText = (value: unknown): string | undefined => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text === '' ? undefined : text;
};

/** Build a valid PartyMember from partial/untrusted input (used for create, edit and import). */
export function createPartyMember(input: Partial<PartyMember> = {}): PartyMember {
  const name = (typeof input.name === 'string' ? input.name.trim() : '') || 'New character';
  return {
    id: typeof input.id === 'string' && input.id ? input.id : createPartyMemberId(),
    kind: 'pc',
    name,
    playerName: optText(input.playerName),
    ac: nonNeg(optInt(input.ac)),
    hp: nonNeg(optInt(input.hp)),
    maxHp: nonNeg(optInt(input.maxHp)),
    initMod: optInt(input.initMod),
    passivePerception: nonNeg(optInt(input.passivePerception)),
    passiveInsight: nonNeg(optInt(input.passiveInsight)),
    passiveInvestigation: nonNeg(optInt(input.passiveInvestigation)),
    spellSaveDc: nonNeg(optInt(input.spellSaveDc)),
    spellAttack: optInt(input.spellAttack),
    notes: typeof input.notes === 'string' ? input.notes : '',
    reveal: input.reveal === 'secret' ? 'secret' : 'known',
    origin: 'mine',
  };
}

/** Validate one imported record; returns null for non-objects. */
export function sanitizePartyMember(raw: unknown): PartyMember | null {
  if (!raw || typeof raw !== 'object') return null;
  return createPartyMember(raw as Partial<PartyMember>);
}
