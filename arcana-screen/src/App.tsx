import Grid from './components/Grid';
import { useThemeStore } from './store/themeStore';
import './index.css';

import { Toaster } from 'react-hot-toast';

function App() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="h-screen w-screen flex flex-col">
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
  );
}

export default App;
