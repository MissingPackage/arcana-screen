import { WidgetMeta } from './types';
import WidgetItem from './WidgetItem';

type WidgetListProps = {
  widgets: WidgetMeta[];
  isOpen: boolean;
  toggleFavorite: (id: string) => void;
};

export default function WidgetList({ widgets, isOpen, toggleFavorite }: WidgetListProps) {
  const handleClick = (widget: WidgetMeta) => {
    console.log('Clicked:', widget.name);
  };

  return (
    <ul>
      {widgets.map(widget => (
        <WidgetItem key={widget.id} widget={widget} isOpen={isOpen} onClick={handleClick} toggleFavorite={toggleFavorite} />
      ))}
    </ul>
  );
}