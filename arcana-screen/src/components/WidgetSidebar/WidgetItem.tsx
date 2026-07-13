import { useDrag } from 'react-dnd';
import {
  BookOpen,
  DiceFive,
  DotsSixVertical,
  Hash,
  Lightning,
  NotePencil,
  Plus,
  Star,
  Sword,
  Table,
  type Icon,
} from '@phosphor-icons/react';
import { WidgetMeta } from './types';

type WidgetItemProps = {
  widget: WidgetMeta;
  isOpen: boolean;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  onAdd: (id: string) => void;
};

const widgetIcons: Record<string, Icon> = {
  'quick-notes': NotePencil,
  'quick-capture': Lightning,
  'quick-reference': BookOpen,
  'dice-roller': DiceFive,
  'countdown-timer': Hash,
  'initiative-tracker': Sword,
  'simple-table': Table,
  counter: Hash,
};

export default function WidgetItem({ widget, isOpen, isFavorite, toggleFavorite, onAdd }: WidgetItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SIDEBAR_WIDGET',
    item: { id: widget.id, name: widget.name, widgetType: widget.id }, // widget.id represents the type (e.g. 'simple-table')
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const RowIcon = widgetIcons[widget.id];

  return (
    <li
      className={`widget-item p-2 flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
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
          <DotsSixVertical size={16} weight="bold" />
        </span>
        {isOpen && RowIcon && (
          <span className="widget-item__icon" aria-hidden="true">
            <RowIcon size={13} weight="regular" />
          </span>
        )}
        <span className="widget-item__name" title={isOpen ? widget.name : undefined}>{isOpen ? widget.name : widget.name.slice(0, 1)}</span>
      </div>
      <div className="widget-item__actions">
        {isOpen && (
          <button
            type="button"
            className="widget-item__add"
            aria-label={`Add ${widget.name}`}
            title={`Add ${widget.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onAdd(widget.id);
            }}
          >
            <Plus size={14} weight="bold" />
          </button>
        )}
        <button
          type="button"
          className={`widget-item__favorite${isFavorite ? ' is-active' : ''}`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={`${isFavorite ? 'Remove' : 'Add'} ${widget.name} ${isFavorite ? 'from' : 'to'} favorites`}
          aria-pressed={isFavorite}
          onClick={event => { event.stopPropagation(); toggleFavorite(widget.id); }}
        >
          <Star size={14} weight={isFavorite ? 'fill' : 'regular'} />
        </button>
      </div>
    </li>
  );
}
