import { memo, useEffect, useState, type FormEvent } from 'react';
import { useWidgetStore, type Combatant, type InitiativeSnapshot, type Widget } from '../../store/useWidgetStore';

interface InitiativeTrackerProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  showHeader?: boolean;
}

interface CombatantDraft {
  name: string;
  initiative: number;
  tieBreaker: number;
  currentHp?: number;
  maxHp?: number;
  tempHp?: number;
  conditions: string;
}

const emptyDraft = (): CombatantDraft => ({
  name: '',
  initiative: 0,
  tieBreaker: 0,
  currentHp: undefined,
  maxHp: undefined,
  tempHp: undefined,
  conditions: '',
});

const sortCombatants = (combatants: Combatant[]) =>
  [...combatants].sort((a, b) =>
    b.initiative - a.initiative ||
    (b.tieBreaker ?? 0) - (a.tieBreaker ?? 0) ||
    a.name.localeCompare(b.name),
  );

const createCombatantId = () => Date.now() + Math.floor(Math.random() * 1000);

function InitiativeTracker({ id, updateWidget }: InitiativeTrackerProps) {
  const widget = useWidgetStore((state) => state.widgets.find((item) => item.id === id));
  const [draft, setDraft] = useState<CombatantDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<CombatantDraft>(emptyDraft);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (widget && (widget.combatants === undefined || widget.round === undefined)) {
      updateWidget(id, {
        combatants: widget.combatants ?? [],
        currentIndex: widget.currentIndex ?? null,
        round: widget.round ?? 1,
        initiativeUndo: widget.initiativeUndo ?? null,
      });
    }
  }, [id, updateWidget, widget]);

  useEffect(() => {
    if (!widget?.turnChangeAnimation) return;
    const timeout = window.setTimeout(() => updateWidget(id, { turnChangeAnimation: false }), 450);
    return () => window.clearTimeout(timeout);
  }, [id, updateWidget, widget?.turnChangeAnimation]);

  if (!widget) return <div className="tool-empty-state">Loading initiative tracker…</div>;

  const combatants = widget.combatants ?? [];
  const currentIndex = widget.currentIndex ?? null;
  const round = widget.round ?? 1;
  const activeCombatant = currentIndex === null ? undefined : combatants[currentIndex];

  const snapshot = (): InitiativeSnapshot => ({
    combatants: combatants.map((combatant) => ({ ...combatant })),
    currentIndex,
    round,
  });

  const updateList = (next: Combatant[], activeId = activeCombatant?.id, extra: Partial<Widget> = {}) => {
    const nextIndex = activeId === undefined ? 0 : next.findIndex((item) => item.id === activeId);
    updateWidget(id, {
      combatants: next,
      currentIndex: next.length === 0 ? null : nextIndex >= 0 ? nextIndex : 0,
      ...extra,
    });
  };

  const addCombatant = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const combatant: Combatant = {
      id: createCombatantId(),
      name: draft.name.trim(),
      initiative: draft.initiative,
      tieBreaker: draft.tieBreaker,
      currentHp: draft.currentHp,
      maxHp: draft.maxHp,
      tempHp: draft.tempHp,
      conditions: draft.conditions.trim(),
    };
    updateList(sortCombatants([...combatants, combatant]), activeCombatant?.id ?? combatant.id);
    setDraft(emptyDraft());
  };

  const nextTurn = () => {
    if (!combatants.length) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % combatants.length;
    updateWidget(id, {
      currentIndex: nextIndex,
      round: currentIndex !== null && nextIndex === 0 ? round + 1 : round,
      turnChangeAnimation: true,
    });
  };

  const removeCombatant = (combatantId: number) => {
    const next = combatants.filter((combatant) => combatant.id !== combatantId);
    updateList(next, activeCombatant?.id === combatantId ? next[0]?.id : activeCombatant?.id, { initiativeUndo: snapshot() });
  };

  const moveCombatant = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= combatants.length) return;
    const next = [...combatants];
    [next[index], next[target]] = [next[target], next[index]];
    updateList(next);
  };

  const beginEdit = (combatant: Combatant) => {
    setEditingId(combatant.id);
    setEditingDraft({
      name: combatant.name,
      initiative: combatant.initiative,
      tieBreaker: combatant.tieBreaker ?? 0,
      currentHp: combatant.currentHp,
      maxHp: combatant.maxHp,
      tempHp: combatant.tempHp,
      conditions: combatant.conditions ?? '',
    });
  };

  const saveEdit = (event: FormEvent) => {
    event.preventDefault();
    if (editingId === null || !editingDraft.name.trim()) return;
    const next = sortCombatants(combatants.map((combatant) =>
      combatant.id === editingId
        ? { ...combatant, ...editingDraft, name: editingDraft.name.trim(), conditions: editingDraft.conditions.trim() }
        : combatant,
    ));
    updateList(next);
    setEditingId(null);
  };

  const changeHp = (combatantId: number, amount: number) => {
    const next = combatants.map((combatant) => {
      if (combatant.id !== combatantId || combatant.currentHp === undefined) return combatant;
      if (amount < 0) {
        const damage = Math.abs(amount);
        const absorbed = Math.min(combatant.tempHp ?? 0, damage);
        return {
          ...combatant,
          tempHp: Math.max(0, (combatant.tempHp ?? 0) - absorbed),
          currentHp: Math.max(0, combatant.currentHp - (damage - absorbed)),
        };
      }
      return {
        ...combatant,
        currentHp: Math.min(combatant.maxHp ?? Number.MAX_SAFE_INTEGER, combatant.currentHp + amount),
      };
    });
    updateList(next);
  };

  const resetEncounter = () => {
    updateWidget(id, {
      initiativeUndo: snapshot(),
      combatants: [],
      currentIndex: null,
      round: 1,
      turnChangeAnimation: false,
    });
    setConfirmReset(false);
  };

  const undoEncounterChange = () => {
    const previous = widget.initiativeUndo;
    if (!previous) return;
    updateWidget(id, {
      combatants: previous.combatants,
      currentIndex: previous.currentIndex,
      round: previous.round,
      initiativeUndo: null,
    });
  };

  return (
    <div className={`surface initiative-tracker ${widget.turnChangeAnimation ? 'initiative-tracker--turn-change' : ''}`}>
      <div className="initiative-status" aria-live="polite">
        <div><span>Round</span><strong>{round}</strong></div>
        <div><span>Current turn</span><strong>{activeCombatant?.name ?? 'Not started'}</strong></div>
        <div><span>Combatants</span><strong>{combatants.length}</strong></div>
      </div>

      <form className="initiative-add" onSubmit={addCombatant}>
        <strong>Add combatant</strong>
        <div className="initiative-add__grid">
          <label><span>Name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
          <label><span>Initiative</span><input type="number" value={draft.initiative} onChange={(event) => setDraft({ ...draft, initiative: Number(event.target.value) || 0 })} /></label>
          <label><span>Tie-break</span><input type="number" value={draft.tieBreaker} onChange={(event) => setDraft({ ...draft, tieBreaker: Number(event.target.value) || 0 })} /></label>
          <label><span>HP</span><input type="number" min={0} value={draft.currentHp ?? ''} onChange={(event) => setDraft({ ...draft, currentHp: event.target.value ? Number(event.target.value) : undefined })} /></label>
          <label><span>Max HP</span><input type="number" min={0} value={draft.maxHp ?? ''} onChange={(event) => setDraft({ ...draft, maxHp: event.target.value ? Number(event.target.value) : undefined })} /></label>
          <label><span>Temp HP</span><input type="number" min={0} value={draft.tempHp ?? ''} onChange={(event) => setDraft({ ...draft, tempHp: event.target.value ? Number(event.target.value) : undefined })} /></label>
          <label className="initiative-add__conditions"><span>Conditions</span><input value={draft.conditions} onChange={(event) => setDraft({ ...draft, conditions: event.target.value })} placeholder="Poisoned, prone…" /></label>
        </div>
        <button type="submit" className="screen-action-button" disabled={!draft.name.trim()}>Add combatant</button>
      </form>

      {combatants.length === 0 ? (
        <p className="tool-empty-state">Add combatants to begin. Initiative and tie-break values determine the initial order.</p>
      ) : (
        <ol className="combatant-list">
          {combatants.map((combatant, index) => (
            <li key={combatant.id} className={`combatant-card ${index === currentIndex ? 'combatant-card--active' : ''}`}>
              {editingId === combatant.id ? (
                <form className="combatant-edit" onSubmit={saveEdit}>
                  <input aria-label="Name" value={editingDraft.name} onChange={(event) => setEditingDraft({ ...editingDraft, name: event.target.value })} />
                  <input aria-label="Initiative" type="number" value={editingDraft.initiative} onChange={(event) => setEditingDraft({ ...editingDraft, initiative: Number(event.target.value) || 0 })} />
                  <input aria-label="Tie-break" type="number" value={editingDraft.tieBreaker} onChange={(event) => setEditingDraft({ ...editingDraft, tieBreaker: Number(event.target.value) || 0 })} />
                  <input aria-label="Current HP" type="number" value={editingDraft.currentHp ?? ''} onChange={(event) => setEditingDraft({ ...editingDraft, currentHp: event.target.value ? Number(event.target.value) : undefined })} />
                  <input aria-label="Max HP" type="number" value={editingDraft.maxHp ?? ''} onChange={(event) => setEditingDraft({ ...editingDraft, maxHp: event.target.value ? Number(event.target.value) : undefined })} />
                  <input aria-label="Temporary HP" type="number" value={editingDraft.tempHp ?? ''} onChange={(event) => setEditingDraft({ ...editingDraft, tempHp: event.target.value ? Number(event.target.value) : undefined })} />
                  <input aria-label="Conditions" value={editingDraft.conditions} onChange={(event) => setEditingDraft({ ...editingDraft, conditions: event.target.value })} />
                  <div><button type="submit">Save</button><button type="button" onClick={() => setEditingId(null)}>Cancel</button></div>
                </form>
              ) : (
                <>
                  <div className="combatant-card__identity">
                    <span className="combatant-card__order">{index + 1}</span>
                    <div>
                      <strong>{combatant.name}</strong>
                      <span>Initiative {combatant.initiative} · tie-break {combatant.tieBreaker ?? 0}</span>
                    </div>
                  </div>
                  <div className="combatant-card__state">
                    <span>HP {combatant.currentHp ?? '—'}{combatant.maxHp !== undefined ? ` / ${combatant.maxHp}` : ''}</span>
                    <span>Temp {combatant.tempHp ?? 0}</span>
                    <span>{combatant.conditions || 'No conditions'}</span>
                  </div>
                  <div className="combatant-card__hp-actions">
                    <button type="button" onClick={() => changeHp(combatant.id, -5)} disabled={combatant.currentHp === undefined}>−5 HP</button>
                    <button type="button" onClick={() => changeHp(combatant.id, -1)} disabled={combatant.currentHp === undefined}>−1 HP</button>
                    <button type="button" onClick={() => changeHp(combatant.id, 1)} disabled={combatant.currentHp === undefined}>+1 HP</button>
                    <button type="button" onClick={() => changeHp(combatant.id, 5)} disabled={combatant.currentHp === undefined}>+5 HP</button>
                  </div>
                  <div className="combatant-card__actions">
                    <button type="button" onClick={() => moveCombatant(index, -1)} disabled={index === 0} aria-label={`Move ${combatant.name} earlier`}>↑</button>
                    <button type="button" onClick={() => moveCombatant(index, 1)} disabled={index === combatants.length - 1} aria-label={`Move ${combatant.name} later`}>↓</button>
                    <button type="button" onClick={() => beginEdit(combatant)}>Edit</button>
                    <button type="button" className="danger-text" onClick={() => removeCombatant(combatant.id)}>Remove</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="initiative-actions">
        <button type="button" className="screen-action-button" onClick={nextTurn} disabled={!combatants.length}>Next turn</button>
        {widget.initiativeUndo && <button type="button" onClick={undoEncounterChange}>Undo last remove/reset</button>}
        {!confirmReset ? (
          <button type="button" className="danger-text" onClick={() => setConfirmReset(true)} disabled={!combatants.length}>Reset encounter</button>
        ) : (
          <div className="initiative-reset-confirm" role="alert">
            <span>Clear the encounter and return to round 1?</span>
            <button type="button" className="screen-action-button screen-action-button--danger" onClick={resetEncounter}>Confirm reset</button>
            <button type="button" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(InitiativeTracker);
