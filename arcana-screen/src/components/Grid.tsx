import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react';
import QuickNotes from './widgets/QuickNotes';

const ItemType = 'WIDGET';


const components: { [key: number]: typeof QuickNotes } = {
  1: QuickNotes,
  2: QuickNotes,
  3: QuickNotes,
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
  const [items, setItems] = useState([1, 2, 3]);

  const moveItem = (from: number, to: number) => {
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-3 gap-4 p-8">
        {items.map((id, index) => {
          const WidgetComponent = components[id];
          return (
            <div key={id} className="h-64">
              <DraggableBox id={id} index={index} moveItem={moveItem}>
                <WidgetComponent />
              </DraggableBox>
            </div>
          );
        })}
      </div>
    </DndProvider>
  );
}