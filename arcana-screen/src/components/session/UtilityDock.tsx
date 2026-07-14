import {
  ArrowCounterClockwise,
  DiceFive,
  Minus,
  Pause,
  Play,
  Plus,
  Sparkle,
  Timer,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { FocusWorkspace } from '../../domain/focusModel';
import { pauseTimer, remainingSeconds, resetTimer, startTimer } from '../../domain/timerModel';
import { rollOracle, type Likelihood, type OracleAnswer } from '../../domain/oracleModel';
import { executeFormula, parseDiceFormula } from '../../utils/diceFormulaParser';

interface UtilityDockProps {
  workspace: FocusWorkspace;
  onChange: (workspace: FocusWorkspace) => void;
  onCapture: (text: string) => void;
}

const LIKELIHOOD_LABEL: Record<Likelihood, string> = { unlikely: 'Unlikely', even: '50/50', likely: 'Likely' };

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export default function UtilityDock({ workspace, onChange, onCapture }: UtilityDockProps) {
  const [now, setNow] = useState(() => Date.now());
  const [advancedDiceOpen, setAdvancedDiceOpen] = useState(false);
  const [timerOptionsOpen, setTimerOptionsOpen] = useState(false);
  const [oracleOpen, setOracleOpen] = useState(false);
  const [oracleLikelihood, setOracleLikelihood] = useState<Likelihood>('even');
  const [oracleAnswer, setOracleAnswer] = useState<OracleAnswer | null>(null);
  const askOracle = (likelihood: Likelihood) => { setOracleLikelihood(likelihood); setOracleAnswer(rollOracle(likelihood)); };
  const timer = workspace.universal.timer;
  const exploration = workspace.contexts.exploration;
  const dice = workspace.universal.dice;
  const shownSeconds = remainingSeconds(timer, now);

  useEffect(() => {
    if (!timer.running) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timer.running]);

  useEffect(() => {
    if (timer.running && shownSeconds === 0) {
      onChange({
        ...workspace,
        universal: {
          ...workspace.universal,
          timer: { ...timer, remainingSeconds: 0, running: false, endAt: null },
        },
      });
    }
  }, [onChange, shownSeconds, timer, workspace]);

  const updateDice = (update: Partial<FocusWorkspace['universal']['dice']>) => {
    onChange({
      ...workspace,
      universal: {
        ...workspace.universal,
        dice: { ...workspace.universal.dice, ...update },
      },
    });
  };

  const roll = () => {
    const formula = dice.formula?.trim() || `d${dice.die}${dice.modifier >= 0 ? '+' : ''}${dice.modifier}`;
    const parsed = parseDiceFormula(formula);
    if (!parsed.valid) {
      updateDice({ result: null, results: [], breakdown: [], error: parsed.error ?? 'Invalid dice formula.' });
      return;
    }

    const mode = dice.mode ?? 'normal';
    if (mode !== 'normal') {
      const diceTerms = parsed.terms.filter((term) => term.type === 'dice');
      if (diceTerms.length !== 1 || diceTerms[0].count !== 1 || diceTerms[0].keep) {
        updateDice({ result: null, results: [], breakdown: [], error: 'Advantage and disadvantage require exactly one die, such as d20+4.' });
        return;
      }
      const sides = diceTerms[0].sides ?? dice.die;
      const rolls = [Math.floor(Math.random() * sides) + 1, Math.floor(Math.random() * sides) + 1];
      const kept = mode === 'advantage' ? Math.max(...rolls) : Math.min(...rolls);
      const modifier = parsed.terms.filter((term) => term.type === 'modifier').reduce((total, term) => total + (term.operation === '-' ? -(term.value ?? 0) : (term.value ?? 0)), 0);
      updateDice({ result: kept + modifier, results: rolls, breakdown: [`${mode}: ${rolls.join(', ')} → ${kept}`, modifier ? `${modifier >= 0 ? '+' : ''}${modifier}` : ''], error: '' });
      return;
    }

    const result = executeFormula(parsed.terms);
    updateDice({ result: result.total, results: result.results, breakdown: result.breakdown, error: '' });
  };

  const updateCounter = (counter: number) => onChange({
    ...workspace,
    contexts: {
      ...workspace.contexts,
      exploration: { ...exploration, counter: Math.max(0, counter) },
    },
  });

  const updateTimer = (nextTimer: FocusWorkspace['universal']['timer']) => onChange({
    ...workspace,
    universal: { ...workspace.universal, timer: nextTimer },
  });

  return (
    <footer className="utility-dock">
      <section className="dock-tool dice-tool" aria-label="Dice roller">
        <span className="dock-tool__name"><DiceFive size={23} aria-hidden="true" /> Dice</span>
        <select
          aria-label="Die type"
          value={dice.die}
          onChange={(event) => updateDice({ die: Number(event.target.value), result: null })}
        >
          {[20, 12, 10, 8, 6, 4].map((die) => <option key={die} value={die}>d{die}</option>)}
        </select>
        <div className="dock-stepper" aria-label="Dice modifier">
          <button type="button" aria-label="Decrease modifier" onClick={() => updateDice({ modifier: dice.modifier - 1 })}>−</button>
          <output>{dice.modifier >= 0 ? '+' : ''}{dice.modifier}</output>
          <button type="button" aria-label="Increase modifier" onClick={() => updateDice({ modifier: dice.modifier + 1 })}>+</button>
        </div>
        <output className="dock-result" aria-label="Roll result">{dice.result ?? '—'}</output>
        <button type="button" className="dock-action" onClick={roll}>Roll</button>
        <button type="button" className="dock-reset dice-options-trigger" aria-expanded={advancedDiceOpen} onClick={() => setAdvancedDiceOpen((open) => !open)}>Dice options</button>
        {advancedDiceOpen && (
          <div className="dice-options" role="group" aria-label="Advanced dice options">
            <label>Formula<input aria-label="Dice formula" value={dice.formula ?? ''} onChange={(event) => updateDice({ formula: event.target.value, error: '' })} placeholder="2d6+3 or d20-1" /></label>
            <div aria-label="Roll mode">
              {(['normal', 'advantage', 'disadvantage'] as const).map((mode) => <button key={mode} type="button" aria-pressed={(dice.mode ?? 'normal') === mode} onClick={() => updateDice({ mode, error: '' })}>{mode === 'normal' ? 'Normal' : mode === 'advantage' ? 'Advantage' : 'Disadvantage'}</button>)}
            </div>
            {dice.error && <p role="alert">{dice.error}</p>}
            {dice.breakdown?.length > 0 && <p className="dice-breakdown">{dice.breakdown.filter(Boolean).join(' · ')}{dice.results?.length ? ` · raw ${dice.results.join(', ')}` : ''}</p>}
          </div>
        )}
      </section>

      <section className="dock-tool oracle-tool" aria-label="Oracle">
        <button type="button" className="dock-tool__name oracle-trigger" aria-expanded={oracleOpen} onClick={() => setOracleOpen((open) => !open)}>
          <Sparkle size={22} aria-hidden="true" /> Oracle
          {oracleAnswer && <span className={`oracle-glyph oracle-glyph--${oracleAnswer.result.startsWith('Yes') ? 'yes' : 'no'}`}>{oracleAnswer.result}</span>}
        </button>
        {oracleOpen && (
          <div className="oracle-options" role="group" aria-label="Oracle">
            <div className="oracle-likelihoods" aria-label="Ask a question by likelihood">
              {(['unlikely', 'even', 'likely'] as const).map((likelihood) => (
                <button key={likelihood} type="button" aria-pressed={oracleLikelihood === likelihood} onClick={() => askOracle(likelihood)}>{LIKELIHOOD_LABEL[likelihood]}</button>
              ))}
            </div>
            <p className="oracle-answer" aria-live="polite">
              {oracleAnswer ? (
                <>
                  <strong className={oracleAnswer.result.startsWith('Yes') ? 'is-yes' : 'is-no'}>{oracleAnswer.result.startsWith('Yes') ? 'Yes' : 'No'}</strong>
                  {oracleAnswer.result.includes(', ') && <em>, {oracleAnswer.result.split(', ')[1]}</em>}
                  <span className="oracle-roll">d20 {oracleAnswer.roll}</span>
                  <button type="button" className="oracle-log" onClick={() => onCapture(`Oracle (${LIKELIHOOD_LABEL[oracleAnswer.likelihood]}): ${oracleAnswer.result}`)}>Log</button>
                </>
              ) : <span className="oracle-hint">Tap a likelihood to ask.</span>}
            </p>
          </div>
        )}
      </section>

      {workspace.currentFocus === 'exploration' && (
        <section className="dock-tool counter-tool" aria-label="Exploration counter">
          <span className="dock-tool__name">Counter</span>
          <button type="button" aria-label="Decrease counter" onClick={() => updateCounter(exploration.counter - 1)}><Minus size={17} /></button>
          <output aria-label="Counter value">{exploration.counter}</output>
          <button type="button" aria-label="Increase counter" onClick={() => updateCounter(exploration.counter + 1)}><Plus size={17} /></button>
          <button type="button" className="dock-reset" onClick={() => updateCounter(0)}>Reset</button>
        </section>
      )}

      <section className="dock-tool timer-tool" aria-label="Session timer">
        <span className="dock-tool__name"><Timer size={23} aria-hidden="true" /> Timer</span>
        <time aria-live="polite">{formatTime(shownSeconds)}</time>
        <button
          type="button"
          className="dock-action dock-action--gold"
          onClick={() => updateTimer(timer.running ? pauseTimer(timer, Date.now()) : startTimer(timer, Date.now()))}
        >
          {timer.running ? <Pause size={17} weight="fill" /> : <Play size={17} weight="fill" />}
          {timer.running ? 'Pause' : 'Start'}
        </button>
        <button type="button" className="dock-reset" onClick={() => updateTimer(resetTimer(timer))}>
          <ArrowCounterClockwise size={17} /> Reset
        </button>
        <button type="button" className="dock-reset timer-options-trigger" aria-expanded={timerOptionsOpen} onClick={() => setTimerOptionsOpen((open) => !open)}>Set time</button>
        {timerOptionsOpen && (
          <div className="timer-options" role="group" aria-label="Timer duration">
            <label>Minutes<input aria-label="Timer minutes" type="number" min={0} max={1440} value={Math.floor(timer.durationSeconds / 60)} onChange={(event) => { const durationSeconds = Math.max(0, Number(event.target.value) || 0) * 60 + timer.durationSeconds % 60; updateTimer({ durationSeconds, remainingSeconds: durationSeconds, running: false, endAt: null }); }} /></label>
            <label>Seconds<input aria-label="Timer seconds" type="number" min={0} max={59} value={timer.durationSeconds % 60} onChange={(event) => { const durationSeconds = Math.floor(timer.durationSeconds / 60) * 60 + Math.min(59, Math.max(0, Number(event.target.value) || 0)); updateTimer({ durationSeconds, remainingSeconds: durationSeconds, running: false, endAt: null }); }} /></label>
          </div>
        )}
      </section>
    </footer>
  );
}
