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

export const addCombatant = (
  encounter: EncounterState,
  combatant: EncounterCombatant,
): EncounterState => ({
  ...encounter,
  combatants: sortCombatants([...encounter.combatants, combatant]),
});

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
  const combatants = encounter.combatants.map((combatant) => (combatant.id === target.id ? { ...combatant, tieBreaker } : combatant));
  return { ...encounter, combatants: sortCombatants(combatants) };
};

// The conditions a DM reaches for most in live play. Kept short on purpose: this
// is the one-tap set, not a catalogue — anything rarer still goes in the free-text
// field, which is why toggling must not disturb conditions outside this list.
export const QUICK_CONDITIONS = ['Prone', 'Poisoned', 'Concentration', 'Stunned', 'Restrained'] as const;

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
