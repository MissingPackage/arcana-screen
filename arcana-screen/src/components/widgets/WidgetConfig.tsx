// src/components/widgets/widgetConfig.ts
import { WidgetMeta } from '../WidgetSidebar/types';

export const widgetMeta: WidgetMeta[] = [
  {
    id: 'countdown-timer',
    name: 'Countdown Timer',
    tags: ['timer', 'time'],
    isFavorite: true
  },
  {
    id: 'dice-roller',
    name: 'Dice Roller',
    tags: ['dice', 'roll'],
    isFavorite: false
  },
  {
    id: 'initiative-tracker',
    name: 'Initiative Tracker',
    tags: ['initiative', 'combat'],
    isFavorite: false
  },
  {
    id: 'quick-notes',
    name: 'Quick Notes',
    tags: ['notes', 'writing'],
    isFavorite: true
  },
  {
    id: 'simple-table',
    name: 'Simple Table',
    tags: ['table', 'data'],
    isFavorite: false
  },
];