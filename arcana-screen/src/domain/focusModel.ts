import type { EncounterState } from './encounterModel';
import type { TimerState } from './timerModel';

export type FocusId = 'narrative' | 'social' | 'exploration' | 'combat';

export interface UniversalCapture {
  id: string;
  text: string;
  createdAt: string;
  status?: 'inbox' | 'kept' | 'promoted';
  starred?: boolean; // marked for the start-of-session "Previously on…" recap
}

export interface NotebookSection {
  id: string;
  title: string;
  body: string;
  items: string[];
}

export interface NarrativeBeat {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
}

export interface NarrativeFocusState {
  sceneTitle: string;
  currentSection: string;
  currentBeat: number;
  pacing: number;
  beats: NarrativeBeat[];
  openThreads: Array<{ title: string; detail: string }>;
  drawerOpen: boolean;
}

export interface SocialNpc {
  id: string;
  name: string;
  role: string;
  attitude: 'Guarded' | 'Friendly' | 'Neutral';
  motive: string;
  secret: string;
}

export interface SocialFocusState {
  sceneTitle: string;
  sceneClock: number;
  npcs: SocialNpc[];
  pinnedReference: { title: string; detail: string; source: string };
}

export interface ExplorationMoment {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'prepared';
}

export interface ExplorationFocusState {
  currentMomentId: string;
  moments: ExplorationMoment[];
  discoveryClock: number;
  counter: number;
  clues: string[];
  changes: string[];
  liveLog: Array<{ time: string; text: string }>;
}

export interface UniversalState {
  notebook: {
    title: string;
    sceneTitle: string;
    sections: NotebookSection[];
  };
  captures: UniversalCapture[];
  references: Array<{ id: string; title: string; detail: string; source: string }>;
  dice: {
    die: number;
    modifier: number;
    result: number | null;
    formula: string;
    mode: 'normal' | 'advantage' | 'disadvantage';
    results: number[];
    breakdown: string[];
    error: string;
  };
  timer: TimerState;
}

export interface FocusWorkspace {
  currentFocus: FocusId | null;
  universal: UniversalState;
  contexts: {
    narrative: NarrativeFocusState;
    social: SocialFocusState;
    exploration: ExplorationFocusState;
    combat: EncounterState;
  };
}

const combatants: EncounterState['combatants'] = [
  { id: 'kael', name: 'Ser Kael', detail: 'Human · Paladin', initiative: 18, tieBreaker: 3, hp: 24, maxHp: 24, tempHp: 0, conditions: ['Blessed', 'Shielded'], ac: 18 },
  { id: 'scout', name: 'Goblin Scout', detail: 'Stealthy · Nimble', initiative: 15, tieBreaker: 2, hp: 7, maxHp: 7, tempHp: 0, conditions: [], ac: 15 },
  { id: 'worg', name: 'Worg', detail: 'Ferocious', initiative: 12, tieBreaker: 1, hp: 26, maxHp: 26, tempHp: 0, conditions: [], ac: 13 },
  { id: 'archer', name: 'Skeletal Archer', detail: 'Undead · Ranged', initiative: 10, tieBreaker: 0, hp: 13, maxHp: 13, tempHp: 0, conditions: [], ac: 13 },
  { id: 'shaman', name: 'Goblin Shaman', detail: 'Spellcaster', initiative: 7, tieBreaker: 2, hp: 11, maxHp: 11, tempHp: 0, conditions: ['Prone'], ac: 11 },
  { id: 'grunt', name: 'Goblin Grunt', detail: 'Minion · Melee', initiative: 4, tieBreaker: 1, hp: 9, maxHp: 9, tempHp: 0, conditions: [], ac: 12 },
  { id: 'spider', name: 'Phase Spider', detail: 'Huge · Stealthy', initiative: -2, tieBreaker: 0, hp: 22, maxHp: 22, tempHp: 0, conditions: [], ac: 14 },
];

