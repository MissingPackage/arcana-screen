import { useAppStore } from './store/appStore';

function App() {
  const count = useAppStore((state) => state.count);
  const increment = useAppStore((state) => state.increment);
  const decrement = useAppStore((state) => state.decrement);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Zustand Counter</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={decrement}
          className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        >
          -
        </button>
        <span className="text-2xl">{count}</span>
        <button
          onClick={increment}
          className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default App;