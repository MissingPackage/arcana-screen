import type { ReactNode } from 'react';
import CountdownTimer from './CountdownTimer';
import DiceRoller from './DiceRoller';
import InitiativeTracker from './InitiativeTracker';
import QuickNotes from './QuickNotes';
import QuickCapture from './QuickCapture';
import QuickReference from './QuickReference';
import SimpleTable from './SimpleTable';
import Counter from './Counter';
import type { Widget, WidgetDisplaySize } from '../../store/useWidgetStore';

export type ToolLibraryId =
  | 'quick-notes'
  | 'quick-capture'
  | 'quick-reference'
  | 'dice-roller'
  | 'countdown-timer'
  | 'initiative-tracker'
  | 'simple-table'
  | 'counter';

export type ToolCategory = 'Notes' | 'Utilities' | 'Tracking' | 'Data';

interface ToolRenderActions {
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
}

export interface ToolDefinition {
  id: ToolLibraryId;
  type: Widget['type'];
  name: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  stateVersion: number;
  defaultDisplaySize: WidgetDisplaySize;
  createState: () => Partial<Widget>;
  render: (widget: Widget, actions: ToolRenderActions) => ReactNode;
}

const definitions = [
  {
    id: 'quick-notes',
    type: 'QuickNotes',
    name: 'Session Notebook',
    description: 'Keep titled session notes with lightweight bold, list and link formatting. Content autosaves locally.',
    category: 'Notes',
    tags: ['notes', 'writing', 'notebook'],
    stateVersion: 2,
    defaultDisplaySize: 'wide',
    createState: () => ({ title: 'Session notebook', text: '' }),
    render: (widget) => <QuickNotes id={widget.id} showHeader={false} />,
  },
  {
    id: 'quick-capture',
    type: 'QuickCapture',
    name: 'Quick Capture',
    description: 'Capture live facts in one step with automatic timestamps, then keep, edit, delete or promote them after the session.',
    category: 'Notes',
    tags: ['capture', 'inbox', 'live', 'review'],
    stateVersion: 2,
    defaultDisplaySize: 'standard',
    createState: () => ({ captures: [] }),
    render: (widget) => <QuickCapture id={widget.id} />,
  },
  {
    id: 'quick-reference',
    type: 'QuickReference',
    name: 'Quick Reference',
    description: 'Keep concise prepared information and labeled links visible at a glance.',
    category: 'Notes',
    tags: ['reference', 'links', 'rules', 'prepared'],
    stateVersion: 2,
    defaultDisplaySize: 'standard',
    createState: () => ({ referenceTitle: 'Quick reference', referenceBody: '', referenceLinks: [] }),
    render: (widget) => <QuickReference id={widget.id} />,
  },
  {
    id: 'dice-roller',
    type: 'DiceRoller',
    name: 'Dice Roller',
    description: 'Roll common dice, formulas, modifiers, advantage and disadvantage.',
    category: 'Utilities',
    tags: ['dice', 'roll', 'formula'],
    stateVersion: 3,
    defaultDisplaySize: 'standard',
    createState: () => ({
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
    }),
    render: (widget, actions) => (
      <DiceRoller id={widget.id} updateWidget={actions.updateWidget} showHeader={false} />
    ),
  },
  {
    id: 'countdown-timer',
    type: 'CountdownTimer',
    name: 'Countdown Timer',
    description: 'Run a persistent countdown that continues reliably during the session.',
    category: 'Utilities',
    tags: ['timer', 'time', 'countdown'],
    stateVersion: 3,
    defaultDisplaySize: 'compact',
    createState: () => ({
      seconds: 60,
      timerDurationSeconds: 60,
      timerEndAt: null,
      isRunning: false,
      timerPresets: [
        { id: 'one-minute', name: '1 min', seconds: 60 },
        { id: 'five-minutes', name: '5 min', seconds: 300 },
        { id: 'ten-minutes', name: '10 min', seconds: 600 },
      ],
      notifyOnComplete: false,
    }),
    render: (widget, actions) => (
      <CountdownTimer id={widget.id} updateWidget={actions.updateWidget} showHeader={false} />
    ),
  },
  {
    id: 'initiative-tracker',
    type: 'InitiativeTracker',
    name: 'Initiative Tracker',
    description: 'Track combatants, hit points and the current turn during an encounter.',
    category: 'Tracking',
    tags: ['initiative', 'combat', 'turns', 'hp'],
    stateVersion: 2,
    defaultDisplaySize: 'wide',
    createState: () => ({
      combatants: [],
      name: '',
      initiative: 0,
      currentIndex: null,
      round: 1,
      initiativeUndo: null,
      turnChangeAnimation: false,
    }),
    render: (widget, actions) => (
      <InitiativeTracker id={widget.id} updateWidget={actions.updateWidget} showHeader={false} />
    ),
  },
  {
    id: 'simple-table',
    type: 'SimpleTable',
    name: 'Simple Table',
    description: 'Keep lightweight structured rows and columns for session data.',
    category: 'Data',
    tags: ['table', 'data', 'rows', 'columns'],
    stateVersion: 2,
    defaultDisplaySize: 'standard',
    createState: () => ({
      columns: [
        { id: 1, key: 'name', label: 'Name', type: 'text' },
        { id: 2, key: 'value', label: 'Value', type: 'text' },
      ],
      rows: [
        { id: 1, name: '', value: '' },
        { id: 2, name: '', value: '' },
      ],
      tableTemplate: 'blank',
      sortColumnKey: '',
      sortDirection: 'asc',
      tableFilter: '',
    }),
    render: (widget, actions) => (
      <SimpleTable id={widget.id} updateWidget={actions.updateWidget} showHeader={false} />
    ),
  },
  {
    id: 'counter',
    type: 'Counter',
    name: 'Resource Counter',
    description: 'Track a bounded resource with fast adjustments and a configurable warning threshold.',
    category: 'Tracking',
    tags: ['counter', 'resource', 'threshold', 'tracking'],
    stateVersion: 1,
    defaultDisplaySize: 'compact',
    createState: () => ({
      counterName: 'Resource counter',
      counterValue: 0,
      counterMin: 0,
      counterMax: 20,
      counterThreshold: 5,
    }),
    render: (widget, actions) => (
      <Counter id={widget.id} updateWidget={actions.updateWidget} />
    ),
  },
] satisfies ToolDefinition[];

