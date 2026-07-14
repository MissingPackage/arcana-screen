import { usePartyStore } from '../../store/usePartyStore';
import type { PartyMember } from '../../domain/partyModel';

// Uncontrolled inputs committed on blur: the editor never fights the DM mid-typing
// (clearing a field to retype won't snap it back to a default while you type).
function PartyMemberRow({ member }: { member: PartyMember }) {
  const updateMember = usePartyStore((state) => state.updateMember);
  const removeMember = usePartyStore((state) => state.removeMember);
  const num = (raw: string, fallback: number) => (raw.trim() === '' ? fallback : Number(raw));

  return (
    <li className="party-member">
      <label className="party-member__name">
        <span>Name</span>
        <input
          defaultValue={member.name}
          aria-label={`Name of ${member.name}`}
          onBlur={(event) => updateMember(member.id, { name: event.target.value })}
        />
      </label>
      <div className="party-member__stats">
        <label><span>AC</span><input type="number" min={0} defaultValue={member.ac} aria-label={`Armor Class of ${member.name}`} onBlur={(e) => updateMember(member.id, { ac: num(e.target.value, member.ac) })} /></label>
        <label><span>HP</span><input type="number" min={0} defaultValue={member.hp} aria-label={`Current HP of ${member.name}`} onBlur={(e) => updateMember(member.id, { hp: num(e.target.value, member.hp) })} /></label>
        <label><span>Max</span><input type="number" min={0} defaultValue={member.maxHp} aria-label={`Max HP of ${member.name}`} onBlur={(e) => updateMember(member.id, { maxHp: num(e.target.value, member.maxHp) })} /></label>
        <label><span>Init</span><input type="number" defaultValue={member.initMod} aria-label={`Initiative modifier of ${member.name}`} onBlur={(e) => updateMember(member.id, { initMod: num(e.target.value, member.initMod) })} /></label>
        <label><span>Pass. Perc.</span><input type="number" min={0} defaultValue={member.passivePerception} aria-label={`Passive Perception of ${member.name}`} onBlur={(e) => updateMember(member.id, { passivePerception: num(e.target.value, member.passivePerception) })} /></label>
        <label><span>Pass. Ins.</span><input type="number" min={0} defaultValue={member.passiveInsight} aria-label={`Passive Insight of ${member.name}`} onBlur={(e) => updateMember(member.id, { passiveInsight: num(e.target.value, member.passiveInsight) })} /></label>
      </div>
      <label className="party-member__notes">
        <span>Notes</span>
        <input
          defaultValue={member.notes}
          placeholder="Saves, resistances, reminders…"
          aria-label={`Notes for ${member.name}`}
          onBlur={(event) => updateMember(member.id, { notes: event.target.value })}
        />
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
        The party{members.length ? ` · ${members.length}` : ''}
      </summary>
      <div className="party-setup__panel" aria-label="Party setup">
        <div className="party-setup__head">
          <h2>Your party</h2>
          <p>Set up your characters once — AC, HP and passives are reused in every combat and scene.</p>
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
