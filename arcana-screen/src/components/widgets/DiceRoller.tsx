import { useEffect } from 'react';
import { useWidgetStore } from '../../store/useWidgetStore';
import { DiceD2, DiceD4, DiceD6, DiceD8, DiceD10, DiceD12, DiceD20, DiceD100 } from './DiceIcons';

interface DiceRollerProps {
  id: string;
  updateWidget: (id: string, updates: any) => void;
}

export default function DiceRoller({ id, updateWidget }: DiceRollerProps) {
  const widget = useWidgetStore(state => state.widgets.find(w => w.id === id));

  useEffect(() => {
    if (!widget?.diceType) {
      updateWidget(id, { diceType: 20, numDice: 1, modifier: 0, advantage: 'none', formula: '', results: [], finalResult: null });
    }
  }, [widget, id, updateWidget]);

  const diceType = widget?.diceType || 20;
  const numDice = widget?.numDice || 1;
  const modifier = widget?.modifier || 0;
  const advantage = widget?.advantage || 'none';
  const formula = widget?.formula || '';
  const results = widget?.results || [];
  const finalResult = widget?.finalResult || null;

  const setDiceType = (v: number) => updateWidget(id, { diceType: v });
  const setNumDice = (v: number) => updateWidget(id, { numDice: v });
  const setModifier = (v: number) => updateWidget(id, { modifier: v });
  const setAdvantage = (v: 'none' | 'adv' | 'dis') => updateWidget(id, { advantage: v });
  const setFormula = (v: string) => updateWidget(id, { formula: v });
  const setResults = (v: number[]) => updateWidget(id, { results: v });
  const setFinalResult = (v: number | null) => updateWidget(id, { finalResult: v });

  const diceOptions = [
    {sides: 2, icon: <DiceD2 />},
    {sides: 4, icon: <DiceD4 />},
    {sides: 6, icon: <DiceD6 />},
    {sides: 8, icon: <DiceD8 />},
    {sides: 10, icon: <DiceD10 />},
    {sides: 12, icon: <DiceD12 />},
    {sides: 20, icon: <DiceD20 />},
    {sides: 100, icon: <DiceD100 />},
  ];

  function parseFormula(formula: string) {
    // Supporta formule tipo 2d20+3 o d6-1
    const match = formula.trim().match(/(\d*)d(\d+)([+-]\d+)?/i);
    if (!match) return null;
    const n = match[1] ? parseInt(match[1]) : 1;
    const s = parseInt(match[2]);
    const m = match[3] ? parseInt(match[3]) : 0;
    return { n, s, m };
  }

  function rollDice(n: number, s: number, m: number, adv: 'none' | 'adv' | 'dis') {
    let rolls: number[] = [];
    if (adv !== 'none' && n === 1) {
      // Vantaggio/svantaggio: tiri due dadi e prendi il maggiore/minore
      const roll1 = Math.floor(Math.random() * s) + 1;
      const roll2 = Math.floor(Math.random() * s) + 1;
      rolls = [roll1, roll2];
      setResults([roll1, roll2]);
      setFinalResult(adv === 'adv' ? Math.max(roll1, roll2) + m : Math.min(roll1, roll2) + m);
    } else {
      for (let i = 0; i < n; i++) {
        rolls.push(Math.floor(Math.random() * s) + 1);
      }
      setResults(rolls);
      setFinalResult(rolls.reduce((a, b) => a + b, 0) + m);
    }
  }

  function handleRoll() {
    if (formula.trim()) {
      const parsed = parseFormula(formula);
      if (parsed) {
        rollDice(parsed.n, parsed.s, parsed.m, advantage);
      } else {
        setResults([]);
        setFinalResult(null);
      }
    } else {
      rollDice(numDice, diceType, modifier, advantage);
    }
  }

  return (
    <div className="widget-section p-4 rounded-lg shadow w-full h-full flex flex-col justify-between" style={{background:'transparent', color:'inherit'}}>
      <h2 className="text-lg font-bold mb-2">Dice Roller</h2>
      <div className="flex flex-col gap-6">
        {/* Barra dadi classici */}
        <div className="flex flex-col items-center pb-2 border-b border-gray-300">
          <span className="font-semibold mb-2">Dadi classici</span>
          <div className="flex flex-wrap gap-3 justify-center">
            {diceOptions.map(opt => (
              <button
                key={opt.sides}
                className={`btn ${diceType === opt.sides ? 'border-2 border-[var(--accent)]' : 'border border-[var(--border)]'} bg-white text-[var(--accent)]`}
                onClick={() => setDiceType(opt.sides)}
                title={`d${opt.sides}`}
                style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background:'inherit' }}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
        {/* Input rapidi */}
        <div className="flex justify-center items-center gap-14 pb-2 border-b border-gray-300">
  {/* Numero dadi */}
  <div className="flex items-center gap-2">
    <span className="font-semibold">Numero dadi:</span>
    <button onClick={() => setNumDice(Math.max(1, numDice-1))} className="btn px-2 py-1">-</button>
    <input type="number" min={1} value={numDice} onChange={e => setNumDice(Number(e.target.value))} className="input w-12 text-center" style={{maxWidth:'2.5em'}} />
    <button onClick={() => setNumDice(numDice+1)} className="btn px-2 py-1">+</button>
  </div>
  {/* Tipo */}
  <div className="flex items-center gap-2">
    <span className="font-semibold">Tipo:</span>
    <span className="mx-1">d{diceType}</span>
  </div>
  {/* Modificatore */}
  <div className="flex items-center gap-2">
    <span className="font-semibold">Modificatore:</span>
    <button onClick={() => setModifier(modifier-1)} className="btn px-2 py-1">-</button>
    <input type="number" value={modifier} onChange={e => setModifier(Number(e.target.value))} className="input w-12 text-center" style={{maxWidth:'2.5em'}} />
    <button onClick={() => setModifier(modifier+1)} className="btn px-2 py-1">+</button>
  </div>
</div>
{/* ADV/DIS + Roll Row */}
<div className="flex flex-wrap gap-4 justify-center items-center mt-3 mb-2">
  <span className="font-semibold">ADV/DIS:</span>
  <button
    className={`btn px-3 py-1 ${advantage === 'adv' ? 'font-bold border-2 border-[var(--accent)]' : ''}`}
    onClick={() => setAdvantage(advantage === 'adv' ? 'none' : 'adv')}
  >ADV</button>
  <button
    className={`btn px-3 py-1 ${advantage === 'dis' ? 'font-bold border-2 border-[var(--accent)]' : ''}`}
    onClick={() => setAdvantage(advantage === 'dis' ? 'none' : 'dis')}
  >DIS</button>
  <button
    onClick={handleRoll}
    className="btn px-5 py-2 ml-4 font-bold shadow-sm"
  >
    Roll
  </button>
</div>
        {/* Formula opzionale */}
        <div className="flex flex-col md:flex-row items-center gap-2 mt-2 justify-center">
          <label className="font-semibold mr-2">Formula:</label>
          <input
            type="text"
            value={formula}
            onChange={e => setFormula(e.target.value)}
            placeholder="es: 2d20+3"
            className="input flex-1 min-w-[180px] max-w-[240px]"
          />
          <span className="text-xs text-gray-500">(opzionale, sovrascrive sopra)</span>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-md font-semibold mb-1">Risultati dei dadi: {results.join(', ')}</p>
          <p className="text-xl font-bold">Totale: {finalResult}</p>
        </div>
      )}
    </div>
  );
}