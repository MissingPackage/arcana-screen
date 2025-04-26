import Grid from './components/Grid';
import { useThemeStore } from './store/themeStore';
import './index.css';

function App() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className={`h-screen w-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-parchment text-gray-900'}`}>
      
      <header className="p-4 text-center border-b border-gray-700">
        <h1 className="text-3xl font-bold">ArcanaScreen</h1>
        <p className="text-gray-400 text-sm mt-2">The customizable virtual DM screen</p>
        <div className="mt-2">
          <button
            onClick={toggleTheme}
            className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 transition"
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
