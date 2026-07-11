import { useDrag } from 'react-dnd';
import { WidgetMeta } from './types';

type WidgetItemProps = {
  widget: WidgetMeta;
  isOpen: boolean;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
};

export default function WidgetItem({ widget, isOpen, isFavorite, toggleFavorite }: WidgetItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SIDEBAR_WIDGET',
    item: { id: widget.id, name: widget.name, widgetType: widget.id }, // widget.id represents the type (e.g. 'simple-table')
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return drag(
    <li
      className={`widget-item p-2 rounded cursor-pointer flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
    >
      <span>{isOpen ? widget.name : '🔹'}</span>
      <button
        className="ml-2 p-1 bg-transparent hover:bg-transparent text-yellow-500 hover:text-yellow-700 text-lg focus:outline-none"
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={`${isFavorite ? 'Remove' : 'Add'} ${widget.name} ${isFavorite ? 'from' : 'to'} favorites`}
        onClick={e => { e.stopPropagation(); toggleFavorite(widget.id); }}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </li>
  );
}
