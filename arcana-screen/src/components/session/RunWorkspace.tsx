import {
  ArrowRight,
  ArrowsClockwise,
  BookOpenText,
  Bug,
  CaretLeft,
  CaretRight,
  Check,
  Compass,
  Crosshair,
  Eye,
  Flame,
  LinkSimple,
  ListNumbers,
  MagicWand,
  MapPin,
  Note,
  PawPrint,
  PencilSimple,
  Plus,
  ShieldChevron,
  Skull,
  Sparkle,
  Sword,
  Trash,
  User,
  UserCircle,
  X,
  UserFocus,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  advanceNarrativeBeat,
  advanceSocialClock,
  completeExplorationMoment,
  selectExplorationMoment,
  type FocusId,
  type FocusWorkspace,
} from '../../domain/focusModel';
import { addCombatant, adjustTemporaryHp, advanceTurn, applyDamage, createCombatant, healCombatant, removeCombatant, sortCombatants, type EncounterCombatant, type EncounterState } from '../../domain/encounterModel';
import { mintNpc } from '../../domain/npcModel';
import { usePartyStore } from '../../store/usePartyStore';
import type { PartyMember } from '../../domain/partyModel';
import FocusSelector from './FocusSelector';
import PartyGlance from './PartyGlance';
import SessionSpine from './SessionSpine';
import QuickCaptureBar from './QuickCaptureBar';
import UtilityDock from './UtilityDock';
import './session.css';

export interface RunWorkspaceProps {
  workspace: FocusWorkspace;
  onFocusChange: (focus: FocusId) => void;
  onWorkspaceChange: (workspace: FocusWorkspace) => void;
}

const PACING_PHASES = ['Setup', 'Develop', 'Peak', 'Resolve'] as const;
const pacingPhase = (pacing: number) => PACING_PHASES[Math.min(3, Math.max(0, pacing - 1))];

// Per-entity icons: give each combatant/NPC a distinct glyph instead of one shared shield.
const COMBATANT_ICONS: Array<[RegExp, Icon]> = [
  [/spider|insect|swarm|vermin|beetle/, Bug],
  [/undead|skelet|zombie|wraith|ghost|lich/, Skull],
  [/wolf|worg|hound|\bdog\b|beast|bear|boar|feral|ferocious/, PawPrint],
  [/shaman|mage|wizard|warlock|sorcer|spellcast|caster|cleric|priest|witch|druid/, MagicWand],
  [/archer|ranged|\bbow\b|hunter|sniper/, Crosshair],
  [/dragon|drake|wyrm|flame|\bfire\b|elemental/, Flame],
  [/goblin|kobold|\borc\b|minion|grunt|bandit|soldier|melee|brute|thug/, Sword],
];
export const combatantIcon = (name: string, detail?: string): Icon => {
  const haystack = `${name} ${detail ?? ''}`.toLowerCase();
  return COMBATANT_ICONS.find(([pattern]) => pattern.test(haystack))?.[1] ?? ShieldChevron;
};
// No portrait data available, so vary the NPC glyph deterministically by position.
export const NPC_ICONS: Icon[] = [UserCircle, User, UserFocus, UsersThree];

// Map a roster PC to an encounter combatant so the party auto-populates Combat (no re-keying).
export const combatantIdForMember = (memberId: string): string => `pc-${memberId}`;
export const combatantFromMember = (member: PartyMember): EncounterCombatant => {
  const maxHp = member.maxHp ?? member.hp ?? 10;
  return {
    id: combatantIdForMember(member.id),
    name: member.name,
    detail: member.playerName ?? 'Player character',
    initiative: member.initMod ?? 0,
    tieBreaker: member.initMod ?? 0,
    // No stored init modifier means the roll is unknown — flag it so the tracker shows "—" until the DM sets it.
    initiativeUnset: member.initMod === undefined ? true : undefined,
    hp: member.hp ?? maxHp,
    maxHp,
    tempHp: 0,
    conditions: [],
    ac: member.ac,
  };
};

// Click the initiative number to type the rolled value; commits on blur / Enter (caller re-sorts).
// Unset (roster PC not yet rolled) renders as a dashed "—" so it never reads as a real 0.
function InitiativeCell({ value, unset, ariaLabel, onCommit }: { value: number; unset?: boolean; ariaLabel: string; onCommit: (value: number) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        type="number"
        className="initiative-input"
        ref={(el) => { if (el) { el.focus(); el.select(); } }}
        defaultValue={unset ? '' : value}
        placeholder="—"
        aria-label={ariaLabel}
        onBlur={(event) => { const raw = event.target.value.trim(); if (raw !== '') onCommit(Number(raw)); setEditing(false); }}
        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
      />
    );
  }
  return (
    <button type="button" className={`initiative-score${unset ? ' initiative-score--unset' : ''}`} aria-label={ariaLabel} onClick={() => setEditing(true)}>
      {unset ? '—' : value}<PencilSimple size={11} aria-hidden="true" />
    </button>
  );
}

const clockSegments = (value: number, total: number, label: string) => (
  <div className="segment-clock" role="img" aria-label={`${label}: ${value} of ${total}`}>
    {Array.from({ length: total }, (_, index) => (
      <span key={index} className={index < value ? 'is-filled' : ''} />
    ))}
  </div>
);

