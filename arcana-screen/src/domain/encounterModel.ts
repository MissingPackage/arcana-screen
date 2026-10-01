export interface EncounterCombatant {
  id: string;
  name: string;
  initiative: number;
  tieBreaker: number;
  hp: number;
  maxHp: number;
  tempHp: number;
  conditions: string[];
  detail?: string;
  ac?: number;
  // true when a roster PC was added but the DM has not yet entered a rolled initiative (renders as "—", not "0").
  initiativeUnset?: boolean;
  // true once the DM has settled a tie on this combatant with Earlier/Later; a new
  // initiative for it clears the flag, because the tie question is open again.
  tieOrdered?: boolean;
}

export interface EncounterState {
  round: number;
  currentIndex: number | null;
  combatants: EncounterCombatant[];
}

export const sortCombatants = (combatants: EncounterCombatant[]) =>
  [...combatants].sort((left, right) =>
    right.initiative - left.initiative ||
    right.tieBreaker - left.tieBreaker ||
    left.name.localeCompare(right.name),
  );

// Re-sort after any change to the order. currentIndex is a position, so the turn has to
// follow the combatant who holds it: inserting or moving someone above them used to hand
// the turn to whoever slid into that slot. Before the first Next Turn (round 1, first
// slot) initiatives are still being set, so the top of the new order acts.
export const resortEncounter = (
  encounter: EncounterState,
  combatants: EncounterCombatant[],
): EncounterState => {
  const sorted = sortCombatants(combatants);
  const { currentIndex, round } = encounter;
  if (currentIndex === null || (round === 1 && currentIndex === 0)) return { ...encounter, combatants: sorted };
  const activeId = encounter.combatants[currentIndex]?.id;
  const kept = sorted.findIndex((combatant) => combatant.id === activeId);
  return { ...encounter, combatants: sorted, currentIndex: kept === -1 ? Math.min(currentIndex, sorted.length - 1) : kept };
};

export const addCombatant = (
  encounter: EncounterState,
  combatant: EncounterCombatant,
): EncounterState => resortEncounter(encounter, [...encounter.combatants, combatant]);

// One more of the same mid-fight (a second wolf, a summoned twin): same stats and
// initiative, full HP, no conditions, and the next free number on the name.
export const duplicateCombatant = (
  encounter: EncounterState,
  combatantId: string,
  newId: string,
): EncounterState => {
  const source = encounter.combatants.find((combatant) => combatant.id === combatantId);
  if (!source) return encounter;
  const base = source.name.replace(/ \d+$/, '');
  const taken = new Set(encounter.combatants.map((combatant) => combatant.name));
  let number = 2;
  while (taken.has(`${base} ${number}`)) number += 1;
  return addCombatant(encounter, {
    ...source,
    id: newId,
    name: `${base} ${number}`,
    hp: source.maxHp,
    tempHp: 0,
    conditions: [],
    tieOrdered: undefined,
  });
};

export interface NewCombatantInput {
  name: string;
  ac?: number;
  hp?: number;
  initiative?: number;
}

// Build an ad-hoc NPC/monster combatant. Mirrors combatantFromMember: an omitted
// initiative is flagged unset (renders "—", not a rolled 0) until the DM sets it.
export const createCombatant = (id: string, input: NewCombatantInput): EncounterCombatant => {
  const hp = input.hp !== undefined && input.hp > 0 ? input.hp : 10;
  return {
    id,
    name: input.name,
    initiative: input.initiative ?? 0,
    tieBreaker: input.initiative ?? 0,
    initiativeUnset: input.initiative === undefined ? true : undefined,
    hp,
    maxHp: hp,
    tempHp: 0,
    conditions: [],
    ac: input.ac,
  };
};

export const removeCombatant = (
  encounter: EncounterState,
  combatantId: string,
): EncounterState => {
  const index = encounter.combatants.findIndex((combatant) => combatant.id === combatantId);
  if (index === -1) return encounter;
  const combatants = encounter.combatants.filter((combatant) => combatant.id !== combatantId);
  let currentIndex = encounter.currentIndex;
  if (currentIndex !== null) {
    if (combatants.length === 0) currentIndex = null;
    else if (index < currentIndex) currentIndex -= 1; // keep the same combatant active
    else if (currentIndex >= combatants.length) currentIndex = combatants.length - 1;
  }
  return { ...encounter, combatants, currentIndex };
};

// A tie needs the DM only while it is open: same initiative as a neighbour and not yet
// ordered by hand on both sides. Settled ties keep their order without the marker.
export const hasOpenTie = (combatants: EncounterCombatant[], index: number) => {
  const combatant = combatants[index];
  if (!combatant || combatant.initiativeUnset) return false;
  return [combatants[index - 1], combatants[index + 1]].some(
    (neighbor) => neighbor && !neighbor.initiativeUnset && neighbor.initiative === combatant.initiative && !(combatant.tieOrdered && neighbor.tieOrdered),
  );
};

