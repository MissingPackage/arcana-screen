import { memo, useEffect, useState } from 'react';
import { useWidgetStore, type Widget } from '../../store/useWidgetStore';
import { executeFormula, parseDiceFormula, type DiceTerm } from '../../utils/diceFormulaParser';

interface DiceRollerProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  showHeader?: boolean;
}

const diceOptions = [2, 4, 6, 8, 10, 12, 20, 100];

function modifierTotal(terms: DiceTerm[]) {
  return terms
    .filter((term) => term.type === 'modifier' && term.value !== undefined)
    .reduce((total, term) => total + (term.operation === '-' ? -(term.value ?? 0) : (term.value ?? 0)), 0);
}

function DiceRoller({ id, updateWidget }: DiceRollerProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    if (widget && widget.diceType === undefined) {
      updateWidget(id, {
        diceType: 20,
        numDice: 1,
        modifier: 0,
        advantage: 'none',
        formula: '',
        results: [],
        finalResult: null,
        rollBreakdown: [],
        formulaError: '',
        dicePresets: [],
      });
    }
  }, [id, updateWidget, widget]);

  if (!widget) return <div className="tool-empty-state">Loading dice roller…</div>;

  const diceType = widget.diceType ?? 20;
  const numDice = widget.numDice ?? 1;
  const modifier = widget.modifier ?? 0;
  const advantage = widget.advantage ?? 'none';
  const formula = widget.formula ?? '';
  const results = widget.results ?? [];
  const finalResult = widget.finalResult ?? null;
  const breakdown = widget.rollBreakdown ?? [];
  const error = widget.formulaError ?? '';
  const presets = widget.dicePresets ?? [];

  const runSingleDieWithAdvantage = (sides: number, modifierValue: number) => {
    const rolls = [Math.floor(Math.random() * sides) + 1, Math.floor(Math.random() * sides) + 1];
    const kept = advantage === 'adv' ? Math.max(...rolls) : Math.min(...rolls);
    updateWidget(id, {
      results: rolls,
      finalResult: kept + modifierValue,
      rollBreakdown: [`${advantage === 'adv' ? 'Advantage' : 'Disadvantage'} d${sides}: ${rolls.join(', ')} → ${kept}`, modifierValue ? `${modifierValue >= 0 ? '+' : ''}${modifierValue}` : ''],
      formulaError: '',
    });
  };

  const handleRoll = () => {
    const activeFormula = formula.trim() || `${numDice}d${diceType}${modifier >= 0 ? '+' : ''}${modifier}`;
    const parsed = parseDiceFormula(activeFormula);
    if (!parsed.valid) {
      updateWidget(id, { results: [], finalResult: null, rollBreakdown: [], formulaError: parsed.error ?? 'Invalid formula.' });
      return;
    }

    if (advantage !== 'none') {
      const diceTerms = parsed.terms.filter((term) => term.type === 'dice');
      if (diceTerms.length !== 1 || diceTerms[0].count !== 1 || diceTerms[0].keep) {
        updateWidget(id, {
          results: [],
          finalResult: null,
          rollBreakdown: [],
          formulaError: 'Advantage and disadvantage require a formula with exactly one die, such as d20+4.',
        });
        return;
      }
      runSingleDieWithAdvantage(diceTerms[0].sides ?? diceType, modifierTotal(parsed.terms));
      return;
    }

    const roll = executeFormula(parsed.terms);
    updateWidget(id, {
      results: roll.results,
      finalResult: roll.total,
      rollBreakdown: roll.breakdown,
      formulaError: '',
    });
  };

  return (
    <div className="surface dice-roller">
      <div className="dice-roller__quick" aria-label="Common dice">
        {diceOptions.map((sides) => (
          <button
            key={sides}
            type="button"
            aria-pressed={diceType === sides}
            onClick={() => updateWidget(id, { diceType: sides, formulaError: '' })}
          >
            d{sides}
          </button>
        ))}
      </div>

      <div className="dice-roller__controls">
        <label>
          <span>Quantity</span>
          <input type="number" min={1} max={100} value={numDice} onChange={(event) => updateWidget(id, { numDice: Math.min(100, Math.max(1, Number(event.target.value) || 1)), formulaError: '' })} />
        </label>
        <label>
          <span>Modifier</span>
          <input type="number" value={modifier} onChange={(event) => updateWidget(id, { modifier: Number(event.target.value) || 0, formulaError: '' })} />
        </label>
      </div>

      <div className="dice-roller__advantage" aria-label="Roll mode">
        {(['none', 'adv', 'dis'] as const).map((mode) => (
          <button key={mode} type="button" aria-pressed={advantage === mode} onClick={() => updateWidget(id, { advantage: mode, formulaError: '' })}>
            {mode === 'none' ? 'Normal' : mode === 'adv' ? 'Advantage' : 'Disadvantage'}
          </button>
        ))}
      </div>

      <label className="dice-roller__formula">
        <span>Formula <small>(optional; overrides quantity, die and modifier)</small></span>
        <input
          value={formula}
          onChange={(event) => updateWidget(id, { formula: event.target.value, formulaError: '' })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleRoll();
            }
          }}
          placeholder="2d6+3 or d20-1"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `dice-error-${id}` : undefined}
        />
      </label>

      <div className="dice-preset-library">
        <div className="dice-preset-library__save">
          <input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Preset name" aria-label="Dice preset name" />
          <button
            type="button"
            disabled={!presetName.trim()}
            onClick={() => {
              const presetFormula = formula.trim() || `${numDice}d${diceType}${modifier >= 0 ? '+' : ''}${modifier}`;
              updateWidget(id, { dicePresets: [...presets, { id: globalThis.crypto?.randomUUID?.() ?? `dice-preset-${Date.now()}`, name: presetName.trim(), formula: presetFormula }] });
              setPresetName('');
            }}
          >
            Save preset
          </button>
        </div>
        {presets.length > 0 && (
          <div className="dice-preset-library__items" aria-label="Saved dice presets">
            {presets.map((preset) => (
              <span key={preset.id}>
                <button type="button" title={preset.formula} onClick={() => updateWidget(id, { formula: preset.formula, advantage: 'none', formulaError: '' })}>{preset.name}</button>
                <button type="button" className="danger-text" aria-label={`Delete ${preset.name}`} onClick={() => updateWidget(id, { dicePresets: presets.filter((item) => item.id !== preset.id) })}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p id={`dice-error-${id}`} className="tool-error" role="alert">{error}</p>}

      <button type="button" className="screen-action-button dice-roller__roll" onClick={handleRoll}>Roll</button>

      {finalResult === null ? (
        <p className="tool-empty-state">Choose quick controls or enter standard dice notation, then roll.</p>
      ) : (
        <output className="dice-result" aria-live="polite">
          <span>Total</span>
          <strong>{finalResult}</strong>
          <p>{breakdown.filter(Boolean).join(' · ')}</p>
          <small>Raw rolls: {results.join(', ')}</small>
        </output>
      )}
    </div>
  );
}

export default memo(DiceRoller);