export const createDefaultFocusWorkspace = (): FocusWorkspace => ({
  currentFocus: 'narrative',
  universal: {
    notebook: {
      title: 'Session Notebook',
      sceneTitle: 'The Festival of Ash',
      sections: [
        { id: 'setup', title: 'Scene setup', body: 'The streets of Vhal are choked with incense and color. Tonight the Emberwrights honor the Flamebound.', items: [] },
        { id: 'characters', title: 'Characters present', body: '', items: ['Ser Kael — Paladin of the Dawnfather', 'Lira Voss — Streetwise Scout', 'Brother Halric — Novice of the Emberwrights', 'Unknown Observer — Cloaked, watching'] },
        { id: 'reveals', title: 'Reveals & callbacks', body: '', items: ['The stolen ember is not what it seems.', 'The Observer has ties to one of the PCs.'] },
      ],
    },
    captures: [],
    references: [
      { id: 'wards', title: 'Vhalic Wards', detail: 'On the nature of vhalic wards, voice bindings and the costs of unsealing.', source: 'Lore · Cripta di Vhal' },
      { id: 'paths', title: 'Echoing Paths', detail: 'Whispers are echoes of bound memories embedded in the stone.', source: "Explorer's Journal, p. 42" },
    ],
    dice: { die: 20, modifier: 1, result: 19, formula: '', mode: 'normal', results: [18], breakdown: ['1d20[18]', '+1'], error: '' },
    timer: { durationSeconds: 3600, remainingSeconds: 3600, endAt: null, running: false },
  },
  contexts: {
    narrative: {
      sceneTitle: 'The Festival of Ash',
      currentSection: 'setup',
      currentBeat: 2,
      pacing: 2,
      drawerOpen: true,
      beats: [
        { id: 'set-scene', title: 'Set the scene', detail: 'Firelight, music and the crowd.', completed: true },
        { id: 'spark', title: 'Introduce the spark', detail: 'A small incident draws the party in.', completed: false },
        { id: 'thread', title: 'Reveal the hidden thread', detail: 'A clue points toward a deeper conspiracy.', completed: false },
        { id: 'choice', title: 'Present a choice', detail: 'Do they investigate, confront, or walk away?', completed: false },
      ],
      openThreads: [
        { title: 'Stolen ember', detail: 'Who took it and why?' },
        { title: 'Unknown Observer', detail: 'Motives and identity.' },
        { title: "Emberwrights' tension", detail: 'Something is fractured.' },
      ],
    },
    social: {
      sceneTitle: 'The Sealed Gate',
      sceneClock: 3,
      npcs: [
        { id: 'vaelin', name: 'Sister Vaelin', role: 'Gate Warden', attitude: 'Guarded', motive: 'Protect the seal', secret: 'Doubts the ritual' },
        { id: 'tovir', name: 'Tovir', role: 'Messenger', attitude: 'Friendly', motive: 'Gain favor with you', secret: 'Works for someone else' },
        { id: 'erava', name: 'Erava', role: 'Chronicler', attitude: 'Neutral', motive: 'Record the truth', secret: 'Hiding a forbidden text' },
      ],
      pinnedReference: { title: 'Vhalic Wards', detail: 'Voice bindings and the costs of unsealing.', source: 'Lore · Cripta di Vhal' },
    },
    exploration: {
      currentMomentId: 'galleries',
      moments: [
        { id: 'galleries', title: 'Echoing Galleries', status: 'active' },
        { id: 'gate', title: 'The Sealed Gate', status: 'completed' },
        { id: 'archive', title: 'The Sunken Archive', status: 'prepared' },
      ],
      discoveryClock: 3,
      counter: 3,
      clues: ['Whispered names etched into the arch stones.', 'A cracked mosaic shows three diverging paths.', 'Damp airflow suggests water nearby.'],
      changes: ['The party chose the eastern passage.', 'The whispers intensified after touching the mosaic.', 'Noted a faint current of air toward the east.'],
      liveLog: [
        { time: '7:12 PM', text: 'Party entered the Echoing Galleries.' },
        { time: '7:14 PM', text: 'Elia heard distant water at the northern arch.' },
        { time: '7:18 PM', text: 'Discovered carved name: Vhalen.' },
      ],
    },
    combat: { round: 3, currentIndex: 0, combatants },
  },
});

