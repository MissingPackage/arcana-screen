import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowElbowDownLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowsOutCardinal,
  Books,
  Bug,
  CaretDown,
  Check,
  CheckCircle,
  Clock,
  CompassRose,
  Copy,
  Crosshair,
  DiceFive,
  Dog,
  DotsThreeVertical,
  EyeSlash,
  Fire,
  GearSix,
  Link,
  ListBullets,
  LockKey,
  MagicWand,
  NotePencil,
  Pause,
  PawPrint,
  PencilSimple,
  Play,
  Plus,
  ShieldCheck,
  ShieldChevron,
  Skull,
  Sword,
  Timer,
  Trash,
  TreeEvergreen,
  X,
} from "@phosphor-icons/react";

const initialScreens = [
  { id: "vhal", name: "Cripta di Vhal", template: "Combat", updated: "8 min ago" },
  { id: "aram", name: "Città di Aram", template: "General", updated: "Yesterday" },
  { id: "north", name: "Viaggio a nord", template: "General", updated: "4 days ago" },
];

const templates = [
  {
    id: "general",
    name: "General",
    description: "A balanced screen for most sessions.",
    tools: ["Quick Capture", "Quick Reference", "Dice", "Timer"],
    icon: CompassRose,
  },
  {
    id: "combat",
    name: "Combat",
    description: "Initiative and live utilities ready to run.",
    tools: ["Initiative", "Quick Reference", "Dice", "Timer"],
    icon: Sword,
  },
  {
    id: "blank",
    name: "Blank",
    description: "Start with an empty structured grid.",
    tools: ["No tools added"],
    icon: Plus,
  },
  {
    id: "exploration",
    name: "Exploration",
    description: "A candidate preset for travel and discovery.",
    tools: ["Quick Capture", "References", "Timer", "Table"],
    icon: TreeEvergreen,
    candidate: true,
  },
];

const initialCombatants = [
  { id: 1, init: 18, name: "Ser Kael", detail: "Human · Paladin", hp: 24, maxHp: 24, icon: ShieldChevron, conditions: ["Blessed", "Shielded"] },
  { id: 2, init: 15, name: "Goblin Scout", detail: "Stealthy · Nimble", hp: 7, maxHp: 7, icon: PawPrint, conditions: [] },
  { id: 3, init: 12, name: "Worg", detail: "Ferocious", hp: 26, maxHp: 26, icon: Dog, conditions: [] },
  { id: 4, init: 10, name: "Skeleton Archer", detail: "Undead · Ranged", hp: 13, maxHp: 13, icon: Crosshair, conditions: [] },
  { id: 5, init: 7, name: "Goblin Shaman", detail: "Spellcaster", hp: 11, maxHp: 11, icon: MagicWand, conditions: ["Prone"] },
  { id: 6, init: 4, name: "Goblin Grunt", detail: "Minion · Melee", hp: 9, maxHp: 9, icon: Sword, conditions: [] },
  { id: 7, init: -2, name: "Phase Spider", detail: "Huge · Stealthy", hp: 22, maxHp: 22, icon: Bug, conditions: [] },
];

const referenceConditions = [
  [EyeSlash, "Blinded", "A creature can’t see."],
  [ShieldCheck, "Charmed", "A creature can’t attack you."],
  [Fire, "Frightened", "Disadvantage while source is in sight."],
  [LockKey, "Grappled", "Speed becomes 0."],
  [Skull, "Incapacitated", "Can’t take actions."],
];

const libraryTools = [
  { id: "initiative", name: "Initiative Tracker", status: "Core", description: "Turn order, rounds, HP and conditions." },
  { id: "capture", name: "Quick Capture", status: "Core", description: "Raw notes in a single gesture." },
  { id: "reference", name: "Quick Reference", status: "Core", description: "Prepared information at a glance." },
  { id: "dice", name: "Dice Roller", status: "Core", description: "Fast system-neutral rolls." },
  { id: "timer", name: "Timer", status: "Core", description: "Reliable live countdowns." },
  { id: "table", name: "Simple Table", status: "Candidate", description: "Editable rows and columns." },
  { id: "counter", name: "Counter", status: "Candidate", description: "Named increment and decrement." },
];