function Notebook({ workspace }: { workspace: FocusWorkspace }) {
  const notebook = workspace.universal.notebook;
  return (
    <article className="notebook-panel">
      <header className="panel-title">
        <div>
          <span className="eyebrow">Live notes</span>
          <h2>Session Notebook</h2>
        </div>
        <span className="saved-note"><Check size={15} /> Saved locally</span>
      </header>
      <div className="notebook-scene">
        <span>Current scene</span>
        <h3>{notebook.sceneTitle}</h3>
      </div>
      <div className="notebook-sections">
        {notebook.sections.map((section) => (
          <section key={section.id}>
            <h4>{section.title}</h4>
            {section.body && <p>{section.body}</p>}
            {section.items.length > 0 && (
              <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

function SocialNotebook({ workspace, onWorkspaceChange }: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'>) {
  const social = workspace.contexts.social;
  const recent = workspace.universal.captures.at(-1);
  const updateSceneTitle = (sceneTitle: string) => onWorkspaceChange({ ...workspace, universal: { ...workspace.universal, notebook: { ...workspace.universal.notebook, sceneTitle } }, contexts: { ...workspace.contexts, social: { ...social, sceneTitle } } });
  const promoteRecent = () => {
    if (!recent) return;
    const sections = workspace.universal.notebook.sections.map((section, index, all) => index === all.length - 1 && !section.items.includes(recent.text) ? { ...section, items: [...section.items, recent.text] } : section);
    onWorkspaceChange({ ...workspace, universal: { ...workspace.universal, notebook: { ...workspace.universal.notebook, sections } } });
  };
  return (
    <article className="notebook-panel social-notebook">
      <header className="panel-title"><div><span className="eyebrow">Live notes</span><h2>Session Notebook</h2></div><span className="saved-note"><Check size={15} /> Saved locally</span></header>
      <div className="social-scene-heading">
        <UserCircle size={32} />
        <div><span>Current scene</span><input className="social-scene-input" aria-label="Social scene title" value={social.sceneTitle} onChange={(event) => updateSceneTitle(event.target.value)} /></div>
        <PencilSimple size={17} aria-hidden="true" />
      </div>
      <section className="social-note-section">
        <h3>What the players know</h3>
        <ul><li>The gate seals the inner crypt and keeps something inside.</li><li>Three wards must be unbound in any order.</li><li>The bronze scales respond to voice and intent.</li><li>Lord Vhal's lieutenants still watch this place.</li></ul>
      </section>
      <section className="social-note-section">
        <h3>Scene beats</h3>
        <ol><li><strong>The approach:</strong> Describe the gate, the silent statues, the weight of vhalic magic.</li><li><strong>The parley:</strong> The wardens step forward—test trust, titles, or proof of purpose.</li><li><strong>The trade:</strong> Offer information, oath, or boon to earn one ward.</li><li><strong>The cost:</strong> Each unbound ward draws attention from within.</li></ol>
      </section>
      <section className="social-note-section">
        <h3>Open threads</h3>
        <ul><li>Who benefits if the gate opens?</li><li>What is the price of breaking a vhalic oath?</li><li>Which faction seeks the thing sealed inside?</li></ul>
      </section>
      <footer className="notebook-recent"><Note size={17} /><strong>Recent capture</strong><span>{recent?.text ?? 'Ser Kael offered his family signet to quiet the left warden.'}</span>{recent ? <button type="button" onClick={promoteRecent}>Promote to notebook</button> : <time>prepared</time>}</footer>
    </article>
  );
}

function NarrativeNotebook({ workspace, onWorkspaceChange }: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'>) {
  const narrative = workspace.contexts.narrative;
  const notebook = workspace.universal.notebook;
  const toggleBeat = (beatId: string) => onWorkspaceChange({
    ...workspace,
    contexts: {
      ...workspace.contexts,
      narrative: {
        ...narrative,
        beats: narrative.beats.map((beat) => beat.id === beatId ? { ...beat, completed: !beat.completed } : beat),
      },
    },
  });
  return (
    <article className="narrative-notebook">
      <header className="panel-title"><div><span className="eyebrow">Live notes</span><h2>Session Notebook</h2></div><span className="saved-note"><Check size={15} /> Saved locally</span></header>
      <div className="narrative-notebook__grid">
        <div className="narrative-document">
          <div className="notebook-scene"><span>Current scene</span><h3>{notebook.sceneTitle}</h3></div>
          <section><h4>Scene setup</h4><p>{notebook.sections[0]?.body}</p></section>
          <section><h4>Characters present</h4><ul>{notebook.sections[1]?.items.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="beats-to-hit"><h4>Beats to hit</h4>{narrative.beats.map((beat, index) => <button key={beat.id} type="button" onClick={() => toggleBeat(beat.id)} className={index + 1 === narrative.currentBeat ? 'is-current' : ''}><span aria-hidden="true">{beat.completed ? '✓' : index + 1}</span><p><strong>{beat.title}</strong><small>{beat.detail}</small></p></button>)}</section>
          <section><h4>Reveals & callbacks</h4><ul>{notebook.sections[2]?.items.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div>
        <aside className="margin-notes" aria-label="Notebook margin notes">
          <h3><Note size={15} /> Pinned notes</h3>
          <article><strong>The Emberwright Rite</strong><p>The Flamebound are honored once a year. Their names are etched in ash and wind.</p></article>
          <article><strong>Watcher in the Crowd</strong><p>Always just far enough away. Knows more than they should.</p></article>
          <h3><PencilSimple size={15} /> Recent capture</h3>
          <p>Lira noticed the cloaked figure whispering to a boy near the east gate.</p>
          <h3><BookOpenText size={15} /> Source</h3><a href="https://www.dndbeyond.com/sources/dnd/free-rules" target="_blank" rel="noreferrer">City of Vhal Gazetteer · p. 23</a>
        </aside>
      </div>
    </article>
  );
}

function PinnedReference({ title, detail, source }: { title: string; detail: string; source: string }) {
  return (
    <section className="pinned-reference">
      <span className="eyebrow">Pinned reference</span>
      <h3><LinkSimple size={17} /> {title}</h3>
      <p>{detail}</p>
      <a href="https://www.dndbeyond.com/sources/dnd/free-rules" target="_blank" rel="noreferrer">{source} <ArrowRight size={14} /></a>
    </section>
  );
}

function NarrativeView({ workspace, onWorkspaceChange }: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'>) {
  const narrative = workspace.contexts.narrative;
  const beat = narrative.beats[Math.max(0, narrative.currentBeat - 1)];
  return (
    <div className="focus-layout narrative-layout">
      <aside className="notebook-outline" aria-label="Notebook outline">
        <span className="eyebrow">Notebook outline</span>
        {['Scene setup', 'Characters', 'Beats', 'Reveals', 'Aftermath'].map((label, index) => (
          <button
            key={label}
            type="button"
            className={narrative.currentSection === label.toLowerCase().replace(' ', '-') || (index === 0 && narrative.currentSection === 'setup') ? 'is-active' : ''}
            onClick={() => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, narrative: { ...narrative, currentSection: index === 0 ? 'setup' : label.toLowerCase().replace(' ', '-') } } })}
          >{label}</button>
        ))}
      </aside>
      <NarrativeNotebook workspace={workspace} onWorkspaceChange={onWorkspaceChange} />
      {narrative.drawerOpen && (
        <aside className="focus-context narrative-context">
          <header>
            <div><span className="eyebrow">Run context</span><h2>Narrative Focus</h2></div>
            <button
              type="button"
              className="icon-action"
              aria-label="Close Narrative Focus"
              onClick={() => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, narrative: { ...narrative, drawerOpen: false } } })}
            ><CaretRight size={19} /></button>
          </header>
          <section className="current-beat">
            <span>Current beat · {narrative.currentBeat} of {narrative.beats.length}</span>
            <h3>{beat?.title}</h3>
            <p>{beat?.detail}</p>
          </section>
          <section>
            <h3 className="section-label">Open threads</h3>
            <div className="thread-list">
              {narrative.openThreads.map((thread) => <p key={thread.title}><strong>{thread.title}</strong><span>{thread.detail}</span></p>)}
            </div>
          </section>
          <section>
            <h3 className="section-label">Pacing</h3>
            <button
              type="button"
              className="pacing-stepper"
              aria-label={`Pacing: ${pacingPhase(narrative.pacing)}, step ${narrative.pacing} of 4. Advance pacing.`}
              onClick={() => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, narrative: { ...narrative, pacing: narrative.pacing >= 4 ? 1 : narrative.pacing + 1 } } })}
            >
              {PACING_PHASES.map((phase, index) => (
                <span key={phase} className={`pacing-step${index + 1 === narrative.pacing ? ' is-current' : index + 1 < narrative.pacing ? ' is-done' : ''}`}>
                  <span className="pacing-step__num" aria-hidden="true">{index + 1}</span>
                  <span className="pacing-step__label">{phase}</span>
                </span>
              ))}
            </button>
            <p className="pacing-caption">You're in {pacingPhase(narrative.pacing)}</p>
          </section>
          <button type="button" className="primary-run-action" onClick={() => onWorkspaceChange(advanceNarrativeBeat(workspace))}>
            Move to next beat <ArrowRight size={19} />
          </button>
        </aside>
      )}
      {!narrative.drawerOpen && (
        <button
          type="button"
          className="drawer-reopen"
          onClick={() => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, narrative: { ...narrative, drawerOpen: true } } })}
        ><CaretLeft size={18} /> Narrative Focus</button>
      )}
    </div>
  );
}

