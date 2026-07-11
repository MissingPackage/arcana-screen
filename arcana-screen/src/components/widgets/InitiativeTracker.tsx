import { useEffect, memo } from 'react';
import { useWidgetStore, Widget, Combatant } from '../../store/useWidgetStore';

interface InitiativeTrackerProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
}


function InitiativeTracker({ id, updateWidget }: InitiativeTrackerProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));

  useEffect(() => {
    if (!widget?.combatants) {
      updateWidget(id, { combatants: [], name: '', initiative: 0, currentHp: undefined, maxHp: undefined, currentIndex: null, turnChangeAnimation: false });
    }
  }, [widget, id, updateWidget]);

  const combatants = widget?.combatants || [];
  const name = widget?.name || '';
  const initiative = widget?.initiative || 0;
  const currentHp = widget?.currentHp;
  const maxHp = widget?.maxHp;
  const currentIndex = widget?.currentIndex ?? null;
  const turnChangeAnimation = widget?.turnChangeAnimation || false;

  const setCombatants = (v: Combatant[]) => updateWidget(id, { combatants: v });
  const setName = (v: string) => updateWidget(id, { name: v });
  const setInitiative = (v: number) => updateWidget(id, { initiative: v });
  const setCurrentHp = (v: number | undefined) => updateWidget(id, { currentHp: v });
  const setMaxHp = (v: number | undefined) => updateWidget(id, { maxHp: v });
  const setCurrentIndex = (v: number | null) => updateWidget(id, { currentIndex: v });
  const setTurnChangeAnimation = (v: boolean) => updateWidget(id, { turnChangeAnimation: v });

  const addCombatant = () => {
    if (!name) return;
    const newCombatant: Combatant = {
      id: Date.now(),
      name,
      initiative,
      currentHp,
      maxHp,
    };
    const updated = [...combatants, newCombatant].sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
    setName('');
    setInitiative(0);
    setCurrentHp(undefined);
    setMaxHp(undefined);
    if (currentIndex === null) setCurrentIndex(0);
  };

  const nextTurn = () => {
    if (combatants.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % combatants.length;
    setCurrentIndex(nextIndex);
    // Trigger animation
    setTurnChangeAnimation(true);
  };

  const removeCombatant = (id: number) => {
    const activeCombatantId = currentIndex === null ? null : combatants[currentIndex]?.id;
    const updated = combatants.filter((c) => c.id !== id);
    setCombatants(updated);

    if (updated.length === 0) {
      setCurrentIndex(null);
    } else if (activeCombatantId === id || activeCombatantId === null) {
      setCurrentIndex(Math.min(currentIndex ?? 0, updated.length - 1));
    } else {
      setCurrentIndex(updated.findIndex((combatant) => combatant.id === activeCombatantId));
    }
  };

  const updateCombatantHp = (combatantId: number, hpChange: number) => {
    const updated = combatants.map((c) => {
      if (c.id === combatantId && c.currentHp !== undefined && c.maxHp !== undefined) {
        const newHp = Math.max(0, Math.min(c.maxHp, c.currentHp + hpChange));
        return { ...c, currentHp: newHp };
      }
      return c;
    });
    setCombatants(updated);
  };

  const getHpBarColor = (currentHp: number, maxHp: number): string => {
    const percentage = (currentHp / maxHp) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isDownedCombatant = (c: Combatant): boolean => {
    return c.currentHp !== undefined && c.currentHp === 0;
  };

  useEffect(() => {
    if (turnChangeAnimation) {
      const timeout = setTimeout(() => setTurnChangeAnimation(false), 500);
      return () => clearTimeout(timeout);
    }
    // setTurnChangeAnimation is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnChangeAnimation]);

  return (
    <div className="surface transition p-4 rounded-lg shadow-md w-full h-full flex flex-col relative overflow-hidden">
      <h2 className="text-lg font-bold mb-2">Initiative Tracker</h2>

      {/* Turn counter */}
      {combatants.length > 0 && currentIndex !== null && (
        <div className="rounded px-3 py-1 text-xs font-semibold transition">Turn: {currentIndex + 1} / {combatants.length}</div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          value={initiative}
          onChange={(e) => setInitiative(Number(e.target.value))}
          placeholder="Initiative"
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          value={currentHp ?? ''}
          onChange={(e) => setCurrentHp(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Current HP (optional)"
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          value={maxHp ?? ''}
          onChange={(e) => setMaxHp(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Max HP (optional)"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addCombatant}
          className="rounded px-2 py-1 text-xs transition"
        >
          Add Combatant
        </button>
      </div>

      {/* List of combatants */}
      <div className="flex-1 overflow-auto">
        {combatants.map((c, index) => {
          const isDowned = isDownedCombatant(c);
          return (
          <div
            key={c.id}
            className={`p-2 rounded mb-2 text-gray-900 transition-all duration-300 ${
              isDowned ? 'opacity-60 border-2 border-red-600' : ''
            } ${
              index === currentIndex
                ? 'bg-yellow-300 font-bold'
                : 'bg-yellow-200'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className={isDowned ? 'line-through' : ''}>
                  {c.name}
                </span> (Initiative: {c.initiative})
                {c.currentHp !== undefined && c.maxHp !== undefined && (
                  <span className="ml-2 font-semibold">HP: {c.currentHp}/{c.maxHp}</span>
                )}
                {isDowned && (
                  <span className="ml-2 text-red-600 font-bold text-xs">DOWNED</span>
                )}
              </div>
              <button
                onClick={() => removeCombatant(c.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
            {c.currentHp !== undefined && c.maxHp !== undefined && (
              <>
                {/* HP Bar */}
                <div className="w-full bg-gray-300 rounded-full h-4 mb-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getHpBarColor(c.currentHp, c.maxHp)}`}
                    style={{ width: `${c.maxHp > 0 ? (c.currentHp / c.maxHp) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex gap-1 mt-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => updateCombatantHp(c.id, -10)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => updateCombatantHp(c.id, -5)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => updateCombatantHp(c.id, -1)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                  >
                    -1
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateCombatantHp(c.id, 1)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateCombatantHp(c.id, 5)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => updateCombatantHp(c.id, 10)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                  >
                    +10
                  </button>
                </div>
              </div>
              </>
            )}
          </div>
          );
        })}
      </div>

      {/* Next Turn button */}
      {combatants.length > 0 && (
        <button
          onClick={nextTurn}
          className="mt-4 p-2 rounded transition"
        >
          Next Turn
        </button>
      )}

      {/* Turn Change Animation */}
      {turnChangeAnimation && (
        <div className="absolute inset-0 bg-opacity-30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

export default memo(InitiativeTracker);
