import { useState, useEffect, Suspense, useMemo } from 'react';
import { Card } from '../components';
import { MapaLazy } from '../components/Mapa.lazy';
import { api } from '../services/api';
import type { Linha, Parada } from '../types/Linha';

export const Home = () => {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState<string>('');
  const [linhaSelecionada, setLinhaSelecionada] = useState<Linha | null>(null);

  const [paradas, setParadas] = useState<Parada[]>([]);
  const [sentidoSelecionado, setSentidoSelecionado] = useState<'IDA' | 'VOLTA' | 'CIRCULAR'>('IDA');

  // --- NOVA LÓGICA DE DESTAQUE ---
  const [paradaHover, setParadaHover] = useState<string | number | null>(null);
  const [paradaSelecionada, setParadaSelecionada] = useState<string | number | null>(null);
  const paradaParaDestacarNoMapa = paradaSelecionada || paradaHover;

  const formatarCodigo = (codigo: any) => String(codigo || '').trim();

  // Carregamento inicial das linhas
  useEffect(() => {
    setCarregando(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
    console.log("Conectando em:", apiUrl);

    api.getLinhas()
      .then((dados) => {
        setLinhas(dados);
        setError(null);
      })
      .catch(err => {
        console.error("Erro ao carregar linhas:", err);
        setError("Não foi possível conectar ao servidor.");
      })
      .finally(() => setCarregando(false));
  }, []);

  // Filtro de busca
  const linhasFiltradasParaBusca = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];

    return linhas.filter((linha, index, self) => {
      const cdLinha = String(linha.cd_linha || '').toLowerCase();
      const txLinha = String(linha.tx_linha || '').toLowerCase();
      const corresponde = cdLinha.includes(termo) || txLinha.includes(termo);

      return corresponde && self.findIndex(l =>
        formatarCodigo(l.cd_linha) === formatarCodigo(linha.cd_linha)
      ) === index;
    });
  }, [busca, linhas]);

  const selecionarLinha = (linha: Linha) => {
    setLinhaSelecionada(linha);
    setBusca('');
    setParadaSelecionada(null);
    setParadaHover(null);

    const sentidoInicial = (linha as any).sentido?.trim().toUpperCase();
    setSentidoSelecionado(['IDA', 'VOLTA', 'CIRCULAR'].includes(sentidoInicial) ? sentidoInicial : 'IDA');
  };

  // Busca de paradas quando a linha ou sentido muda
  useEffect(() => {
    if (linhaSelecionada?.cd_linha) {
      setParadas([]);
      setParadaSelecionada(null);
      setParadaHover(null);

      const cod = formatarCodigo(linhaSelecionada.cd_linha);
      const controller = new AbortController();

      api.getParadas(cod, sentidoSelecionado, controller.signal)
        .then(setParadas)
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Erro ao buscar paradas:", err);
            setParadas([]);
          }
        });

      return () => controller.abort();
    }
  }, [linhaSelecionada, sentidoSelecionado]);

  // Memoriza a geometria correta baseada no sentido
  const linhaComGeometriaCerta = useMemo(() => {
    if (!linhaSelecionada) return null;
    return {
      ...linhaSelecionada,
      geometry: linhas.find(l =>
        formatarCodigo(l.cd_linha) === formatarCodigo(linhaSelecionada.cd_linha) &&
        String((l as any).sentido || '').trim().toUpperCase() === sentidoSelecionado
      )?.geometry || linhaSelecionada.geometry
    };
  }, [linhaSelecionada, sentidoSelecionado, linhas]);

  const lidarComCliqueNaParada = (idParada: string | number) => {
    if (paradaSelecionada === idParada) {
      setParadaSelecionada(null);
    } else {
      setParadaSelecionada(idParada);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>

      {/* MAPA (Fundo) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando Mapa...</div>}>
          <MapaLazy
            key={`${linhaSelecionada?.cd_linha || 'mapa'}-${sentidoSelecionado}`}
            linhaSelecionada={linhaComGeometriaCerta}
            paradas={paradas}
            paradaFocada={paradaParaDestacarNoMapa}
          />
        </Suspense>
      </div>

      {/* PAINEL LATERAL (Direita) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, width: '350px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>SEMOB Digital</h2>
          {error && <p style={{ color: '#d32f2f', fontSize: '0.8rem', marginBottom: '10px', backgroundColor: '#ffebee', padding: '5px', borderRadius: '4px' }}>⚠️ {error}</p>}
          <input
            type="text"
            placeholder='Busque por linha ou nome...'
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoComplete="off"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>

        {!linhaSelecionada && linhasFiltradasParaBusca.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflowY: 'auto', maxHeight: '60vh', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {linhasFiltradasParaBusca.map((linha) => (
              <div
                key={linha.id_linha}
                onClick={() => selecionarLinha(linha)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Card dados={{...linha, cd_linha: formatarCodigo(linha.cd_linha)}} />
              </div>
            ))}
          </div>
        )}

        {linhaSelecionada && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <strong style={{ fontSize: '1.2rem', color: '#1a73e8' }}>Linha {formatarCodigo(linhaSelecionada.cd_linha)}</strong>
                <small style={{ color: '#666', display: 'block', marginTop: '2px', fontSize: '0.8rem' }}>{linhaSelecionada.tx_linha}</small>
              </div>
              <button
                onClick={() => { setLinhaSelecionada(null); setParadas([]); }}
                style={{ cursor: 'pointer', border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              >✕</button>
            </div>

            <div style={{ display: 'flex', backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '4px', marginBottom: '15px' }}>
              {(['IDA', 'VOLTA', 'CIRCULAR'] as const)
                .filter(s => linhas.some(l => formatarCodigo(l.cd_linha) === formatarCodigo(linhaSelecionada.cd_linha) && String((l as any).sentido || '').toUpperCase() === s))
                .map((s) => (
                <button
                  key={s}
                  onClick={() => setSentidoSelecionado(s)}
                  style={{
                    flex: 1, border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: sentidoSelecionado === s ? 'white' : 'transparent',
                    fontWeight: sentidoSelecionado === s ? 'bold' : 'normal',
                    color: sentidoSelecionado === s ? '#1a73e8' : '#555',
                    fontSize: '0.8rem', transition: '0.2s all', outline: 'none'
                  }}
                >{s}</button>
              ))}
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '45vh', paddingRight: '5px' }}>
              {paradas.length > 0 ? paradas.map((p) => {
                const estaEmDestaque = (paradaParaDestacarNoMapa === p.id_parada);
                const estaSelecionadaFixo = (paradaSelecionada === p.id_parada);

                return (
                  <div
                    key={`parada-${p.id_parada}`}
                    onMouseEnter={() => setParadaHover(p.id_parada)}
                    onMouseLeave={() => setParadaHover(null)}
                    onClick={() => lidarComCliqueNaParada(p.id_parada)}
                    style={{
                      padding: '10px 12px',
                      borderLeft: `4px solid ${estaEmDestaque ? '#d32f2f' : '#1a73e8'}`,
                      fontSize: '0.85rem', cursor: 'pointer',
                      backgroundColor: estaSelecionadaFixo ? '#ffebee' : (paradaHover === p.id_parada ? '#f1f3f4' : 'transparent'),
                      marginBottom: '3px',
                      borderRadius: '0 4px 4px 0',
                      transition: '0.2s all',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{
                      fontWeight: 'bold',
                      marginRight: '10px',
                      color: estaEmDestaque ? '#d32f2f' : '#1a73e8',
                      fontSize: '0.9rem',
                      minWidth: '25px',
                      textAlign: 'right'
                    }}>
                      {p.nr_sequencia}.
                    </span>
                    <span style={{ color: estaEmDestaque ? '#c62828' : '#333', fontWeight: estaSelecionadaFixo ? 'bold' : 'normal' }}>
                      {p.nm_parada || `Parada ${p.id_parada}`}
                    </span>
                  </div>
                );
              }) : (
                <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', padding: '20px' }}>⏳ Carregando itinerário...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};