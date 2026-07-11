import { useState, useMemo } from 'react';
import SidebarHeader from './SidebarHeader';
import WidgetList from './WidgetList';
import { widgetMeta } from '../widgets/WidgetConfig';
import { useAppStore } from '../../store/appStore';

export default function WidgetSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const isOpen = useAppStore(state => state.isSidebarOpen);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const favoriteWidgetIds = useAppStore(state => state.favoriteWidgetIds);
  const toggleFavorite = useAppStore(state => state.toggleFavorite);

  // Filtra i widget in base alla ricerca
  const filteredWidgets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return widgetMeta.filter(w =>
      w.name.toLowerCase().includes(query) ||
      w.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Divide tra preferiti e altri
  const favorites = filteredWidgets.filter(w => favoriteWidgetIds.includes(w.id));
  const others = filteredWidgets.filter(w => !favoriteWidgetIds.includes(w.id));

  return (
    <div className={`surface shrink-0 transition-all duration-300 ${
      isOpen
        ? 'w-full md:w-64 max-h-[40vh] md:max-h-none'
        : 'w-full md:w-16'
    } h-auto md:h-screen p-2 flex flex-col relative`}>
      <SidebarHeader
        isOpen={isOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        toggleSidebar={toggleSidebar}
      />
      {favorites.length > 0 && (
        <div className={`${isOpen ? 'block' : 'hidden md:block'} mb-4 mt-2 min-h-0 overflow-y-auto`}>
          <h3 className={`font-semibold mb-2 ${isOpen ? 'block' : 'hidden'}`}>Favorites</h3>
          <WidgetList widgets={favorites} isOpen={isOpen} favoriteWidgetIds={favoriteWidgetIds} toggleFavorite={toggleFavorite} />
        </div>
      )}
      <div className={`${isOpen ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-y-auto`}>
        <WidgetList widgets={others} isOpen={isOpen} favoriteWidgetIds={favoriteWidgetIds} toggleFavorite={toggleFavorite} />
      </div>
    </div>
  );
}
