import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCallback } from 'react';
import QuickNotes from './widgets/QuickNotes';
import DiceRoller from './widgets/DiceRoller';
import CountdownTimer from './widgets/CountdownTimer';
import SimpleTable from './widgets/SimpleTable';
import InitiativeTracker from './widgets/InitiativeTracker';
import { useWidgetStore } from '../store/useWidgetStore';

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

import { useEffect } from 'react';

export default function Grid() {
  const widgets = useWidgetStore((state) => state.widgets);
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const removeWidget = useWidgetStore((state) => state.removeWidget);
  const addWidget = useWidgetStore((state) => state.addWidget);
  const clearWidgets = useWidgetStore((state) => state.clearWidgets);

  useEffect(() => {
    if (widgets.length === 0) {
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-3 gap-4 p-8">
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
    </DndProvider>
  );
}