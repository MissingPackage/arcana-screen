import Grid from './components/Grid';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'react-hot-toast';
import WidgetSidebar from './components/WidgetSidebar/WidgetSidebar';
import { widgetMeta } from './components/widgets/WidgetConfig';
import './index.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-screen flex flex-row">
        {/* Sidebar a sinistra */}
        <WidgetSidebar widgets={widgetMeta} />

        {/* Main area a destra */}
        <div className="flex-1 flex flex-col">
          <Toaster />
          <header className="p-4 text-center border-b">
            <h1 className="text-3xl font-bold">ArcanaScreen</h1>
            <p className="text-sm mt-2">The customizable virtual DM screen</p>
            <div className="mt-2">
              <button
                onClick={toggleTheme}
                className="px-3 py-2 rounded transition"
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Grid />
          </main>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
