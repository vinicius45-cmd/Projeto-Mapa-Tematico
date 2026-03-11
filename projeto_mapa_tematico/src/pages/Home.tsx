import { useState, useEffect } from 'react';
import { Card, Mapa } from '../components';
import { buscarLinhasSITURB } from '../services/api';
import type { Linha } from '../types/Linha';

interface ParadaBackend {
  id: string | number;
  latitude: number;
  longitude: number;
  ordem_progresso: number;
}

export const Home = () => {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [linhaSelecionada, setLinhaSelecionada] = useState<Linha | null>(null);
  
  const [paradas, setParadas] = useState<any[]>([]);
  const [paradaFocada, setParadaFocada] = useState<string | number | null>(null);
  const [sentidoSelecionado, setSentidoSelecionado] = useState<'IDA' | 'VOLTA' | 'CIRCULAR'>('IDA');

  const formatarCodigo = (codigo: any) => String(codigo).trim();

  useEffect(() => {
    buscarLinhasSITURB().then((dados) => {
      if (dados) setLinhas(dados);
      setCarregando(false);
    });
  }, []);

  const linhasFiltradasParaBusca = linhas.reduce((acc: Linha[], linha) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return acc;
    
    const cdLinha = String(linha.cd_linha || '').toLowerCase();
    const txLinha = String(linha.tx_linha || '').toLowerCase();
    
    if (cdLinha.includes(termo) || txLinha.includes(termo)) {
      if (!acc.find(l => String(l.cd_linha).trim() === String(linha.cd_linha).trim())) {
        acc.push(linha);
      }
    }
    return acc;
  }, []);

  const selecionarLinha = (linha: Linha) => {
    setLinhaSelecionada(linha);
    setBusca('');
    const sentidoInicial = (linha as any).sentido?.trim().toUpperCase();
    if (['IDA', 'VOLTA', 'CIRCULAR'].includes(sentidoInicial)) {
      setSentidoSelecionado(sentidoInicial as any);
    } else {
      setSentidoSelecionado('IDA');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (linhasFiltradasParaBusca.length > 0) {
        selecionarLinha(linhasFiltradasParaBusca[0]);
      }
    }
  };

  useEffect(() => {
    if (linhaSelecionada && linhaSelecionada.cd_linha) {
      setParadas([]); 
      setParadaFocada(null);
      const cod = formatarCodigo(linhaSelecionada.cd_linha);
      const controller = new AbortController();

      fetch(`http://localhost:3000/paradas/busca?codigo=${cod}&sentido=${sentidoSelecionado}`, {
        signal: controller.signal
      })
        .then(res => res.ok ? res.json() : [])
        .then((dados: ParadaBackend[]) => {
          if (Array.isArray(dados)) {
            const paradasFormatadas = dados.map((p, index) => ({
              id_parada: p.id,
              nr_sequencia: index + 1,
              nr_latitude: p.latitude,
              nr_longitude: p.longitude,
              nm_parada: `Parada ${index + 1}`
            }));
            setParadas(paradasFormatadas);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Erro ao buscar paradas:", err);
            setParadas([]);
          }
        });
      return () => controller.abort();
    }
  }, [linhaSelecionada, sentidoSelecionado]);

  const linhaComGeometriaCerta = linhaSelecionada ? {
    ...linhaSelecionada,
    geometry: linhas.find(l => 
      formatarCodigo(l.cd_linha) === formatarCodigo(linhaSelecionada.cd_linha) && 
      String((l as any).sentido || '').trim().toUpperCase() === sentidoSelecionado
    )?.geometry || linhaSelecionada.geometry
  } : null;

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Mapa 
          key={`${linhaSelecionada?.cd_linha || 'mapa'}-${sentidoSelecionado}`}
          linhaSelecionada={linhaComGeometriaCerta} 
          paradas={paradas} 
          paradaFocada={paradaFocada} 
        />
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, width: '350px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#333' }}>SEMOB Digital</h2>
          
          {carregando ? (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>⏳ Carregando linhas...</p>
          ) : (
            <input
              type="text"
              placeholder='Ex: "870.1" ou "Rodoviária do Plano Piloto"'
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' }}
            />
          )}
        </div>

        {!linhaSelecionada && busca.trim().length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflowY: 'auto', maxHeight: '60vh', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            {linhasFiltradasParaBusca.map((linha, index) => (
              <div key={`${linha.id_linha}-${index}`} onClick={() => selecionarLinha(linha)} style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                <Card dados={{...linha, cd_linha: formatarCodigo(linha.cd_linha)}} />
              </div>
            ))}
          </div>
        )}

        {linhaSelecionada && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block' }}>Linha {formatarCodigo(linhaSelecionada.cd_linha)}</strong>
                <small style={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>{linhaSelecionada.tx_linha}</small>
                
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <small style={{ color: '#007bff', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    Operadora: {(linhaSelecionada as any).nm_operadora || 'Não informada'}
                  </small>
                  {/* MUDANÇA: Exibição do prefixo */}
                  <small style={{ color: '#28a745', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    Prefixo: {(linhaSelecionada as any).prefixo || 'N/A'}
                  </small>
                </div>
              </div>
              <button 
                onClick={() => { setLinhaSelecionada(null); setParadas([]); setParadaFocada(null); }} 
                style={{ cursor: 'pointer', border: 'none', background: '#f0f0f0', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                    flex: 1, border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', 
                    backgroundColor: sentidoSelecionado === s ? 'white' : 'transparent', 
                    boxShadow: sentidoSelecionado === s ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    fontWeight: sentidoSelecionado === s ? 'bold' : 'normal', 
                    fontSize: '0.75rem', transition: '0.2s all'
                  }}
                >{s}</button>
              ))}
            </div>
            
            <div style={{ overflowY: 'auto', maxHeight: '40vh', paddingRight: '5px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Itinerário - {sentidoSelecionado}
              </p>
              {paradas.length > 0 ? paradas.map((p) => (
                <div 
                  key={`parada-${p.id_parada}`} 
                  onMouseEnter={() => setParadaFocada(p.id_parada)} 
                  onMouseLeave={() => setParadaFocada(null)} 
                  style={{ 
                    padding: '10px 0', 
                    borderLeft: `4px solid ${paradaFocada === p.id_parada ? '#d32f2f' : '#007bff'}`, 
                    paddingLeft: '15px', fontSize: '0.85rem', cursor: 'pointer', 
                    backgroundColor: paradaFocada === p.id_parada ? '#fff5f5' : 'transparent',
                    marginBottom: '4px', borderRadius: '0 4px 4px 0', transition: '0.2s all'
                  }}
                >
                  <span style={{ 
                    fontWeight: 'bold', 
                    marginRight: '8px', 
                    color: paradaFocada === p.id_parada ? '#d32f2f' : '#007bff' 
                  }}>
                    {p.nr_sequencia}.
                  </span>
                  {p.nm_parada}
                </div>
              )) : (
                <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', padding: '20px' }}>
                  Buscando pontos de parada...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};