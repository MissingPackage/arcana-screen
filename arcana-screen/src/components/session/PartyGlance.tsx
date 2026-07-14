import { useEffect, useRef, useState } from 'react';
import { CaretDown, UsersThree } from '@phosphor-icons/react';
import { usePartyStore } from '../../store/usePartyStore';
import type { PartyMember } from '../../domain/partyModel';
import type { FocusWorkspace } from '../../domain/focusModel';

type PassiveKey = 'passivePerception' | 'passiveInsight' | 'passiveInvestigation';

// Contextual passives: Social leans on read-the-room, Exploration on notice-and-search.
const PASSIVES: Record<string, Array<{ key: PassiveKey; label: string; full: string }>> = {
  social: [
    { key: 'passiveInsight', label: 'Ins', full: 'Passive Insight' },
    { key: 'passivePerception', label: 'Perc', full: 'Passive Perception' },
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

export default function PartyGlance({ focus }: { focus: FocusWorkspace['currentFocus'] }) {
  const members = usePartyStore((state) => state.members);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const onPointer = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onPointer); };
  }, [open]);

  // Nothing to glance at until the roster is filled once, and Combat already shows the party inline.
  if (members.length === 0 || focus === 'combat' || focus === null) return null;

  const passives = PASSIVES[focus] ?? [];

  return (
    <div className="party-glance" ref={containerRef}>
      {open && (
        <div id="party-glance-panel" className="party-glance__panel" role="region" aria-label="Party at a glance">
          <table>
            <thead>
              <tr>
                <th scope="col">Character</th>
                <th scope="col">AC</th>
                <th scope="col">HP</th>
                {passives.map((passive) => <th key={passive.key} scope="col" title={passive.full}>{passive.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {members.map((member: PartyMember) => (
                <tr key={member.id}>
                  <th scope="row"><strong>{member.name}</strong>{member.playerName && <small>{member.playerName}</small>}</th>
                  <td>{numberOrDash(member.ac)}</td>
                  <td>{member.hp !== undefined || member.maxHp !== undefined ? `${numberOrDash(member.hp ?? member.maxHp)}/${numberOrDash(member.maxHp ?? member.hp)}` : '—'}</td>
                  {passives.map((passive) => <td key={passive.key}>{numberOrDash(member[passive.key])}</td>)}
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
