import { useState, useEffect } from 'react';
import { useWidgetStore } from '../../store/useWidgetStore';

interface Combatant {
  id: number;
  name: string;
  initiative: number;
}

interface InitiativeTrackerProps {
  id: string;
  updateWidget: (id: string, updates: any) => void;
}


export default function InitiativeTracker({ id, updateWidget }: InitiativeTrackerProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));

  useEffect(() => {
    if (!widget?.combatants) {
      updateWidget(id, { combatants: [], name: '', initiative: 0, currentIndex: null, turnChangeAnimation: false });
    }
  }, [widget, id, updateWidget]);

  const combatants = widget?.combatants || [];
  const name = widget?.name || '';
  const initiative = widget?.initiative || 0;
  const currentIndex = widget?.currentIndex ?? null;
  const turnChangeAnimation = widget?.turnChangeAnimation || false;

  const setCombatants = (v: any[]) => updateWidget(id, { combatants: v });
  const setName = (v: string) => updateWidget(id, { name: v });
  const setInitiative = (v: number) => updateWidget(id, { initiative: v });
  const setCurrentIndex = (v: number | null) => updateWidget(id, { currentIndex: v });
  const setTurnChangeAnimation = (v: boolean) => updateWidget(id, { turnChangeAnimation: v });

  const addCombatant = () => {
    if (!name) return;
    const newCombatant: Combatant = {
      id: Date.now(),
      name,
      initiative,
    };
    const updated = [...combatants, newCombatant].sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
    setName('');
    setInitiative(0);
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
    setCombatants(combatants.filter((c) => c.id !== id));
  };

  useEffect(() => {
    if (turnChangeAnimation) {
      const timeout = setTimeout(() => setTurnChangeAnimation(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [turnChangeAnimation]);

  return (
    <div className="transition p-4 rounded-lg shadow-md w-full h-full flex flex-col relative overflow-hidden">
      <h2 className="text-lg font-bold mb-2">Initiative Tracker</h2>

      {/* Turn counter */}
      {combatants.length > 0 && currentIndex !== null && (
        <div className="rounded px-3 py-1 text-xs font-semibold transition">Turn: {currentIndex + 1} / {combatants.length}</div>
      )}
      {/* Defensive: show nothing if combatants empty or currentIndex null */}
      {combatants.length === 0 || currentIndex === null ? null : null}

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
        <button
          onClick={addCombatant}
          className="rounded px-2 py-1 text-xs transition"
        >
          Add Combatant
        </button>
      </div>

      {/* List of combatants */}
      <div className="flex-1 overflow-auto">
        {combatants.map((c, index) => (
          <div
            key={c.id}
            className={`flex justify-between items-center p-2 rounded mb-2 transition-all duration-300 ${
              index === currentIndex
                ? 'bg-yellow-300 font-bold'
                : 'bg-yellow-200'
            }`}
          >
            <div>{c.name} (Initiative: {c.initiative})</div>
            <button
              onClick={() => removeCombatant(c.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
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
