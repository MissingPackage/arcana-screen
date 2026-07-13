import { useDrag } from 'react-dnd';
import { WidgetMeta } from './types';

type WidgetItemProps = {
  widget: WidgetMeta;
  isOpen: boolean;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  onAdd: (id: string) => void;
};

export default function WidgetItem({ widget, isOpen, isFavorite, toggleFavorite, onAdd }: WidgetItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SIDEBAR_WIDGET',
    item: { id: widget.id, name: widget.name, widgetType: widget.id }, // widget.id represents the type (e.g. 'simple-table')
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <li
      className={`widget-item p-2 rounded flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="widget-item__identity">
        <span
          ref={(node) => {
            drag(node);
          }}
          className="widget-item__drag"
          title={`Drag ${widget.name} to the layout`}
          aria-hidden="true"
        >
          Drag
        </span>
        <span>{isOpen ? widget.name : widget.name.slice(0, 1)}</span>
      </div>
      <div className="widget-item__actions">
        {isOpen && (
          <button
            type="button"
            className="widget-item__add"
            aria-label={`Add ${widget.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onAdd(widget.id);
            }}
          >
            Add
          </button>
        )}
        <button
          type="button"
          className="widget-item__favorite"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={`${isFavorite ? 'Remove' : 'Add'} ${widget.name} ${isFavorite ? 'from' : 'to'} favorites`}
          onClick={event => { event.stopPropagation(); toggleFavorite(widget.id); }}
        >
          {isFavorite ? 'Favorited' : 'Favorite'}
        </button>
      </div>
    </li>
  );
}
