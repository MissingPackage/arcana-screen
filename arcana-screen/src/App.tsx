import Grid from './components/Grid'; // importa il Grid che abbiamo creato
import './index.css'; // importa i tuoi stili Tailwind

function App() {
  return (
    <div className="h-screen w-screen flex flex-col" style={{
      backgroundColor: '#e6d3b3',
      backgroundImage: `linear-gradient(135deg, #e6d3b3 0%, #bfa873 100%), url('data:image/svg+xml;utf8,<svg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><rect width=\'40\' height=\'40\' fill=\'%23e9d8b7\'/><path d=\'M0 39 Q20 41 40 39\' stroke=\'%23bfa873\' stroke-width=\'2\' fill=\'none\'/></svg>')`,
      backgroundBlendMode: 'multiply',
      backgroundRepeat: 'repeat',
      backgroundSize: 'auto',
      color: '#4b2e05',
    }}>

      <header className="p-4 text-center border-b border-gray-700">
        <h1 className="text-3xl font-bold">ArcanaScreen</h1>
        <p className="text-gray-400 text-sm mt-2">The customizable virtual DM screen</p>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <Grid />
      </main>
    </div>
  );
}

export default App;