// Let the DM break an initiative tie by nudging a combatant above/below a same-initiative neighbour.
export const reorderTiedCombatant = (
  encounter: EncounterState,
  combatantId: string,
  direction: 'up' | 'down',
): EncounterState => {
  const sorted = sortCombatants(encounter.combatants);
  const index = sorted.findIndex((combatant) => combatant.id === combatantId);
  const target = sorted[index];
  const neighbor = sorted[direction === 'up' ? index - 1 : index + 1];
  if (!target || !neighbor || neighbor.initiative !== target.initiative) return encounter; // only reorder within a tie
  // Push the target just past the neighbour's tie-breaker so the order flips deterministically.
  const tieBreaker = direction === 'up' ? neighbor.tieBreaker + 1 : neighbor.tieBreaker - 1;
  const combatants = encounter.combatants.map((combatant) => {
    if (combatant.id === target.id) return { ...combatant, tieBreaker, tieOrdered: true };
    if (combatant.id === neighbor.id) return { ...combatant, tieOrdered: true };
    return combatant;
  });
  return resortEncounter(encounter, combatants);
};

// The conditions a DM reaches for most in live play. Kept short on purpose: this
// is the one-tap set, not a catalogue — anything rarer still goes in the free-text
// field, which is why toggling must not disturb conditions outside this list.
export const QUICK_CONDITIONS = ['Prone', 'Poisoned', 'Concentration', 'Stunned', 'Restrained'] as const;
export type QuickCondition = (typeof QUICK_CONDITIONS)[number];

// What each one-tap condition does, paraphrased from the 2024 Free Rules glossary
// (checked against the text on 2026-09-30).
// The Combat Quick Reference reads this list, so it always explains exactly the
// conditions the DM can toggle beside it (it used to list five different ones).
export const QUICK_CONDITION_RULES: Record<QuickCondition, string> = {
  Prone: 'Its attacks have disadvantage; attacks against it have advantage within 5 ft, disadvantage beyond.',
  Poisoned: 'Disadvantage on attack rolls and ability checks.',
  Concentration: 'Damage forces a Con save: DC 10 or half the damage, whichever is higher.',
  Stunned: 'Incapacitated; fails Str and Dex saves; attacks against it have advantage.',
  Restrained: 'Speed 0; disadvantage on attacks and Dex saves; attacks against it have advantage.',
};

// Both sides are trimmed: an imported or seeded " Prone" would otherwise show the
// toggle off next to a visible "Prone" chip, and tapping it would add a second one.
const sameCondition = (left: string, right: string) =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

export const hasCondition = (combatant: EncounterCombatant, condition: string) =>
  combatant.conditions.some((existing) => sameCondition(existing, condition));

// Add or remove one condition, leaving every other condition untouched.
// Matching is case-insensitive because the same state arrives typed by hand
// ("prone") and from this list ("Prone"): comparing verbatim would let a
// combatant hold both and make the toggle unable to clear what it displays.
export const toggleCondition = (
  encounter: EncounterState,
  combatantId: string,
  condition: string,
): EncounterState => {
  const label = condition.trim();
  if (!label) return encounter;
  return {
    ...encounter,
    combatants: encounter.combatants.map((combatant) => {
      if (combatant.id !== combatantId) return combatant;
      const conditions = hasCondition(combatant, label)
        ? combatant.conditions.filter((existing) => !sameCondition(existing, label))
        : [...combatant.conditions, label];
      return { ...combatant, conditions };
    }),
  };
};

export const advanceTurn = (encounter: EncounterState): EncounterState => {
  if (encounter.combatants.length === 0) return { ...encounter, currentIndex: null };
  if (encounter.currentIndex === null) return { ...encounter, currentIndex: 0 };

  const currentIndex = (encounter.currentIndex + 1) % encounter.combatants.length;
  return {
    ...encounter,
    currentIndex,
    round: currentIndex === 0 ? encounter.round + 1 : encounter.round,
  };
};

export const applyDamage = (
  encounter: EncounterState,
  combatantId: string,
  damage: number,
): EncounterState => ({
  ...encounter,
  combatants: encounter.combatants.map((combatant) => {
    if (combatant.id !== combatantId || damage <= 0) return combatant;
    const absorbed = Math.min(combatant.tempHp, damage);
    return {
      ...combatant,
      tempHp: combatant.tempHp - absorbed,
      hp: Math.max(0, combatant.hp - (damage - absorbed)),
    };
  }),
});

export const healCombatant = (
  encounter: EncounterState,
  combatantId: string,
  amount: number,
): EncounterState => ({
  ...encounter,
  combatants: encounter.combatants.map((combatant) =>
    combatant.id === combatantId && amount > 0
      ? { ...combatant, hp: Math.min(combatant.maxHp, combatant.hp + amount) }
      : combatant,
  ),
});

export const adjustTemporaryHp = (
  encounter: EncounterState,
  combatantId: string,
  amount: number,
): EncounterState => ({
  ...encounter,
  combatants: encounter.combatants.map((combatant) =>
    combatant.id === combatantId
      ? { ...combatant, tempHp: Math.max(0, combatant.tempHp + amount) }
      : combatant,
  ),
});
