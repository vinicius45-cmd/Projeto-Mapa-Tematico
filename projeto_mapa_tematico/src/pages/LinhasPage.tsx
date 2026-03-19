import { useState, useEffect, Suspense } from 'react';
import { Card } from '../components/Card';
import { MapaLazy } from '../components/Mapa.lazy';
import { api } from '../services/api';
import type { Linha } from '../types/Linha';

export const LinhasPage = () => {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [linhaSelecionada, setLinhaSelecionada] = useState<Linha | null>(null);
  const [paradaFocada, setParadaFocada] = useState<string | null>(null); // ESTADO NOVO
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLinhas()
      .then(setLinhas)
      .catch(err => console.error("Erro ao carregar linhas:", err))
      .finally(() => setLoading(false));
  }, []);

  // Quando trocar de linha, resetamos a parada focada para evitar erros visualizando a linha anterior
  const handleSelecionarLinha = (linha: Linha) => {
    setLinhaSelecionada(linha);
    setParadaFocada(null); 
  };

  return (
    <div className="flex h-screen overflow-hidden"> 
      <aside className="w-1/3 overflow-y-auto border-r p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">Linhas de Ônibus</h2>
        
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <p className="text-gray-500 animate-pulse">Carregando linhas...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {linhas.map((linha) => (
              <div 
                key={linha.id_linha} 
                className={`cursor-pointer transition-all p-1 rounded-lg border-2 ${
                  linhaSelecionada?.id_linha === linha.id_linha 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-transparent hover:bg-gray-100'
                }`}
                onClick={() => handleSelecionarLinha(linha)}
              >
                <Card dados={linha} />
                
                {/* LISTA DE PARADAS (Aparece apenas se a linha estiver selecionada) */}
                {linhaSelecionada?.id_linha === linha.id_linha && (
                  <div className="mt-3 pl-4 border-l-2 border-blue-300 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Paradas desta linha:
                    </p>
                    {linha.paradas?.map((parada) => (
                      <button
                        key={parada.id_parada}
                        onClick={(e) => {
                          e.stopPropagation(); // Não deselecionar a linha ao clicar na parada
                          setParadaFocada(String(parada.id_parada));
                        }}
                        className={`w-full text-left text-sm p-2 rounded transition ${
                          paradaFocada === String(parada.id_parada)
                            ? 'bg-red-500 text-white font-bold shadow-md'
                            : 'bg-white hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {parada.nm_parada}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>

      <main className="flex-1 relative bg-gray-200">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando mapa...</p>
            </div>
          </div>
        }>
          <MapaLazy 
            linhaSelecionada={linhaSelecionada} 
            paradas={linhaSelecionada?.paradas || []} 
            paradaFocada={paradaFocada} // PASSANDO O ESTADO PARA O MAPA
          />
        </Suspense>
      </main>
    </div>
  );
};