function SocialView({ workspace, onWorkspaceChange }: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'>) {
  const social = workspace.contexts.social;
  const [confirmClockReset, setConfirmClockReset] = useState(false);
  const [roleDraft, setRoleDraft] = useState('');
  const [lastMintedId, setLastMintedId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const attitudes = ['Guarded', 'Friendly', 'Neutral'] as const;
  const setNpcs = (npcs: typeof social.npcs) => onWorkspaceChange({
    ...workspace,
    contexts: { ...workspace.contexts, social: { ...social, npcs } },
  });
  const cycleAttitude = (npcId: string) => setNpcs(social.npcs.map((npc) => npc.id === npcId
    ? { ...npc, attitude: attitudes[(attitudes.indexOf(npc.attitude) + 1) % attitudes.length] }
    : npc));
  const mintNpcIntoScene = () => {
    const npc = { id: `npc-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`, ...mintNpc(roleDraft) };
    setNpcs([npc, ...social.npcs]); // newest first so a tap is always visible
    setLastMintedId(npc.id);
    setRoleDraft('');
  };
  const removeNpc = (npcId: string) => {
    if (pendingRemove !== npcId) { setPendingRemove(npcId); return; } // confirm — the ✕ sits next to a cycle button
    setNpcs(social.npcs.filter((npc) => npc.id !== npcId));
    setPendingRemove(null);
  };
  // Re-roll an improvised NPC's identity in place, keeping its pinned role (like the attitude toggle, but for the person).
  const rerollNpc = (npcId: string) => {
    const target = social.npcs.find((npc) => npc.id === npcId);
    if (!target) return;
    setNpcs(social.npcs.map((npc) => (npc.id === npcId ? { ...npc, ...mintNpc(target.role) } : npc)));
    setLastMintedId(npcId);
  };
  return (
    <div className="focus-layout social-layout">
      <SocialNotebook workspace={workspace} onWorkspaceChange={onWorkspaceChange} />
      <aside className="focus-context social-context">
        <header><div><span className="eyebrow">Current scene</span><h2>Social Focus</h2></div><UserCircle size={29} /></header>
        <div className="focus-scene-title"><span>The scene</span><strong>{social.sceneTitle}</strong></div>
        <section>
          <div className="section-head">
            <h3 className="section-label">People in the scene</h3>
            <form className="mint-npc-form" onSubmit={(event) => { event.preventDefault(); mintNpcIntoScene(); }}>
              <input aria-label="Role for a new NPC" placeholder="Role (optional)" value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)} />
              <button type="submit" className="mint-npc"><Sparkle size={13} /> Mint NPC</button>
            </form>
          </div>
          <div className="npc-list">
            {social.npcs.map((npc, index) => {
              const NpcIcon = NPC_ICONS[index % NPC_ICONS.length];
              return (
              <article key={npc.id} className={npc.id === lastMintedId ? 'just-minted' : undefined}>
                <div className="npc-avatar"><NpcIcon size={25} /></div>
                <div className="npc-identity">
                  <h3>{npc.name}</h3>
                  <p>{npc.role}{npc.id.startsWith('npc-') && <button type="button" className="npc-reroll" aria-label={`Re-roll ${npc.name}`} title="Re-roll this improvised NPC" onClick={() => rerollNpc(npc.id)}><ArrowsClockwise size={11} /></button>}</p>
                </div>
                <div className="npc-actions">
                  <button type="button" onClick={() => cycleAttitude(npc.id)}>{npc.attitude}</button>
                  <button type="button" className="npc-remove" aria-label={pendingRemove === npc.id ? `Confirm removing ${npc.name}` : `Remove ${npc.name} from the scene`} onClick={() => removeNpc(npc.id)}>{pendingRemove === npc.id ? 'Remove?' : <X size={13} />}</button>
                </div>
                <dl><div><dt>Wants</dt><dd>{npc.motive}</dd></div><div><dt>Secret</dt><dd>{npc.secret}</dd></div></dl>
              </article>
              );
            })}
          </div>
        </section>
        <PinnedReference {...social.pinnedReference} />
        <section className="clock-block">
          <div><h3 className="section-label">Scene Clock</h3><strong>{social.sceneClock} / 8</strong></div>
          {clockSegments(social.sceneClock, 8, 'Scene Clock')}
          <div className="clock-actions">
            <button type="button" onClick={() => onWorkspaceChange(advanceSocialClock(workspace))}>Advance</button>
            {!confirmClockReset ? <button type="button" onClick={() => setConfirmClockReset(true)}>Reset</button> : <><button type="button" onClick={() => { onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, social: { ...social, sceneClock: 0 } } }); setConfirmClockReset(false); }}>Confirm reset</button><button type="button" onClick={() => setConfirmClockReset(false)}>Cancel</button></>}
          </div>
        </section>
      </aside>
    </div>
  );
}

