import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import type { Linha, Parada } from '../types/Linha';

export const useBusLines = () => {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [linhaSelecionada, setLinhaSelecionada] = useState<Linha | null>(null);
  const [sentido, setSentido] = useState<string>('1');
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Carrega linhas e remove duplicatas para a lista lateral
  useEffect(() => {
    api.getLinhas().then(dados => {
      const unicas = Array.from(new Map(dados.map(l => [l.cd_linha, l])).values());
      setLinhas(unicas);
    }).catch(console.error);
  }, []);

  // 2. Carrega paradas quando muda a linha ou o sentido
  useEffect(() => {
    if (!linhaSelecionada) return;
    const controller = new AbortController();
    
    setLoading(true);
    api.getParadas(linhaSelecionada.cd_linha, sentido, controller.signal)
      .then(dados => {
        setParadas(dados);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setLoading(false);
      });

    return () => controller.abort();
  }, [linhaSelecionada, sentido]);

  const linhasFiltradas = useMemo(() => {
    return linhas.filter(l => 
      l.cd_linha.includes(termoBusca) || l.tx_linha.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [linhas, termoBusca]);

  return {
    linhasFiltradas, termoBusca, setTermoBusca,
    linhaSelecionada, setLinhaSelecionada,
    sentido, setSentido,
    paradas, loading
  };
};