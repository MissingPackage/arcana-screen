import { CaretLeft, CaretRight } from '@phosphor-icons/react';

type SidebarHeaderProps = {
    isOpen: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    toggleSidebar: () => void;
  };

  export default function SidebarHeader({ isOpen, searchQuery, setSearchQuery, toggleSidebar }: SidebarHeaderProps) {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`widget-sidebar__title ${isOpen ? 'block' : 'hidden'}`}>Widgets</h2>
          <button
            onClick={toggleSidebar}
            className="widget-sidebar__toggle"
            aria-label={isOpen ? 'Collapse widget sidebar' : 'Expand widget sidebar'}
          >
            {isOpen ? <CaretLeft size={16} weight="bold" aria-hidden="true" /> : <CaretRight size={16} weight="bold" aria-hidden="true" />}
          </button>
        </div>
        {isOpen && (
          <input
            type="search"
            placeholder="Search widgets..."
            aria-label="Search widgets"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="widget-sidebar__search"
          />
        )}
      </div>
    );
  }
