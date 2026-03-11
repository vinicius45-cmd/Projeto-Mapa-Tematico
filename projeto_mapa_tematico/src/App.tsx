import { Home } from './pages/Home';

function App() {
  // Aqui você poderia ter a lógica de rotas no futuro
  return (
    <>
      {/* CSS Global para o Leaflet que adicionamos antes */}
      <style>{`
        .leaflet-container { width: 100%; height: 100%; }
        body { margin: 0; padding: 0; }
      `}</style>
      
      <Home />
    </>
  );
}

export default App;