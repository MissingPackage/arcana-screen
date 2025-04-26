import { useState } from 'react';
import { DiceD2, DiceD4, DiceD6, DiceD8, DiceD10, DiceD12, DiceD20, DiceD100 } from './DiceIcons';

export default function DiceRoller() {
  const [diceType, setDiceType] = useState(20);
  const [numDice, setNumDice] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [advantage, setAdvantage] = useState<'none' | 'adv' | 'dis'>('none');
  const [formula, setFormula] = useState('');
  const [results, setResults] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<number | null>(null);

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
    <div className="bg-indigo-100 text-gray-900 p-4 rounded-lg shadow-md w-full h-full flex flex-col justify-between">
      <h2 className="text-lg font-bold mb-2">Dice Roller</h2>
      <div className="flex flex-col gap-6">
        {/* Barra dadi classici */}
        <div className="flex flex-col items-center pb-2 border-b border-gray-300">
          <span className="font-semibold mb-2">Dadi classici</span>
          <div className="flex flex-wrap gap-3 justify-center">
            {diceOptions.map(opt => (
              <button
                key={opt.sides}
                className={`p-1 rounded border-2 ${diceType === opt.sides ? 'border-[#6d4c1b] bg-[#f5e4c3]' : 'border-gray-400 bg-[#f5e4c3]'} text-[#6d4c1b] hover:border-[#6d4c1b]`}
                onClick={() => setDiceType(opt.sides)}
                title={`d${opt.sides}`}
                style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
        {/* Input rapidi */}
        <div className="flex flex-wrap gap-3 justify-center items-center pb-2 border-b border-gray-300">
          <span className="font-semibold">Numero dadi:</span>
          <button onClick={() => setNumDice(Math.max(1, numDice-1))} className="px-2 py-1 rounded bg-[#f5e4c3] text-[#6d4c1b] border border-[#6d4c1b] hover:border-[#a8864a]">-</button>
          <input type="number" min={1} value={numDice} onChange={e => setNumDice(Number(e.target.value))} className="border rounded p-1 w-8 text-center" style={{background:'#f5e4c3',color:'#6d4c1b',borderColor:'#6d4c1b',maxWidth:'2.5em'}} />
          <button onClick={() => setNumDice(numDice+1)} className="px-2 py-1 rounded bg-[#f5e4c3] text-[#6d4c1b] border border-[#6d4c1b] hover:border-[#a8864a]">+</button>
          <span className="font-semibold ml-4">Tipo:</span>
          <span className="mx-1">d{diceType}</span>
          <span className="font-semibold ml-4">Modificatore:</span>
          <button onClick={() => setModifier(modifier-1)} className="px-2 py-1 rounded bg-[#f5e4c3] text-[#6d4c1b] border border-[#6d4c1b] hover:border-[#a8864a]">-</button>
          <input type="number" value={modifier} onChange={e => setModifier(Number(e.target.value))} className="border rounded p-1 w-8 text-center" style={{background:'#f5e4c3',color:'#6d4c1b',borderColor:'#6d4c1b',maxWidth:'2.5em'}} />
          <button onClick={() => setModifier(modifier+1)} className="px-2 py-1 rounded bg-[#f5e4c3] text-[#6d4c1b] border border-[#6d4c1b] hover:border-[#a8864a]">+</button>
          <span className="ml-4 font-semibold">ADV/DIS:</span>
          <button
            className={`px-2 py-1 rounded border ${advantage === 'adv' ? 'bg-[#f5e4c3] border-[#6d4c1b] text-[#6d4c1b] font-bold' : 'bg-[#f5e4c3] border-[#6d4c1b] text-[#6d4c1b]'} hover:border-[#a8864a]`}
            onClick={() => setAdvantage(advantage === 'adv' ? 'none' : 'adv')}
          >ADV</button>
          <button
            className={`px-2 py-1 rounded border ${advantage === 'dis' ? 'bg-[#f5e4c3] border-[#6d4c1b] text-[#6d4c1b] font-bold' : 'bg-[#f5e4c3] border-[#6d4c1b] text-[#6d4c1b]'} hover:border-[#a8864a]`}
            onClick={() => setAdvantage(advantage === 'dis' ? 'none' : 'dis')}
          >DIS</button>
          <button
            onClick={handleRoll}
            className="px-4 py-2 rounded bg-[#f5e4c3] text-[#6d4c1b] border border-[#6d4c1b] hover:border-[#a8864a] ml-2 font-bold"
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
            className="border rounded p-1 flex-1 min-w-[180px] max-w-[240px]"
            style={{background:'#f5e4c3',color:'#6d4c1b',borderColor:'#6d4c1b'}}
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