function ExplorationView({ workspace, onWorkspaceChange }: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'>) {
  const exploration = workspace.contexts.exploration;
  const active = exploration.moments.find((moment) => moment.id === exploration.currentMomentId);
  const reference = workspace.universal.references[1] ?? workspace.universal.references[0];
  const [momentDraft, setMomentDraft] = useState('');
  const [clueDraft, setClueDraft] = useState('');
  const [logDraft, setLogDraft] = useState('');
  const addMoment = (event: FormEvent) => {
    event.preventDefault();
    const title = momentDraft.trim();
    if (!title) return;
    onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, exploration: { ...exploration, moments: [...exploration.moments, { id: `${Date.now()}`, title, status: 'prepared' }] } } });
    setMomentDraft('');
  };
  const addClue = (event: FormEvent) => {
    event.preventDefault();
    const clue = clueDraft.trim();
    if (!clue) return;
    onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, exploration: { ...exploration, clues: [...exploration.clues, clue] } } });
    setClueDraft('');
  };
  const addLog = (event: FormEvent) => {
    event.preventDefault();
    const text = logDraft.trim();
    if (!text) return;
    onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, exploration: { ...exploration, liveLog: [...exploration.liveLog, { time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()), text }] } } });
    setLogDraft('');
  };
  return (
    <div className="focus-layout exploration-layout">
      <aside className="session-flow">
        <span className="eyebrow">Session flow</span>
        <h2>Moments</h2>
        {exploration.moments.map((moment, index) => (
          <button key={moment.id} type="button" className={`flow-moment is-${moment.status}`} onClick={() => onWorkspaceChange(selectExplorationMoment(workspace, moment.id))}>
            <span>{index + 1}</span><div><strong>{moment.title}</strong><small>{moment.status}</small></div>
          </button>
        ))}
        <button type="button" className="complete-moment" onClick={() => onWorkspaceChange(completeExplorationMoment(workspace))}>Complete moment <ArrowRight size={16} /></button>
        <form className="add-moment-form" onSubmit={addMoment}><input aria-label="New session moment" value={momentDraft} onChange={(event) => setMomentDraft(event.target.value)} placeholder="Prepare next moment" /><button type="submit" aria-label="Add session moment"><Plus size={15} /></button></form>
      </aside>
      <article className="session-ledger">
        <header className="panel-title"><div><span className="eyebrow">Current location</span><h2>Session Ledger</h2></div><span className="saved-note"><MapPin size={15} /> {active?.title}</span></header>
        <section className="read-aloud"><span>Read aloud</span><p>Cold blue light pools between the arches. Every footstep returns as a whisper in someone else's voice.</p></section>
        <div className="ledger-columns">
          <section><h3>Clues discovered</h3><ul>{exploration.clues.map((clue) => <li key={clue}><Sparkle size={15} /> {clue}</li>)}</ul><form className="ledger-add-form" onSubmit={addClue}><input aria-label="New clue" value={clueDraft} onChange={(event) => setClueDraft(event.target.value)} placeholder="Add clue" /><button type="submit" aria-label="Add clue"><Plus size={14} /></button></form></section>
          <section><h3>What changed</h3><ul>{exploration.changes.map((change) => <li key={change}><Check size={15} /> {change}</li>)}</ul></section>
        </div>
        <section className="live-log"><h3>Live log</h3>{exploration.liveLog.map((entry) => <p key={`${entry.time}-${entry.text}`}><time>{entry.time}</time><span>{entry.text}</span></p>)}<form className="ledger-add-form ledger-add-form--log" onSubmit={addLog}><input aria-label="New log entry" value={logDraft} onChange={(event) => setLogDraft(event.target.value)} placeholder="Record what just happened" /><button type="submit" aria-label="Add log entry"><Plus size={14} /></button></form></section>
      </article>
      <aside className="focus-context exploration-context">
        <header><div><span className="eyebrow">Run context</span><h2>Exploration Focus</h2></div><Compass size={29} /></header>
        <section><h3 className="section-label">Location cues</h3><dl className="cue-list"><div><dt>Light</dt><dd>Cold blue, no visible source</dd></div><div><dt>Sound</dt><dd>Echoes repeat in unfamiliar voices</dd></div><div><dt>Air</dt><dd>Damp current from the east</dd></div></dl></section>
        <section className="clock-block"><div><h3 className="section-label">Discovery Clock</h3><strong>{exploration.discoveryClock} / 5</strong></div>{clockSegments(exploration.discoveryClock, 5, 'Discovery Clock')}<div className="clock-actions"><button type="button" onClick={() => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, exploration: { ...exploration, discoveryClock: Math.min(5, exploration.discoveryClock + 1) } } })}>Advance</button><button type="button" onClick={() => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, exploration: { ...exploration, discoveryClock: 0 } } })}>Reset</button></div></section>
        {reference && <PinnedReference {...reference} />}
      </aside>
    </div>
  );
}

