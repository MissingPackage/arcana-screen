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
