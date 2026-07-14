import { usePartyStore } from '../../store/usePartyStore';
import type { PartyMember } from '../../domain/partyModel';

// One numeric field: uncontrolled + committed on blur, blank when unset (shows a
// placeholder hint) so an untouched party never looks pre-filled with wrong values.
function NumberField({
  label, value, placeholder, ariaLabel, onCommit,
}: {
  label: string;
  value: number | undefined;
  placeholder: string;
  ariaLabel: string;
  onCommit: (value: number | undefined) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        defaultValue={value ?? ''}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onBlur={(event) => onCommit(event.target.value.trim() === '' ? undefined : Number(event.target.value))}
      />
    </label>
  );
}

function PartyMemberRow({ member }: { member: PartyMember }) {
  const updateMember = usePartyStore((state) => state.updateMember);
  const removeMember = usePartyStore((state) => state.removeMember);
  const setNum = (key: keyof PartyMember) => (value: number | undefined) => updateMember(member.id, { [key]: value });

  return (
    <li className="party-member">
      <div className="party-member__identity">
        <label className="party-member__name">
          <span>Character</span>
          <input defaultValue={member.name} aria-label={`Name of ${member.name}`} onBlur={(e) => updateMember(member.id, { name: e.target.value })} />
        </label>
        <label>
          <span>Player</span>
          <input defaultValue={member.playerName ?? ''} placeholder="—" aria-label={`Player of ${member.name}`} onBlur={(e) => updateMember(member.id, { playerName: e.target.value })} />
        </label>
      </div>

      <div className="party-member__group" role="group" aria-label={`Core stats for ${member.name}`}>
        <NumberField label="AC" value={member.ac} placeholder="10" ariaLabel={`Armor Class of ${member.name}`} onCommit={setNum('ac')} />
        <NumberField label="HP" value={member.hp} placeholder="—" ariaLabel={`Current HP of ${member.name}`} onCommit={setNum('hp')} />
        <NumberField label="Max HP" value={member.maxHp} placeholder="—" ariaLabel={`Max HP of ${member.name}`} onCommit={setNum('maxHp')} />
        <NumberField label="Init" value={member.initMod} placeholder="+0" ariaLabel={`Initiative modifier of ${member.name}`} onCommit={setNum('initMod')} />
      </div>

      <div className="party-member__group" role="group" aria-label={`Passive scores for ${member.name}`}>
        <NumberField label="Pass. Perception" value={member.passivePerception} placeholder="10" ariaLabel={`Passive Perception of ${member.name}`} onCommit={setNum('passivePerception')} />
        <NumberField label="Pass. Investigation" value={member.passiveInvestigation} placeholder="10" ariaLabel={`Passive Investigation of ${member.name}`} onCommit={setNum('passiveInvestigation')} />
        <NumberField label="Pass. Insight" value={member.passiveInsight} placeholder="10" ariaLabel={`Passive Insight of ${member.name}`} onCommit={setNum('passiveInsight')} />
      </div>

      <div className="party-member__group" role="group" aria-label={`Spellcasting for ${member.name}`}>
        <NumberField label="Spell save DC" value={member.spellSaveDc} placeholder="—" ariaLabel={`Spell save DC of ${member.name}`} onCommit={setNum('spellSaveDc')} />
        <NumberField label="Spell atk" value={member.spellAttack} placeholder="—" ariaLabel={`Spell attack bonus of ${member.name}`} onCommit={setNum('spellAttack')} />
      </div>

      <label className="party-member__notes">
        <span>Notes</span>
        <input defaultValue={member.notes} placeholder="Saves, resistances, reminders…" aria-label={`Notes for ${member.name}`} onBlur={(e) => updateMember(member.id, { notes: e.target.value })} />
      </label>

      <button
        type="button"
        className="screen-action-button screen-action-button--danger party-member__remove"
        onClick={() => removeMember(member.id)}
        aria-label={`Remove ${member.name}`}
      >
        Remove
      </button>
    </li>
  );
}

export default function PartySetup() {
  const members = usePartyStore((state) => state.members);
  const addMember = usePartyStore((state) => state.addMember);

  return (
    <details className="party-setup header-party">
      <summary className="screen-action-button screen-action-button--quiet">
        Edit party{members.length ? ` · ${members.length}` : ''}
      </summary>
      <div className="party-setup__panel" aria-label="Party setup">
        <div className="party-setup__head">
          <h2>Your party</h2>
          <p>Set up your characters once — AC, HP and passives are reused in every combat and scene. Leave a field blank if you don't track it.</p>
        </div>
        {members.length === 0 ? (
          <p className="tool-empty-state">No characters yet. Add your party and it stays with you across screens and sessions.</p>
        ) : (
          <ul className="party-setup__list">
            {members.map((member) => <PartyMemberRow key={member.id} member={member} />)}
          </ul>
        )}
        <button type="button" className="screen-action-button party-setup__add" onClick={() => addMember()}>
          Add character
        </button>
      </div>
    </details>
  );
}
