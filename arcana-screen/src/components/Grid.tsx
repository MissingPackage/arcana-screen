import { useDrag, useDrop } from 'react-dnd';
import { useCallback, useEffect, useRef } from 'react';
import QuickNotes from './widgets/QuickNotes';
import DiceRoller from './widgets/DiceRoller';
import CountdownTimer from './widgets/CountdownTimer';
import SimpleTable from './widgets/SimpleTable';
import InitiativeTracker from './widgets/InitiativeTracker';
import { useWidgetStore, Widget } from '../store/useWidgetStore';
import ProfileManagerPanel from './ProfileManager/ProfileManagerPanel';

const ItemType = 'WIDGET';

interface WidgetComponentProps {
  id: string;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  [key: string]: unknown;
}

const components: { [key: string]: React.FC<WidgetComponentProps> } = {
  SimpleTable,
  CountdownTimer,
  DiceRoller,
  InitiativeTracker,
  QuickNotes,
};

interface DraggableBoxProps {
  id: string;
  index: number;
  moveItem: (from: number, to: number) => void;
  children: React.ReactNode;
}

function DraggableBox({ id, index, moveItem, children }: DraggableBoxProps) {
  const [, drag] = useDrag({
    type: ItemType,
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (dragged: { index: number }) => {
      if (dragged.index !== index) {
        moveItem(dragged.index, index);
        dragged.index = index;
      }
    },
  });

  return (
    <div
      ref={node => {
        drag(drop(node));
      }}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}

export default function Grid() {
  const widgets = useWidgetStore((state) => state.widgets);
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const removeWidget = useWidgetStore((state) => state.removeWidget);
  const addWidget = useWidgetStore((state) => state.addWidget);
  const clearWidgets = useWidgetStore((state) => state.clearWidgets);

  // Use a local flag to avoid duplicating default widgets
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && widgets.length === 0) {
      hasInitialized.current = true;
      addWidget({
        id: 'table-1',
        type: 'SimpleTable' as const,
        position: { x: 0, y: 0 },
        size: { w: 4, h: 4 },
        columns: [
          { id: 1, key: 'name', label: 'Nome' },
          { id: 2, key: 'value', label: 'Valore' }
        ],
        rows: [
          { id: 1, name: 'Esempio', value: '42' },
          { id: 2, name: 'Altro', value: '17' }
        ]
      });
      addWidget({
        id: 'timer-1',
        type: 'CountdownTimer' as const,
        position: { x: 4, y: 0 },
        size: { w: 2, h: 2 },
        seconds: 60,
        isRunning: false
      });
      addWidget({
        id: 'dice-1',
        type: 'DiceRoller' as const,
        position: { x: 0, y: 4 },
        size: { w: 2, h: 2 },
        diceType: 20,
        numDice: 1,
        modifier: 0,
        advantage: 'none',
        formula: '',
        results: [],
        finalResult: null
      });
      addWidget({
        id: 'init-1',
        type: 'InitiativeTracker' as const,
        position: { x: 2, y: 4 },
        size: { w: 4, h: 3 },
        combatants: [],
        name: '',
        initiative: 0,
        currentIndex: null,
        turnChangeAnimation: false
      });
    }
  }, [widgets, addWidget]);

  const moveItem = useCallback((from: number, to: number) => {
    if (from === to) return;
    const updated = [...widgets];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    // Update the widgets order in the store
    clearWidgets();
    updated.forEach(w => addWidget(w));
  }, [widgets, clearWidgets, addWidget]);

  // Global drop target for the grid
  const [, drop] = useDrop({
    accept: 'WIDGET',
    drop: (item: { widgetType?: string }) => {
      // If it is a new widget from sidebar (has widgetType but is not already present)
      if (item.widgetType && !widgets.some(w => w.id === item.widgetType + '-' + (widgets.length + 1))) {
        // Generate a new unique id for the widget
        const newId = item.widgetType + '-' + (widgets.length + 1);

        // Create properly typed widgets based on the widget type
        switch (item.widgetType) {
          case 'simple-table':
            addWidget({
              id: newId,
              type: 'SimpleTable' as const,
              position: { x: 0, y: 0 },
              size: { w: 2, h: 2 },
              columns: [
                { id: 1, key: 'name', label: 'Name' },
                { id: 2, key: 'value', label: 'Value' }
              ],
              rows: [
                { id: 1, name: '', value: '' },
                { id: 2, name: '', value: '' }
              ]
            });
            break;
          case 'countdown-timer':
            addWidget({
              id: newId,
              type: 'CountdownTimer' as const,
              position: { x: 0, y: 0 },
              size: { w: 2, h: 2 },
              seconds: 60,
              isRunning: false
            });
            break;
          case 'dice-roller':
            addWidget({
              id: newId,
              type: 'DiceRoller' as const,
              position: { x: 0, y: 0 },
              size: { w: 2, h: 2 },
              diceType: 20,
              numDice: 1,
              modifier: 0,
              advantage: 'none',
              formula: '',
              results: [],
              finalResult: null
            });
            break;
          case 'initiative-tracker':
            addWidget({
              id: newId,
              type: 'InitiativeTracker' as const,
              position: { x: 0, y: 0 },
              size: { w: 2, h: 2 },
              combatants: [],
              name: '',
              initiative: 0,
              currentIndex: null,
              turnChangeAnimation: false
            });
            break;
          case 'quick-notes':
            addWidget({
              id: newId,
              type: 'QuickNotes' as const,
              position: { x: 0, y: 0 },
              size: { w: 2, h: 2 }
            });
            break;
        }
      }
    },
    canDrop: (item: { widgetType?: string }) => !!item.widgetType,
  });

  return (
    <>
      <ProfileManagerPanel />
      <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className="grid grid-cols-3 gap-4 p-8 min-h-[400px]">
        {widgets.map((widget, index) => {
          const WidgetComponent = components[widget.type] || (() => null);
          return (
            <div key={widget.id} className="h-64">
              <DraggableBox id={widget.id} index={index} moveItem={moveItem}>
                <WidgetComponent {...widget} updateWidget={updateWidget} removeWidget={removeWidget} />
              </DraggableBox>
            </div>
          );
        })}
      </div>
    </>
  );
}