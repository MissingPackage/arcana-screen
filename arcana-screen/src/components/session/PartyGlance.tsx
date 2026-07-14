import { useEffect, useRef, useState } from 'react';
import { CaretDown, UsersThree, X } from '@phosphor-icons/react';
import { usePartyStore } from '../../store/usePartyStore';
import type { PartyMember } from '../../domain/partyModel';
import type { FocusWorkspace } from '../../domain/focusModel';

type StatKey = 'passivePerception' | 'passiveInsight' | 'passiveInvestigation' | 'spellSaveDc';

// Per-focus columns: only the numbers the current scene actually leans on. Higher is always the notable one.
const COLUMNS: Record<string, Array<{ key: StatKey; label: string; full: string }>> = {
  social: [
    { key: 'passiveInsight', label: 'Ins', full: 'Passive Insight' },
    { key: 'passivePerception', label: 'Perc', full: 'Passive Perception' },
    { key: 'spellSaveDc', label: 'Save', full: 'Spell Save DC' },
  ],
  exploration: [
    { key: 'passivePerception', label: 'Perc', full: 'Passive Perception' },
    { key: 'passiveInvestigation', label: 'Inv', full: 'Passive Investigation' },
  ],
  narrative: [
    { key: 'passivePerception', label: 'Perc', full: 'Passive Perception' },
  ],
};

const numberOrDash = (value?: number) => (value === undefined ? '—' : String(value));

const hpClass = (member: PartyMember) => {
  if (member.hp === undefined || !member.maxHp) return '';
  const ratio = member.hp / member.maxHp;
  if (ratio <= 0.25) return ' hp--critical';
  if (ratio <= 0.5) return ' hp--bloodied';
  return '';
};

export default function PartyGlance({ focus }: { focus: FocusWorkspace['currentFocus'] }) {
  const members = usePartyStore((state) => state.members);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pinnable: closes on Escape or the toggle/close button, but NOT on clicks elsewhere —
  // a DM checking a passive then jotting it in Live Notes must not have it snap shut.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Nothing to glance at until the roster is filled once, and Combat already shows the party inline.
  if (members.length === 0 || focus === 'combat' || focus === null) return null;

  const columns = COLUMNS[focus] ?? [];
  // Highlight the highest value in each column so "who has the best Insight" is a glance, not a scan.
  const maxByKey = new Map<StatKey, number>();
  for (const column of columns) {
    const values = members.map((member) => member[column.key]).filter((value): value is number => value !== undefined);
    if (values.length >= 2) maxByKey.set(column.key, Math.max(...values));
  }

  return (
    <div className="party-glance" ref={containerRef}>
      {open && (
        <div id="party-glance-panel" className="party-glance__panel" role="region" aria-label="Party at a glance">
          <div className="party-glance__head">
            <span>Party at a glance</span>
            <button type="button" aria-label="Close party glance" onClick={() => setOpen(false)}><X size={13} /></button>
          </div>
          <table>
            <thead>
              <tr>
                <th scope="col">Character</th>
                <th scope="col">AC</th>
                <th scope="col">HP</th>
                {columns.map((column) => <th key={column.key} scope="col" title={column.full}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {members.map((member: PartyMember) => (
                <tr key={member.id}>
                  <th scope="row"><strong>{member.name}</strong>{member.playerName && <small>{member.playerName}</small>}</th>
                  <td>{numberOrDash(member.ac)}</td>
                  <td className={`hp-cell${hpClass(member)}`}>{member.hp !== undefined || member.maxHp !== undefined ? `${numberOrDash(member.hp ?? member.maxHp)}/${numberOrDash(member.maxHp ?? member.hp)}` : '—'}</td>
                  {columns.map((column) => {
                    const value = member[column.key];
                    const isMax = value !== undefined && maxByKey.get(column.key) === value;
                    return <td key={column.key} className={isMax ? 'is-max' : undefined}>{numberOrDash(value)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        className="party-glance__toggle"
        aria-expanded={open}
        aria-controls="party-glance-panel"
        aria-label={`${open ? 'Hide' : 'Show'} the party at a glance`}
        onClick={() => setOpen((current) => !current)}
      >
        <UsersThree size={17} />
        <span>Party</span>
        <span className="party-glance__count">{members.length}</span>
        <CaretDown size={12} className={open ? 'is-open' : ''} />
      </button>
    </div>
  );
}