function AppLogo({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <CompassRose size={compact ? 26 : 34} weight="light" aria-hidden="true" />
      <span>ArcanaScreen</span>
    </div>
  );
}

function EntryView({ screens, onResume, onCreate }) {
  const last = screens[0];
  return (
    <main className="entry-shell">
      <header className="entry-header">
        <AppLogo />
        <span className="entry-kicker">Your personal DM screen</span>
      </header>
      <section className="entry-content" aria-labelledby="entry-title">
        <div className="entry-copy">
          <p className="eyebrow">Ready when the table is</p>
          <h1 id="entry-title">Pick up where your last session left off.</h1>
          <p>Resume a familiar screen in seconds, or start with a focused setup for tonight’s game.</p>
        </div>

        {last && (
          <article className="resume-card">
            <div className="resume-card__top">
              <div>
                <span className="overline">Last used · {last.updated}</span>
                <h2>{last.name}</h2>
                <p>{last.template} screen · 5 live tools</p>
              </div>
              <ShieldCheck size={30} weight="light" aria-hidden="true" />
            </div>
            <div className="resume-summary" aria-label="Screen contents">
              <span><ListBullets size={18} /> Initiative · Round 3</span>
              <span><Books size={18} /> 3 quick references</span>
              <span><NotePencil size={18} /> 2 encounter notes</span>
            </div>
            <button className="primary-action resume-action" onClick={() => onResume(last.id)}>
              Resume screen <ArrowRight size={20} weight="bold" />
            </button>
          </article>
        )}

        <div className="entry-divider"><span>or</span></div>
        <button className="secondary-action create-action" onClick={onCreate}>
          <Plus size={20} weight="bold" /> Create a new screen
        </button>
        <p className="local-note"><ShieldCheck size={17} /> Saved locally. No account required.</p>
      </section>
    </main>
  );
}

function CreateScreenDialog({ onClose, onCreate }) {
  const [selected, setSelected] = useState("combat");
  const [name, setName] = useState("");
  const selection = templates.find((item) => item.id === selected);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="dialog create-dialog" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div>
            <span className="overline">New screen</span>
            <h2 id="create-title">Choose a starting point</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        <div className="template-grid">
          {templates.map((template) => {
            const Icon = template.icon;
            const active = selected === template.id;
            return (
              <button key={template.id} className={`template-option ${active ? "is-selected" : ""}`} onClick={() => setSelected(template.id)} aria-pressed={active}>
                <span className="template-icon"><Icon size={24} weight="light" /></span>
                <span className="template-name">{template.name}{template.candidate && <small>Candidate</small>}</span>
                <span className="template-description">{template.description}</span>
                <span className="template-tools">{template.tools.join(" · ")}</span>
                {active && <CheckCircle className="selection-check" size={22} weight="fill" />}
              </button>
            );
          })}
        </div>
        <label className="field-label" htmlFor="screen-name">Screen name</label>
        <input id="screen-name" className="text-input" value={name} onChange={(event) => setName(event.target.value)} placeholder={selection?.id === "combat" ? "e.g. Battle at Blackwater Bridge" : "e.g. Tonight’s session"} />
        <footer className="dialog-footer">
          <button className="ghost-action" onClick={onClose}>Cancel</button>
          <button className="primary-action" onClick={() => onCreate(name.trim() || `Untitled ${selection.name}`, selection.name)}>
            Create in Prepare <ArrowRight size={18} weight="bold" />
          </button>
        </footer>
      </section>
    </div>
  );
}

