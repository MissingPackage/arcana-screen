import { useDrag } from 'react-dnd';
import { WidgetMeta } from './types';

type WidgetItemProps = {
  widget: WidgetMeta;
  isOpen: boolean;
  onClick: (widget: WidgetMeta) => void;
  toggleFavorite: (id: string) => void;
};

export default function WidgetItem({ widget, isOpen, onClick, toggleFavorite }: WidgetItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET',
    item: { id: widget.id, name: widget.name, widgetType: widget.id }, // widget.id rappresenta il tipo (es: 'simple-table')
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return drag(
    <li
      className={`p-2 hover:bg-gray-200 rounded cursor-pointer flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
    >
      <span>{isOpen ? widget.name : '🔹'}</span>
      <button
        className="ml-2 text-yellow-500 hover:text-yellow-700 text-lg focus:outline-none"
        title={widget.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        onClick={e => { e.stopPropagation(); toggleFavorite(widget.id); }}
        tabIndex={-1}
      >
        {widget.isFavorite ? '★' : '☆'}
      </button>
    </li>
  );
}