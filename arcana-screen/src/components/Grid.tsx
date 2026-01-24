import { useDrag, useDrop } from 'react-dnd';
import { useCallback, useEffect, useRef } from 'react';
import QuickNotes from './widgets/QuickNotes';
import DiceRoller from './widgets/DiceRoller';
import CountdownTimer from './widgets/CountdownTimer';
import SimpleTable from './widgets/SimpleTable';
import InitiativeTracker from './widgets/InitiativeTracker';
import { useWidgetStore } from '../store/useWidgetStore';
import ProfileManagerPanel from './ProfileManager/ProfileManagerPanel';

const ItemType = 'WIDGET';

const components: { [key: string]: React.FC<any> } = {
  SimpleTable,
  CountdownTimer,
  DiceRoller,
  InitiativeTracker,
  QuickNotes,
};

function DraggableBox({ id, index, moveItem, children }: any) {
  const [, drag] = useDrag({
    type: ItemType,
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (dragged: any) => {
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
        type: 'SimpleTable',
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
        type: 'CountdownTimer',
        position: { x: 4, y: 0 },
        size: { w: 2, h: 2 },
        seconds: 60,
        isRunning: false
      });
      addWidget({
        id: 'dice-1',
        type: 'DiceRoller',
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
        type: 'InitiativeTracker',
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
    drop: (item: any, monitor) => {
      // If it is a new widget from sidebar (has widgetType but is not already present)
      if (item.widgetType && !widgets.some(w => w.id === item.widgetType + '-' + (widgets.length + 1))) {
        // Generate a new unique id for the widget
        const newId = item.widgetType + '-' + (widgets.length + 1);
        // Map the type to what the grid requires
        let type = '';
        switch (item.widgetType) {
          case 'simple-table':
            type = 'SimpleTable';
            break;
          case 'countdown-timer':
            type = 'CountdownTimer';
            break;
          case 'dice-roller':
            type = 'DiceRoller';
            break;
          case 'initiative-tracker':
            type = 'InitiativeTracker';
            break;
          case 'quick-notes':
            type = 'QuickNotes';
            break;
          default:
            type = item.widgetType;
        }
        // Create the new widget with minimal data
        const newWidget: any = {
          id: newId,
          type,
          position: { x: 0, y: 0 },
          size: { w: 2, h: 2 }
        };
        // Optionally add type-specific data
        if (type === 'SimpleTable') {
          newWidget.columns = [
            { id: 1, key: 'name', label: 'Name' },
            { id: 2, key: 'value', label: 'Value' }
          ];
          newWidget.rows = [
            { id: 1, name: '', value: '' },
            { id: 2, name: '', value: '' }
          ];
        }
        if (type === 'CountdownTimer') {
          newWidget.seconds = 60;
          newWidget.isRunning = false;
        }
        if (type === 'DiceRoller') {
          newWidget.diceType = 20;
          newWidget.numDice = 1;
          newWidget.modifier = 0;
          newWidget.advantage = 'none';
          newWidget.formula = '';
          newWidget.results = [];
          newWidget.finalResult = null;
        }
        if (type === 'InitiativeTracker') {
          newWidget.combatants = [];
          newWidget.name = '';
          newWidget.initiative = 0;
          newWidget.currentIndex = null;
          newWidget.turnChangeAnimation = false;
        }
        if (type === 'QuickNotes') {
          // any initial data
        }
        addWidget(newWidget);
      }
    },
    canDrop: (item: any, monitor) => !!item.widgetType,
  });

  return (
    <>
      <ProfileManagerPanel />
      <div ref={drop} className="grid grid-cols-3 gap-4 p-8 min-h-[400px]">
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