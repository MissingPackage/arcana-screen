import { useState, useMemo } from 'react';
import SidebarHeader from './SidebarHeader';
import WidgetList from './WidgetList';
import { createToolInstance, toolCatalog as widgetMeta } from '../widgets/toolRegistry';
import { useAppStore } from '../../store/appStore';
import { useWidgetStore } from '../../store/useWidgetStore';

export default function WidgetSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const isOpen = useAppStore(state => state.isSidebarOpen);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const favoriteWidgetIds = useAppStore(state => state.favoriteWidgetIds);
  const toggleFavorite = useAppStore(state => state.toggleFavorite);
  const addWidget = useWidgetStore(state => state.addWidget);

  const handleAdd = (widgetId: string) => {
    addWidget(createToolInstance(widgetId));
  };

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(widgetMeta.map((widget) => widget.category)))],
    [],
  );

  // Filtra i widget in base alla ricerca
  const filteredWidgets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return widgetMeta.filter(w =>
      (category === 'All' || w.category === category) &&
      (w.name.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query) ||
        w.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [category, searchQuery]);

  // Divide tra preferiti e altri
  const favorites = filteredWidgets.filter(w => favoriteWidgetIds.includes(w.id));
  const others = filteredWidgets.filter(w => !favoriteWidgetIds.includes(w.id));

  return (
    <aside aria-label="Tool library" className={`widget-sidebar surface ${isOpen ? 'widget-sidebar--open' : 'widget-sidebar--closed'}`}>
      <SidebarHeader
        isOpen={isOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        toggleSidebar={toggleSidebar}
      />
      {isOpen && (
        <label className="widget-sidebar__category">
          <span>Category</span>
          <select
            aria-label="Filter tools by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      )}
      {favorites.length > 0 && (
        <div className={`${isOpen ? 'block' : 'hidden md:block'} mb-4 mt-2 min-h-0 overflow-y-auto`}>
          <h3 className={`font-semibold mb-2 ${isOpen ? 'block' : 'hidden'}`}>Favorites</h3>
          <WidgetList widgets={favorites} isOpen={isOpen} favoriteWidgetIds={favoriteWidgetIds} toggleFavorite={toggleFavorite} onAdd={handleAdd} />
        </div>
      )}
      <div className={`${isOpen ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-y-auto`}>
        <WidgetList widgets={others} isOpen={isOpen} favoriteWidgetIds={favoriteWidgetIds} toggleFavorite={toggleFavorite} onAdd={handleAdd} />
      </div>
    </aside>
  );
}