function Header({ screen, screens, mode, setMode, menuOpen, setMenuOpen, onSwitch, onRename, onDuplicate, onDelete }) {
  return (
    <header className="app-header">
      <AppLogo compact />
      <div className="switcher-wrap">
        <button className="screen-switcher" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
          <span>{screen.name}</span><CaretDown size={16} weight="bold" />
        </button>
        {menuOpen && (
          <div className="screen-menu">
            <span className="menu-label">Screens</span>
            {screens.map((item) => (
              <button key={item.id} className={item.id === screen.id ? "is-active" : ""} onClick={() => { onSwitch(item.id); setMenuOpen(false); }}>
                <span><strong>{item.name}</strong><small>{item.template} · {item.updated}</small></span>
                {item.id === screen.id && <Check size={17} weight="bold" />}
              </button>
            ))}
            <div className="menu-separator" />
            <button onClick={onRename}><PencilSimple size={17} /> Rename screen</button>
            <button onClick={onDuplicate}><Copy size={17} /> Duplicate screen</button>
            <button className="danger-item" onClick={onDelete}><Trash size={17} /> Delete screen</button>
          </div>
        )}
      </div>

      <div className="mode-switch" aria-label="Workspace mode">
        <button className={mode === "prepare" ? "is-active" : ""} onClick={() => setMode("prepare")}>Prepare</button>
        <button className={mode === "run" ? "is-active" : ""} onClick={() => setMode("run")}>Run</button>
      </div>

      <div className="header-state">
        <span className="save-state"><CheckCircle size={20} weight="fill" /> Saved</span>
        <span className="layout-state"><LockKey size={20} /> {mode === "run" ? "Layout protected" : "Editing layout"}</span>
        <button className="icon-button icon-button--dark" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open screen actions"><DotsThreeVertical size={22} weight="bold" /></button>
      </div>
    </header>
  );
}

