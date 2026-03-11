import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { buscarLinhasSITURB } from '../services/api';
import type { Linha } from '../types/Linha';

export const LinhasPage = () => {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [linhaDetalhada, setLinhaDetalhada] = useState<Linha | null>(null);

  useEffect(() => {
    buscarLinhasSITURB().then(setLinhas);
  }, []);

  return (
    <div className="page-container">
      <h2>Linhas de Ônibus</h2>
      <div className="list-layout">
        <aside>
          {linhas.map(linha => (
            <div key={linha.id} onClick={() => setLinhaDetalhada(linha)}>
              <Card dados={linha} />
            </div>
          ))}
        </aside>

        {/* Requisito da Fase 3: Exibir detalhes (paradas) ao clicar */}
        <main>
          {linhaDetalhada ? (
            <div className="detalhes">
              <h3>Detalhes da Linha {linhaDetalhada.nome}</h3>
              <p>Rota: {linhaDetalhada.rota}</p>
              <h4>Paradas:</h4>
              <ul>
                {linhaDetalhada.paradas.map(p => (
                  <li key={p.id}>{p.nome}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Selecione uma linha para ver as paradas.</p>
          )}
        </main>
      </div>
    </div>
  );
};