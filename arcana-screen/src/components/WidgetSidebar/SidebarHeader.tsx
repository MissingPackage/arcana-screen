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
          <h2 className={`text-lg font-bold ${isOpen ? 'block' : 'hidden'}`}>Widgets</h2>
          <button onClick={toggleSidebar} className="text-xl">
            {isOpen ? '⬅️' : '➡️'}
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>
    );
  }