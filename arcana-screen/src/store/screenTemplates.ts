import { createToolInstance } from '../components/widgets/toolRegistry';
import type { Widget } from './useWidgetStore';

export type ScreenTemplate = 'general' | 'combat' | 'blank';

export interface ScreenTemplateDefinition {
  id: ScreenTemplate;
  label: string;
  description: string;
  outcome: string;
  tools: string[];
}

export const screenTemplateCatalog: ScreenTemplateDefinition[] = [
  {
    id: 'general',
    label: 'General',
    description: 'A note-first screen for any kind of session.',
    outcome: 'Prepare context, capture live changes and keep essential references visible.',
    tools: ['Session Notebook', 'Quick Capture', 'Quick Reference', 'Dice Roller', 'Countdown Timer'],
  },
  {
    id: 'combat',
    label: 'Combat',
    description: 'A session core with encounter tracking ready to run.',
    outcome: 'Run initiative alongside the same notes, captures, references and universal utilities.',
    tools: ['Initiative Tracker', 'Session Notebook', 'Quick Capture', 'Quick Reference', 'Dice Roller', 'Countdown Timer'],
  },
  {
    id: 'blank',
    label: 'Blank',
    description: 'An empty screen for experienced users.',
    outcome: 'Build a custom setup from the tool library without starter content.',
    tools: [],
  },
];

export const createTemplateWidgets = (template: ScreenTemplate): Widget[] => {
  if (template === 'blank') return [];

  if (template === 'combat') {
    return [
      createToolInstance('initiative-tracker', 'wide'),
      createToolInstance('quick-notes', 'wide'),
      createToolInstance('quick-capture', 'standard'),
      createToolInstance('quick-reference', 'standard'),
      createToolInstance('dice-roller', 'standard'),
      createToolInstance('countdown-timer', 'compact'),
    ];
  }

  return [
    createToolInstance('quick-notes', 'wide'),
    createToolInstance('quick-capture', 'standard'),
    createToolInstance('quick-reference', 'standard'),
    createToolInstance('dice-roller', 'standard'),
    createToolInstance('countdown-timer', 'compact'),
  ];
};

export const templateLabel = Object.fromEntries(
  screenTemplateCatalog.map((template) => [template.id, template.label]),
) as Record<ScreenTemplate, string>;