function InitiativeTracker({ combatants, activeIndex, onNext }) {
  const next = combatants[(activeIndex + 1) % combatants.length];
  return (
    <section className="initiative-panel" aria-labelledby="initiative-title">
      <header className="section-heading">
        <h2 id="initiative-title">Initiative Tracker</h2>
        <span>Round 3</span>
      </header>
      <div className="initiative-labels" aria-hidden="true"><span>Init</span><span>Combatant</span><span>HP</span><span>Status</span></div>
      <div className="combatants">
        {combatants.map((combatant, index) => {
          const Icon = combatant.icon;
          const active = index === activeIndex;
          return (
            <div key={combatant.id} className={`combatant-row ${active ? "is-active" : ""}`}>
              <div className="initiative-number">{active && <span className="active-arrow" aria-hidden="true" />} {combatant.init}</div>
              <div className="combatant-main">
                <span className="combatant-icon"><Icon size={25} weight="light" /></span>
                <div><strong>{combatant.name}</strong><small>{combatant.detail}</small></div>
                {active && <span className="active-pill">Active</span>}
              </div>
              <div className="hp-cell"><span>{combatant.hp} / {combatant.maxHp}</span><div className="hp-track"><i style={{ width: `${Math.round((combatant.hp / combatant.maxHp) * 100)}%` }} /></div></div>
              <div className="condition-cell">
                {combatant.conditions.map((condition) => <span key={condition} className="condition-chip">{condition}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      <footer className="initiative-footer">
        <p>Up next: <strong>{next.name}</strong> ({next.init})</p>
        <button className="next-turn" onClick={onNext}>Next Turn <ArrowRight size={24} weight="bold" /></button>
      </footer>
    </section>
  );
}

function ContextPanel({ notes, captureText, setCaptureText, onCapture }) {
  const captureRef = useRef(null);
  useEffect(() => {
    const handler = (event) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        captureRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <aside className="context-panel" aria-label="Session context">
      <form className="capture-box" onSubmit={(event) => { event.preventDefault(); onCapture(); }}>
        <NotePencil size={28} weight="light" aria-hidden="true" />
        <input ref={captureRef} value={captureText} onChange={(event) => setCaptureText(event.target.value)} placeholder="Capture a name, decision, or consequence…" aria-label="Quick capture" />
        <span className="shortcut-hint">Press <kbd>/</kbd> to focus</span>
        <button type="submit" aria-label="Save capture"><ArrowElbowDownLeft size={20} /></button>
      </form>
      <div className="reference-content">
        <div className="reference-title"><h2>Quick Reference</h2><button className="text-button">Show all</button></div>
        <section className="reference-section">
          <h3>Conditions</h3>
          <div className="condition-reference-list">
            {referenceConditions.map(([Icon, name, detail]) => (
              <div key={name}><span className="reference-icon"><Icon size={17} /></span><p><strong>{name}</strong><small>{detail}</small></p></div>
            ))}
          </div>
        </section>
        <section className="reference-section cover-reference">
          <h3>Cover</h3>
          <dl><div><dt>Half Cover</dt><dd>+2 AC and Dex saves</dd></div><div><dt>Three-Quarters Cover</dt><dd>+5 AC and Dex saves</dd></div><div><dt>Total Cover</dt><dd>Can’t be targeted directly</dd></div></dl>
        </section>
        <section className="reference-section encounter-notes">
          <div className="subheading-row"><h3>Encounter Notes</h3><button className="text-button"><PencilSimple size={15} /> Edit</button></div>
          <ul>{notes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}</ul>
          <a href="https://www.dndbeyond.com/sources/dnd/free-rules" target="_blank" rel="noreferrer"><Books size={17} /> Monster Manual (Basic Rules 2024) <ArrowSquareOut size={15} /></a>
        </section>
      </div>
    </aside>
  );
}

function UtilityDock({ modifier, setModifier, die, setDie, rollResult, onRoll, seconds, running, onToggleTimer, onResetTimer }) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return (
    <footer className="utility-dock">
      <section className="dice-utility" aria-label="Dice roller">
        <span className="utility-label"><DiceFive size={25} weight="light" /> Dice</span>
        <select value={die} onChange={(event) => setDie(Number(event.target.value))} aria-label="Die type"><option value={20}>d20</option><option value={12}>d12</option><option value={10}>d10</option><option value={8}>d8</option><option value={6}>d6</option><option value={4}>d4</option></select>
        <div className="stepper"><button onClick={() => setModifier(modifier - 1)} aria-label="Decrease modifier">−</button><span>{modifier > 0 ? `+${modifier}` : modifier}</span><button onClick={() => setModifier(modifier + 1)} aria-label="Increase modifier">+</button></div>
        <output className="roll-result" aria-label="Roll result">{rollResult}</output>
        <button className="dock-button" onClick={onRoll}>Roll</button>
      </section>
      <div className="dock-divider" />
      <section className="timer-utility" aria-label="Session timer">
        <span className="utility-label"><Timer size={25} weight="light" /> Timer</span>
        <time>{minutes}:{secs}</time>
        <button className="dock-button dock-button--gold" onClick={onToggleTimer}>{running ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />} {running ? "Pause" : "Start"}</button>
        <button className="dock-button dock-button--quiet" onClick={onResetTimer}><ArrowCounterClockwise size={18} /> Reset</button>
      </section>
    </footer>
  );
}

function PrepareView({ enabledTools, setEnabledTools, onRun }) {
  const preparedTools = libraryTools.filter((tool) => enabledTools.includes(tool.id));
  return (
    <main className="prepare-view">
      <section className="prepare-main">
        <header className="prepare-intro">
          <div><span className="eyebrow">Prepare mode</span><h1>Shape the screen before the session.</h1><p>Arrange tools and configure their content. Live state remains intact when you switch modes.</p></div>
          <button className="primary-action" onClick={onRun}><Play size={18} weight="fill" /> Enter Run</button>
        </header>
        <div className="prepare-canvas">
          {preparedTools.map((tool, index) => (
            <article className={`prepare-tool ${index === 0 ? "prepare-tool--wide" : ""}`} key={tool.id}>
              <header><span><ArrowsOutCardinal size={18} /> {tool.name}</span><div><button aria-label={`Configure ${tool.name}`}><GearSix size={17} /></button><button aria-label={`Remove ${tool.name}`} onClick={() => setEnabledTools(enabledTools.filter((id) => id !== tool.id))}><X size={17} /></button></div></header>
              <div className="prepare-tool__preview">
                {tool.id === "initiative" && <><ListBullets size={30} /><p>7 combatants · Round 3<br/><small>Wide · Live state preserved</small></p></>}
                {tool.id === "capture" && <><NotePencil size={30} /><p>Quick Capture<br/><small>App shortcut: /</small></p></>}
                {tool.id === "reference" && <><Books size={30} /><p>3 reference sections<br/><small>Conditions, cover, notes</small></p></>}
                {tool.id === "dice" && <><DiceFive size={30} /><p>Dice Roller<br/><small>Compact utility dock</small></p></>}
                {tool.id === "timer" && <><Timer size={30} /><p>Timer<br/><small>Compact utility dock</small></p></>}
                {tool.id === "table" && <><ListBullets size={30} /><p>Simple Table<br/><small>MVP candidate</small></p></>}
                {tool.id === "counter" && <><Plus size={30} /><p>Counter<br/><small>MVP candidate</small></p></>}
              </div>
              <footer><span>Size</span><div className="size-control"><button>Compact</button><button className="is-selected">Standard</button><button>Wide</button></div></footer>
            </article>
          ))}
        </div>
      </section>
      <aside className="tool-library">
        <header><div><span className="overline">Screen tools</span><h2>Tool library</h2></div><button className="icon-button"><X size={19} /></button></header>
        <input className="library-search" placeholder="Search tools…" aria-label="Search tools" />
        <div className="library-list">
          {libraryTools.map((tool) => {
            const enabled = enabledTools.includes(tool.id);
            return <article key={tool.id}><div><span className={`tool-status ${tool.status === "Candidate" ? "is-candidate" : ""}`}>{tool.status}</span><h3>{tool.name}</h3><p>{tool.description}</p></div><button className={enabled ? "tool-added" : "tool-add"} onClick={() => setEnabledTools(enabled ? enabledTools.filter((id) => id !== tool.id) : [...enabledTools, tool.id])}>{enabled ? <><Check size={16} /> Added</> : <><Plus size={16} /> Add</>}</button></article>;
          })}
        </div>
        <p className="candidate-note"><ShieldCheck size={17} /> Candidate tools should earn a distinct job before MVP.</p>
      </aside>
    </main>
  );
}

function RenameDialog({ initialName, onClose, onSave }) {
  const [value, setValue] = useState(initialName);
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="dialog compact-dialog" role="dialog" aria-modal="true" aria-labelledby="rename-title" onMouseDown={(event) => event.stopPropagation()}><header className="dialog-header"><div><span className="overline">Screen lifecycle</span><h2 id="rename-title">Rename screen</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></header><label className="field-label" htmlFor="rename-screen">Screen name</label><input id="rename-screen" className="text-input" autoFocus value={value} onChange={(event) => setValue(event.target.value)} /><footer className="dialog-footer"><button className="ghost-action" onClick={onClose}>Cancel</button><button className="primary-action" onClick={() => onSave(value.trim())}>Save name</button></footer></section></div>;
}

export function App() {
  const [stage, setStage] = useState("entry");
  const [screens, setScreens] = useState(initialScreens);
  const [activeScreenId, setActiveScreenId] = useState("vhal");
  const [mode, setMode] = useState("run");
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [undoScreen, setUndoScreen] = useState(null);
  const [toast, setToast] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [captureText, setCaptureText] = useState("");
  const [notes, setNotes] = useState(["The worg is protecting the goblin shaman.", "Webbing on the north wall can be burned away.", "Cracked pillar (AC 15, 30 HP) can provide cover."]);
  const [modifier, setModifier] = useState(1);
  const [die, setDie] = useState(20);
  const [rollResult, setRollResult] = useState(19);
  const [seconds, setSeconds] = useState(3600);
  const [running, setRunning] = useState(false);
  const [enabledTools, setEnabledTools] = useState(["initiative", "capture", "reference", "dice", "timer"]);

  const activeScreen = useMemo(() => screens.find((screen) => screen.id === activeScreenId) || screens[0], [screens, activeScreenId]);

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 0), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 8000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const createScreen = (name, template) => {
    const id = `${Date.now()}`;
    setScreens((items) => [{ id, name, template, updated: "Just now" }, ...items]);
    setActiveScreenId(id);
    setCreateOpen(false);
    setStage("workspace");
    setMode("prepare");
    setToast(`${name} created in Prepare`);
  };

  const deleteScreen = () => {
    const removed = activeScreen;
    const remaining = screens.filter((screen) => screen.id !== removed.id);
    if (!remaining.length) return;
    setUndoScreen(removed);
    setScreens(remaining);
    setActiveScreenId(remaining[0].id);
    setMenuOpen(false);
    setToast(`${removed.name} deleted`);
  };

  const undoDelete = () => {
    if (!undoScreen) return;
    setScreens((items) => [undoScreen, ...items]);
    setActiveScreenId(undoScreen.id);
    setUndoScreen(null);
    setToast(`${undoScreen.name} restored`);
  };

  if (stage === "entry") {
    return <><EntryView screens={screens} onResume={(id) => { setActiveScreenId(id); setStage("workspace"); setMode("run"); }} onCreate={() => setCreateOpen(true)} />{createOpen && <CreateScreenDialog onClose={() => setCreateOpen(false)} onCreate={createScreen} />}</>;
  }

  return (
    <div className="app-shell">
      <Header
        screen={activeScreen}
        screens={screens}
        mode={mode}
        setMode={setMode}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSwitch={setActiveScreenId}
        onRename={() => { setMenuOpen(false); setRenameOpen(true); }}
        onDuplicate={() => {
          const copy = { ...activeScreen, id: `${Date.now()}`, name: `${activeScreen.name} copy`, updated: "Just now" };
          setScreens((items) => [copy, ...items]);
          setActiveScreenId(copy.id);
          setMode("prepare");
          setMenuOpen(false);
          setToast("Screen duplicated in Prepare");
        }}
        onDelete={deleteScreen}
      />

      {mode === "run" ? (
        <>
          <main className="run-view">
            <InitiativeTracker combatants={initialCombatants} activeIndex={activeIndex} onNext={() => setActiveIndex((activeIndex + 1) % initialCombatants.length)} />
            <ContextPanel notes={notes} captureText={captureText} setCaptureText={setCaptureText} onCapture={() => { if (!captureText.trim()) return; setNotes((items) => [...items, captureText.trim()]); setCaptureText(""); setToast("Capture saved to encounter notes"); }} />
          </main>
          <UtilityDock modifier={modifier} setModifier={setModifier} die={die} setDie={setDie} rollResult={rollResult} onRoll={() => setRollResult(Math.floor(Math.random() * die) + 1 + modifier)} seconds={seconds} running={running} onToggleTimer={() => setRunning(!running)} onResetTimer={() => { setRunning(false); setSeconds(3600); }} />
        </>
      ) : <PrepareView enabledTools={enabledTools} setEnabledTools={setEnabledTools} onRun={() => setMode("run")} />}

      {renameOpen && <RenameDialog initialName={activeScreen.name} onClose={() => setRenameOpen(false)} onSave={(name) => { if (name) setScreens((items) => items.map((screen) => screen.id === activeScreen.id ? { ...screen, name } : screen)); setRenameOpen(false); setToast("Screen renamed"); }} />}
      {toast && <div className="toast" role="status"><CheckCircle size={19} weight="fill" /><span>{toast}</span>{undoScreen && toast.includes("deleted") && <button onClick={undoDelete}>Undo</button>}</div>}
    </div>
  );
}