export const migrateFocusWorkspace = (workspace?: Partial<FocusWorkspace>): FocusWorkspace => {
  const defaults = createDefaultFocusWorkspace();
  if (!workspace) return defaults;
  const universal = workspace.universal;
  const contexts = workspace.contexts;
  return {
    currentFocus: workspace.currentFocus === null || workspace.currentFocus ? workspace.currentFocus : defaults.currentFocus,
    universal: {
      ...defaults.universal,
      ...universal,
      notebook: { ...defaults.universal.notebook, ...universal?.notebook },
      captures: universal?.captures ?? defaults.universal.captures,
      references: universal?.references ?? defaults.universal.references,
      dice: { ...defaults.universal.dice, ...universal?.dice },
      timer: { ...defaults.universal.timer, ...universal?.timer },
    },
    contexts: {
      narrative: { ...defaults.contexts.narrative, ...contexts?.narrative },
      social: { ...defaults.contexts.social, ...contexts?.social },
      exploration: { ...defaults.contexts.exploration, ...contexts?.exploration },
      combat: {
        ...defaults.contexts.combat,
        ...contexts?.combat,
        combatants: contexts?.combat?.combatants ?? defaults.contexts.combat.combatants,
      },
    },
  };
};

export const switchFocus = (workspace: FocusWorkspace, focus: FocusId): FocusWorkspace => ({
  ...workspace,
  currentFocus: focus,
});

export const advanceNarrativeBeat = (workspace: FocusWorkspace): FocusWorkspace => {
  const currentIndex = Math.min(
    workspace.contexts.narrative.currentBeat - 1,
    workspace.contexts.narrative.beats.length - 1,
  );
  const nextBeat = Math.min(currentIndex + 2, workspace.contexts.narrative.beats.length);
  return {
    ...workspace,
    contexts: {
      ...workspace.contexts,
      narrative: {
        ...workspace.contexts.narrative,
        currentBeat: nextBeat,
        beats: workspace.contexts.narrative.beats.map((beat, index) =>
          index === currentIndex ? { ...beat, completed: true } : beat,
        ),
      },
    },
  };
};

export const advanceSocialClock = (workspace: FocusWorkspace): FocusWorkspace => ({
  ...workspace,
  contexts: {
    ...workspace.contexts,
    social: {
      ...workspace.contexts.social,
      sceneClock: Math.min(8, workspace.contexts.social.sceneClock + 1),
    },
  },
});

export const selectExplorationMoment = (workspace: FocusWorkspace, momentId: string): FocusWorkspace => {
  const exploration = workspace.contexts.exploration;
  if (!exploration.moments.some((moment) => moment.id === momentId)) return workspace;
  return {
    ...workspace,
    contexts: {
      ...workspace.contexts,
      exploration: {
        ...exploration,
        currentMomentId: momentId,
        moments: exploration.moments.map((moment) => {
          if (moment.id === momentId) return { ...moment, status: 'active' };
          if (moment.status === 'active') return { ...moment, status: 'prepared' };
          return moment;
        }),
      },
    },
  };
};

export const completeExplorationMoment = (workspace: FocusWorkspace): FocusWorkspace => {
  const exploration = workspace.contexts.exploration;
  const currentIndex = exploration.moments.findIndex((moment) => moment.id === exploration.currentMomentId);
  const orderedCandidates = [
    ...exploration.moments.slice(currentIndex + 1),
    ...exploration.moments.slice(0, Math.max(0, currentIndex)),
  ];
  const prepared = orderedCandidates.find((moment) => moment.status === 'prepared');
  if (!prepared) return workspace;
  return {
    ...workspace,
    contexts: {
      ...workspace.contexts,
      exploration: {
        ...exploration,
        currentMomentId: prepared.id,
        moments: exploration.moments.map((moment) => {
          if (moment.id === exploration.currentMomentId) return { ...moment, status: 'completed' };
          if (moment.id === prepared.id) return { ...moment, status: 'active' };
          return moment;
        }),
      },
    },
  };
};
