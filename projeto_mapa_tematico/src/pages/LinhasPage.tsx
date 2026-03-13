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
          {linhas.map((linha, index) => (
            // Adicionado index na key para garantir unicidade caso o id se repita em sentidos diferentes
            <div key={`${linha.id_linha || index}`} onClick={() => setLinhaDetalhada(linha)}>
              <Card dados={linha} />
            </div>
          ))}
        </aside>

        {/*Exibir detalhes (paradas) ao clicar */}
        <main>
          {linhaDetalhada ? (
            <div className="detalhes">
              {/* Mudança: .nome para .cd_linha */}
              <h3>Detalhes da Linha {linhaDetalhada.cd_linha}</h3>
              {/* Mudança: .rota para .tx_linha */}
              <p>Rota: {linhaDetalhada.tx_linha}</p>
              <h4>Paradas:</h4>
              <ul>
                {/* Mudança: Adicionado ?. para evitar erro de undefined e ajuste nos nomes das propriedades da parada */}
                {(linhaDetalhada as any).paradas?.map((p: any) => (
                  <li key={p.id_parada || p.id}>{p.nm_parada || p.nome}</li>
                ))}
              </ul>
              {/* Aviso caso não existam paradas carregadas no objeto */}
              {!(linhaDetalhada as any).paradas && (
                <p style={{ color: '#999', fontSize: '0.8rem' }}>Nenhuma parada carregada para esta linha.</p>
              )}
            </div>
          ) : (
            <p>Selecione uma linha para ver as paradas.</p>
          )}
        </main>
      </div>
    </div>
  );
};