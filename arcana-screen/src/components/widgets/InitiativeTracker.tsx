import { useState, useEffect } from 'react';

interface Combatant {
  id: number;
  name: string;
  initiative: number;
}

export default function InitiativeTracker() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [name, setName] = useState('');
  const [initiative, setInitiative] = useState(0);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [turnChangeAnimation, setTurnChangeAnimation] = useState(false);

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
    setCurrentIndex((prev) => {
      const nextIndex = prev === null ? 0 : (prev + 1) % combatants.length;
      return nextIndex;
    });
    // Trigger animation
    setTurnChangeAnimation(true);
  };

  const removeCombatant = (id: number) => {
    setCombatants((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    if (turnChangeAnimation) {
      const timeout = setTimeout(() => setTurnChangeAnimation(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [turnChangeAnimation]);

  return (
    <div className="bg-yellow-100 text-gray-900 p-4 rounded-lg shadow-md w-full h-full flex flex-col relative overflow-hidden">
      <h2 className="text-lg font-bold mb-2">Initiative Tracker</h2>

      {/* Turn counter */}
      {combatants.length > 0 && currentIndex !== null && (
        <div className="text-sm mb-4 text-center font-semibold text-yellow-700">
          Turn: {currentIndex + 1} / {combatants.length}
        </div>
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
        <button
          onClick={addCombatant}
          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
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
          className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Next Turn
        </button>
      )}

      {/* Turn Change Animation */}
      {turnChangeAnimation && (
        <div className="absolute inset-0 bg-green-400 bg-opacity-30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