function CombatView({
  workspace,
  onWorkspaceChange,
  onCapture,
  recentCapture,
  onReviewCaptures,
}: Pick<RunWorkspaceProps, 'workspace' | 'onWorkspaceChange'> & { onCapture: (text: string) => void; recentCapture?: string; onReviewCaptures: () => void }) {
  const encounter = workspace.contexts.combat;
  const activeIndex = encounter.currentIndex ?? 0;
  const next = encounter.combatants[(activeIndex + 1) % encounter.combatants.length];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undo, setUndo] = useState<EncounterState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const updateEncounter = (combat: EncounterState) => onWorkspaceChange({ ...workspace, contexts: { ...workspace.contexts, combat } });
  const selected = encounter.combatants.find((combatant) => combatant.id === selectedId);
  const party = usePartyStore((state) => state.members);
  const encounterIds = new Set(encounter.combatants.map((combatant) => combatant.id));
  const anyUnset = encounter.combatants.some((combatant) => combatant.initiativeUnset);
  const addFromRoster = (member: PartyMember) => { setUndo(encounter); updateEncounter(addCombatant(encounter, combatantFromMember(member))); };
  const setInitiative = (id: string, value: number) => {
    setUndo(encounter);
    updateEncounter({ ...encounter, combatants: sortCombatants(encounter.combatants.map((combatant) => (combatant.id === id ? { ...combatant, initiative: value, initiativeUnset: undefined } : combatant))) });
  };
  // Batch entry: type every roll first, sort once — so the list never reflows the row you're about to edit.
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchDraft, setBatchDraft] = useState<Record<string, string>>({});
  const openBatch = () => {
    const draft: Record<string, string> = {};
    encounter.combatants.forEach((combatant) => { draft[combatant.id] = combatant.initiativeUnset ? '' : String(combatant.initiative); });
    setBatchDraft(draft);
    setBatchOpen(true);
  };
  const closeBatch = () => { setBatchOpen(false); setBatchDraft({}); };
  const firstBatchField = useRef<HTMLInputElement | null>(null);
  useEffect(() => { if (batchOpen) { firstBatchField.current?.focus(); firstBatchField.current?.select(); } }, [batchOpen]);
  // Add an ad-hoc NPC/monster to the encounter (the missing on-ramp in Run mode).
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState({ name: '', ac: '', hp: '', init: '', qty: '1' });
  const [addedNote, setAddedNote] = useState('');
  const addNameField = useRef<HTMLInputElement | null>(null);
  useEffect(() => { if (addOpen) addNameField.current?.focus(); }, [addOpen]);
  const resetAdd = () => { setAddDraft({ name: '', ac: '', hp: '', init: '', qty: '1' }); setAddedNote(''); setAddOpen(false); };
  const optNum = (value: string) => (value.trim() === '' ? undefined : Number(value));
  const submitAdd = () => {
    const name = addDraft.name.trim();
    if (!name) return;
    const qty = Math.max(1, Math.min(20, Math.floor(Number(addDraft.qty) || 1)));
    const ac = optNum(addDraft.ac);
    const hp = optNum(addDraft.hp);
    const initiative = optNum(addDraft.init);
    setUndo(encounter);
    const taken = new Set(encounter.combatants.map((combatant) => combatant.id));
    const makeId = (base: string) => { let id = base; let n = 1; while (taken.has(id)) id = `${base}-${n++}`; taken.add(id); return id; };
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'npc';
    let updated = encounter;
    for (let index = 0; index < qty; index += 1) {
      const label = qty > 1 ? `${name} ${index + 1}` : name;
      updated = addCombatant(updated, createCombatant(makeId(`npc-${slug}`), { name: label, ac, hp, initiative }));
    }
    updateEncounter(updated);
    // Keep the form open for a continuous build (a whole encounter is many statblocks); acknowledge the add.
    setAddDraft({ name: '', ac: '', hp: '', init: '', qty: '1' });
    setAddedNote(qty > 1 ? `Added ${name} ×${qty}` : `Added ${name}`);
    addNameField.current?.focus();
  };
  const applyBatch = () => {
    setUndo(encounter);
    const combatants = encounter.combatants.map((combatant) => {
      const raw = (batchDraft[combatant.id] ?? '').trim();
      return raw === '' ? combatant : { ...combatant, initiative: Number(raw), initiativeUnset: undefined };
    });
    updateEncounter({ ...encounter, combatants: sortCombatants(combatants) });
    closeBatch();
  };
  const changeHp = (amount: number) => {
    if (!selected) return;
    setUndo(encounter);
    updateEncounter(amount < 0 ? applyDamage(encounter, selected.id, Math.abs(amount)) : healCombatant(encounter, selected.id, amount));
  };
  const changeTempHp = (amount: number) => {
    if (!selected) return;
    setUndo(encounter);
    updateEncounter(adjustTemporaryHp(encounter, selected.id, amount));
  };
  const changeConditions = (value: string) => {
    if (!selected) return;
    setUndo(encounter);
    updateEncounter({
      ...encounter,
      combatants: encounter.combatants.map((combatant) => combatant.id === selected.id
        ? { ...combatant, conditions: value.split(',').map((condition) => condition.trim()).filter(Boolean) }
        : combatant),
    });
  };
  const resetEncounter = () => {
    setUndo(encounter);
    updateEncounter({ round: 1, currentIndex: null, combatants: [] });
    setConfirmReset(false);
    setSelectedId(null);
  };
  const removeSelected = () => {
    if (!selected) return;
    setUndo(encounter);
    updateEncounter(removeCombatant(encounter, selected.id));
    setSelectedId(null);
  };
  return (
    <div className="focus-layout combat-layout">
      <section className="initiative-panel">
        <header className="panel-title"><h2>Initiative Tracker</h2><div className="tracker-tools">{encounter.combatants.length > 1 && <button type="button" className={`batch-init-toggle${anyUnset ? ' batch-init-toggle--urgent' : ''}`} aria-expanded={batchOpen} onClick={() => (batchOpen ? closeBatch() : openBatch())}><ListNumbers size={15} /> Set initiative</button>}<strong>Round {encounter.round}</strong></div></header>
        {batchOpen && encounter.combatants.length > 0 ? (
          <form className="batch-init" role="region" aria-label="Set initiative order" onSubmit={(event) => { event.preventDefault(); applyBatch(); }}>
            <p className="batch-init__hint">Type each roll, then apply once — the list won’t reorder while you enter them.</p>
            <div className="batch-init__rows" style={{ gridTemplateRows: `repeat(${Math.ceil(encounter.combatants.length / 2)}, auto)` }}>
              {encounter.combatants.map((combatant, index) => (
                <label key={combatant.id}>
                  <span>{combatant.name}</span>
                  <input type="number" ref={index === 0 ? firstBatchField : undefined} aria-label={`Set ${combatant.name} initiative`} placeholder="—" value={batchDraft[combatant.id] ?? ''} onChange={(event) => setBatchDraft((draft) => ({ ...draft, [combatant.id]: event.target.value }))} />
                </label>
              ))}
            </div>
            <div className="batch-init__actions">
              <button type="submit">Apply order</button>
              <button type="button" onClick={closeBatch}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="initiative-head" aria-hidden="true"><span>Init</span><span>Combatant</span><span>HP</span><span>Status</span></div>
            <div className="combatant-list">
              {encounter.combatants.map((combatant, index) => {
                const isActive = index === activeIndex;
                const CombatantIcon = combatantIcon(combatant.name, combatant.detail);
                return (
                  <article key={combatant.id} className={isActive ? 'is-active' : ''}>
                    <InitiativeCell value={combatant.initiative} unset={combatant.initiativeUnset} ariaLabel={combatant.initiativeUnset ? `Set rolled initiative for ${combatant.name}` : `Initiative for ${combatant.name}`} onCommit={(value) => setInitiative(combatant.id, value)} />
                    <button type="button" className="combatant-identity" aria-label={`Manage ${combatant.name}`} aria-pressed={selectedId === combatant.id} onClick={() => setSelectedId(selectedId === combatant.id ? null : combatant.id)}><span><CombatantIcon size={23} /></span><p><strong>{combatant.name}</strong><small>{combatant.detail}</small></p><span className={`combatant-ac${combatant.ac === undefined ? ' combatant-ac--unset' : ''}`} aria-label={combatant.ac !== undefined ? `Armor Class ${combatant.ac}` : `Armor Class not set for ${combatant.name}`}>AC {combatant.ac ?? '—'}</span>{isActive && <em>Active</em>}</button>
                    <div className="combatant-hp"><span>{combatant.hp} / {combatant.maxHp}</span><i><b style={{ width: `${Math.round(combatant.hp / combatant.maxHp * 100)}%` }} /></i></div>
                    <div className="condition-chips">{combatant.conditions.map((condition) => <span key={condition}>{condition}</span>)}</div>
                  </article>
                );
              })}
            </div>
          </>
        )}
        {party.length > 0 && (
          <div className="roster-picker" role="group" aria-label="Add party members to the encounter">
            <span>Add from party</span>
            {party.map((member) => {
              const added = encounterIds.has(combatantIdForMember(member.id));
              return (
                <button key={member.id} type="button" className="roster-chip" disabled={added} aria-label={added ? `${member.name} is already in the encounter` : `Add ${member.name} to the encounter`} onClick={() => addFromRoster(member)}>
                  {added ? <Check size={13} /> : <Plus size={13} />} {member.name}
                </button>
              );
            })}
          </div>
        )}
        {!batchOpen && (
          <div className="encounter-add">
            {addOpen ? (
              <form className="encounter-add__form" role="group" aria-label="Add a combatant" onSubmit={(event) => { event.preventDefault(); submitAdd(); }}>
                <input ref={addNameField} className="add-name" aria-label="New combatant name" placeholder="Name" value={addDraft.name} onChange={(event) => setAddDraft((draft) => ({ ...draft, name: event.target.value }))} />
                <label className="add-field"><span>AC</span><input type="number" aria-label="New combatant AC" value={addDraft.ac} onChange={(event) => setAddDraft((draft) => ({ ...draft, ac: event.target.value }))} /></label>
                <label className="add-field"><span>HP</span><input type="number" aria-label="New combatant HP" value={addDraft.hp} onChange={(event) => setAddDraft((draft) => ({ ...draft, hp: event.target.value }))} /></label>
                <label className="add-field"><span>Init</span><input type="number" aria-label="New combatant initiative" value={addDraft.init} onChange={(event) => setAddDraft((draft) => ({ ...draft, init: event.target.value }))} /></label>
                <label className="add-field"><span>Qty</span><input type="number" min="1" max="20" aria-label="How many combatants" value={addDraft.qty} onChange={(event) => setAddDraft((draft) => ({ ...draft, qty: event.target.value }))} /></label>
                <button type="submit">Add</button>
                <button type="button" onClick={resetAdd}>Done</button>
                <span className="add-note" aria-live="polite">{addedNote}</span>
              </form>
            ) : (
              <button type="button" className="encounter-add__toggle" onClick={() => setAddOpen(true)}><Plus size={13} /> Add combatant</button>
            )}
          </div>
        )}
        <footer className="initiative-footer">
          <p>Up next: <strong>{next?.name ?? '—'}</strong> {next ? `(${next.initiative})` : ''}</p>
          <button type="button" onClick={() => updateEncounter(advanceTurn(encounter))}>Next Turn <ArrowRight size={22} /></button>
        </footer>
        {!selected && encounter.combatants.length > 0 && <p className="tracker-hint">Tap a combatant to adjust HP, temp HP and conditions. Tap its initiative to set the rolled value.</p>}
        {selected && <div className="combat-live-editor" role="region" aria-label={`Live controls for ${selected.name}`}><strong>{selected.name}</strong><span>HP {selected.hp} / {selected.maxHp} · Temp {selected.tempHp}</span><button type="button" onClick={() => changeHp(-5)}>−5 HP</button><button type="button" onClick={() => changeHp(-1)}>−1 HP</button><button type="button" onClick={() => changeHp(1)}>+1 HP</button><button type="button" onClick={() => changeHp(5)}>+5 HP</button><button type="button" onClick={() => changeTempHp(-1)}>−1 Temp</button><button type="button" onClick={() => changeTempHp(1)}>+1 Temp</button><label>Conditions<input aria-label={`Conditions for ${selected.name}`} value={selected.conditions.join(', ')} onChange={(event) => changeConditions(event.target.value)} placeholder="Prone, poisoned…" /></label><button type="button" className="remove-combatant" aria-label={`Remove ${selected.name} from the encounter`} onClick={removeSelected}><Trash size={14} /> Remove</button></div>}
        <p className="sr-only" aria-live="polite">Round {encounter.round}, {encounter.combatants[activeIndex]?.name} is active.</p>
      </section>
      <aside className="combat-context">
        <QuickCaptureBar onCapture={onCapture} recentCapture={recentCapture} captureCount={workspace.universal.captures.length} onReview={onReviewCaptures} />
        <section className="quick-reference">
          <header className="panel-title"><h2>Quick Reference</h2><Eye size={20} /></header>
          <div><h3>Conditions</h3><p><strong>Blinded</strong><span>A creature can't see.</span></p><p><strong>Charmed</strong><span>Can't attack the charmer.</span></p><p><strong>Frightened</strong><span>Disadvantage while the source is in sight.</span></p><p><strong>Grappled</strong><span>Speed becomes 0.</span></p><p><strong>Incapacitated</strong><span>Can't take actions.</span></p></div>
          <div><h3>Cover</h3><p><strong>Half Cover</strong><span>+2 AC and Dex saves</span></p><p><strong>Three-Quarters</strong><span>+5 AC and Dex saves</span></p><p><strong>Total Cover</strong><span>Can't be targeted directly</span></p></div>
          <div><h3>Encounter notes</h3><ul><li>The worg is protecting the goblin shaman.</li><li>Webbing on the north wall can be burned away.</li><li>Cracked pillar (AC 15, 30 HP) can provide cover.</li></ul></div>
          <a className="combat-source" href="https://www.dndbeyond.com/sources/dnd/free-rules" target="_blank" rel="noreferrer"><BookOpenText size={15} /> Monster Manual (Basic Rules 2024) <ArrowRight size={14} /></a>
        </section>
        <div className="encounter-recovery-actions">
          {undo && <button type="button" onClick={() => { updateEncounter(undo); setUndo(null); }}>Undo encounter change</button>}
          {!confirmReset ? <button type="button" onClick={() => setConfirmReset(true)} disabled={encounter.combatants.length === 0}>Reset encounter</button> : <div role="alert"><span>Clear the encounter and return to round 1?</span><button type="button" onClick={resetEncounter}>Confirm reset</button><button type="button" onClick={() => setConfirmReset(false)}>Cancel</button></div>}
        </div>
      </aside>
    </div>
  );
}

