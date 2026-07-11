import { WidgetMeta } from './types';
import WidgetItem from './WidgetItem';

type WidgetListProps = {
  widgets: WidgetMeta[];
  isOpen: boolean;
  favoriteWidgetIds: string[];
  toggleFavorite: (id: string) => void;
};

export default function WidgetList({ widgets, isOpen, favoriteWidgetIds, toggleFavorite }: WidgetListProps) {
  return (
    <ul>
      {widgets.map(widget => (
        <WidgetItem
          key={widget.id}
          widget={widget}
          isOpen={isOpen}
          isFavorite={favoriteWidgetIds.includes(widget.id)}
          toggleFavorite={toggleFavorite}
        />
      ))}
    </ul>
  );
}
