import Grid from './components/Grid';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'react-hot-toast';
import WidgetSidebar from './components/WidgetSidebar/WidgetSidebar';
import './index.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';
import { useTourStore } from './store/tourStore';
import { useEffect } from 'react';

function App() {
  const { theme, toggleTheme } = useThemeStore();
  const hasSeenTour = useTourStore((state) => state.hasSeenTour);
  const startTour = useTourStore((state) => state.startTour);
  const restartTour = useTourStore((state) => state.restartTour);

  useEffect(() => {
    if (!hasSeenTour) {
      startTour();
    }
  }, [hasSeenTour, startTour]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left sidebar */}
        <WidgetSidebar />

        {/* Main content area */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <Toaster />
          <header className="p-4 text-center border-b">
            <h1 className="text-3xl font-bold">ArcanaScreen</h1>
            <p className="text-sm mt-2">The customizable virtual DM screen</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              <button
                onClick={toggleTheme}
                className="px-3 py-2 rounded transition"
              >
                Toggle {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={restartTour}
                className="px-3 py-2 rounded transition"
              >
                Restart Tour
              </button>
            </div>
          </header>
          <main className="flex-1 min-h-0 overflow-auto p-2 sm:p-4">
            <Grid />
          </main>
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </DndProvider>
  );
}

export default App;