function GeneralView({ workspace }: { workspace: FocusWorkspace }) {
  return <div className="focus-layout general-layout"><Notebook workspace={workspace} /><aside className="focus-context"><BookOpenText size={30} /><h2>Choose a Focus</h2><p>Keep universal notes visible, then bring forward the context your table needs now.</p></aside></div>;
}

export default function RunWorkspace({ workspace, onFocusChange, onWorkspaceChange }: RunWorkspaceProps) {
  const [capturesOpen, setCapturesOpen] = useState(false);
  const capture = useCallback((text: string) => {
    onWorkspaceChange({
      ...workspace,
      universal: {
        ...workspace.universal,
        captures: [...workspace.universal.captures, { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, text, createdAt: new Date().toISOString(), status: 'inbox' }],
      },
    });
  }, [onWorkspaceChange, workspace]);
  const recentCapture = workspace.universal.captures.at(-1)?.text;
  const updateCapture = (id: string, updates: Partial<FocusWorkspace['universal']['captures'][number]>) => onWorkspaceChange({
    ...workspace,
    universal: {
      ...workspace.universal,
      captures: workspace.universal.captures.map((captureItem) => captureItem.id === id ? { ...captureItem, ...updates } : captureItem),
    },
  });
  const deleteCapture = (id: string) => onWorkspaceChange({
    ...workspace,
    universal: { ...workspace.universal, captures: workspace.universal.captures.filter((captureItem) => captureItem.id !== id) },
  });
  const promoteCapture = (id: string) => {
    const captureItem = workspace.universal.captures.find((candidate) => candidate.id === id);
    if (!captureItem) return;
    const sections = workspace.universal.notebook.sections.map((section, index, all) => index === all.length - 1 && !section.items.includes(captureItem.text)
      ? { ...section, items: [...section.items, captureItem.text] }
      : section);
    onWorkspaceChange({
      ...workspace,
      universal: {
        ...workspace.universal,
        notebook: { ...workspace.universal.notebook, sections },
        captures: workspace.universal.captures.map((candidate) => candidate.id === id ? { ...candidate, status: 'promoted' } : candidate),
      },
    });
  };

  return (
    <main id="main-content" tabIndex={-1} className={`arcana-session run-workspace run-workspace--${workspace.currentFocus ?? 'general'}`}>
      <FocusSelector currentFocus={workspace.currentFocus} onChange={onFocusChange} />
      <div className="run-workspace__body">
        {workspace.currentFocus === 'narrative' && <NarrativeView workspace={workspace} onWorkspaceChange={onWorkspaceChange} />}
        {workspace.currentFocus === 'social' && <SocialView workspace={workspace} onWorkspaceChange={onWorkspaceChange} />}
        {workspace.currentFocus === 'exploration' && <ExplorationView workspace={workspace} onWorkspaceChange={onWorkspaceChange} />}
        {workspace.currentFocus === 'combat' && <CombatView workspace={workspace} onWorkspaceChange={onWorkspaceChange} onCapture={capture} recentCapture={recentCapture} onReviewCaptures={() => setCapturesOpen(true)} />}
        {workspace.currentFocus === null && <GeneralView workspace={workspace} />}
      </div>
      {workspace.currentFocus !== 'combat' && (
        <div className="run-capture">
          <SessionSpine workspace={workspace} onWorkspaceChange={onWorkspaceChange} />
          <div className="run-capture__row">
            <QuickCaptureBar onCapture={capture} recentCapture={recentCapture} captureCount={workspace.universal.captures.length} onReview={() => setCapturesOpen(true)} />
            <PartyGlance focus={workspace.currentFocus} />
          </div>
        </div>
      )}
      {capturesOpen && (
        <section className="capture-review" role="dialog" aria-modal="false" aria-labelledby="capture-review-title">
          <header><div><span className="eyebrow">Session inbox</span><h2 id="capture-review-title">Review captures</h2></div><button type="button" aria-label="Close capture review" onClick={() => setCapturesOpen(false)}>Close</button></header>
          {workspace.universal.captures.length === 0 ? <p>No captures waiting for review.</p> : (
            <div className="capture-review__list">
              {workspace.universal.captures.map((captureItem) => (
                <article key={captureItem.id}>
                  <label>Capture text<input aria-label="Capture text" value={captureItem.text} onChange={(event) => updateCapture(captureItem.id, { text: event.target.value })} /></label>
                  <time dateTime={captureItem.createdAt}>{new Date(captureItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  <span className={`capture-status capture-status--${captureItem.status ?? 'inbox'}`}>{captureItem.status === 'promoted' ? 'Promoted' : captureItem.status === 'kept' ? 'Kept' : 'Inbox'}</span>
                  <div><button type="button" onClick={() => updateCapture(captureItem.id, { status: 'kept' })}>Keep capture</button><button type="button" onClick={() => promoteCapture(captureItem.id)}>Promote capture</button><button type="button" className="is-danger" onClick={() => deleteCapture(captureItem.id)}>Delete capture</button></div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      <UtilityDock workspace={workspace} onChange={onWorkspaceChange} onCapture={capture} />
    </main>
  );
}
