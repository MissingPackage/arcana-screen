// The party roster. A PC is the first concrete "Entity": a monster stat block,
// an NPC and a wiki note will later share this shape (id/kind/name/reveal/origin).
export type EntityReveal = 'secret' | 'known';

export interface PartyMember {
  id: string;
  kind: 'pc';
  name: string;
  ac: number;
  hp: number;
  maxHp: number;
  initMod: number;
  passivePerception: number;
  passiveInsight: number;
  notes: string; // saves, resistances, reminders — free text
  reveal: EntityReveal; // PCs are known to players by default
  origin: 'mine'; // authored locally; stays in the portable JSON backup
}

export const PC_FIELD_DEFAULTS = {
  ac: 10,
  maxHp: 10,
  initMod: 0,
  passivePerception: 10,
  passiveInsight: 10,
} as const;

export const createPartyMemberId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `pc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toInt = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};
const clampMin = (n: number, min: number): number => (n < min ? min : n);

/** Build a fully-valid PartyMember from partial/untrusted input (used for create, edit and import). */
export function createPartyMember(input: Partial<PartyMember> = {}): PartyMember {
  const maxHp = clampMin(toInt(input.maxHp, PC_FIELD_DEFAULTS.maxHp), 0);
  const hp = clampMin(toInt(input.hp ?? maxHp, maxHp), 0);
  const name = (typeof input.name === 'string' ? input.name.trim() : '') || 'New character';
  return {
    id: typeof input.id === 'string' && input.id ? input.id : createPartyMemberId(),
    kind: 'pc',
    name,
    ac: clampMin(toInt(input.ac, PC_FIELD_DEFAULTS.ac), 0),
    hp,
    maxHp,
    initMod: toInt(input.initMod, PC_FIELD_DEFAULTS.initMod),
    passivePerception: clampMin(toInt(input.passivePerception, PC_FIELD_DEFAULTS.passivePerception), 0),
    passiveInsight: clampMin(toInt(input.passiveInsight, PC_FIELD_DEFAULTS.passiveInsight), 0),
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
