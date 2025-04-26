import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react';

const ItemType = 'WIDGET';

function DraggableBox({ id, index, moveItem }: any) {
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
      className="bg-[#f7ecd0] text-[#4b2e05] p-6 rounded-xl shadow-lg cursor-move text-center border-2 border-[#bfa873] hover:border-[#a97c50] transition-all duration-300 min-h-[120px] flex items-center justify-center font-serif tracking-wide"
    >
      Widget #{id}
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
      <div className="grid grid-cols-3 gap-8 w-full h-full justify-items-center items-center p-8">
        {items.map((id, index) => (
          <DraggableBox key={id} id={id} index={index} moveItem={moveItem} />
        ))}
      </div>
    </DndProvider>
  );
}