export const toolRegistry: readonly ToolDefinition[] = definitions;

export const toolCatalog = definitions.map((definition) => ({
  id: definition.id,
  name: definition.name,
  description: definition.description,
  category: definition.category,
  tags: definition.tags,
  isFavorite: false,
}));

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getToolDefinitionById = (id: string) =>
  definitions.find((definition) => definition.id === id);

export const getToolDefinitionByType = (type: string) =>
  definitions.find((definition) => definition.type === type);

export const createToolInstance = (
  id: string,
  displaySize?: WidgetDisplaySize,
): Widget => {
  const definition = getToolDefinitionById(id);
  if (!definition) {
    throw new Error(`Unknown tool definition: ${id}`);
  }

  return {
    id: createId(definition.id),
    type: definition.type,
    position: { x: 0, y: 0 },
    size: { w: 2, h: 2 },
    displaySize: displaySize ?? definition.defaultDisplaySize,
    schemaVersion: definition.stateVersion,
    ...definition.createState(),
  };
};

export const migrateToolInstance = (widget: Widget): Widget => {
  const definition = getToolDefinitionByType(widget.type);
  if (!definition) return widget;

  return {
    ...definition.createState(),
    ...widget,
    id: widget.id || createId(definition.id),
    type: definition.type,
    position: widget.position ?? { x: 0, y: 0 },
    size: widget.size ?? { w: 2, h: 2 },
    displaySize: widget.displaySize ?? definition.defaultDisplaySize,
    schemaVersion: definition.stateVersion,
  };
};
