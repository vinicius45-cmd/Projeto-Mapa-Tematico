import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importando os ícones agora que os nomes estão corrigidos em src/assets/icons
import { stopIcon, stopFocusIcon } from '../configs/mapIcons';

const ControladorDeCamera = ({ linha, paradaFocada, paradas }: any) => {
  const map = useMap();
  const linhaAnteriorRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Focar na parada selecionada e aproximar o zoom
    if (paradaFocada) {
      const alvo = paradas.find((p: any) => String(p.id_parada) === String(paradaFocada));
      const lat = Number(alvo?.nr_latitude);
      const lng = Number(alvo?.nr_longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 16, { animate: true });
        return; 
      }
    }

    // 2. Ajustar zoom para a linha inteira quando ela for carregada/alterada
    const idLinhaAtual = linha?.cd_linha ? String(linha.cd_linha) : null;
    if (linha?.geometry && idLinhaAtual !== linhaAnteriorRef.current) {
      try {
        const layer = L.geoJSON(linha.geometry);
        map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        linhaAnteriorRef.current = idLinhaAtual;
      } catch (e) {
        console.error("Erro ao enquadrar linha:", e);
      }
    }
  }, [paradaFocada, linha, paradas, map]);

  return null;
};

export const Mapa = ({ linhaSelecionada, paradas, paradaFocada }: any) => {
  const centroBrasilia: [number, number] = [-15.7942, -47.8822];

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={centroBrasilia} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Desenho do itinerário da linha */}
        {linhaSelecionada?.geometry && (
          <GeoJSON 
            key={`geo-${linhaSelecionada.cd_linha}`}
            data={linhaSelecionada.geometry}
            style={{ color: '#000080', weight: 5, opacity: 0.7 }}
          />
        )}

        <ControladorDeCamera 
          linha={linhaSelecionada} 
          paradaFocada={paradaFocada} 
          paradas={paradas} 
        />

        {/* Mapeamento das paradas de ônibus */}
        {paradas?.map((parada: any) => {
          const estaFocada = String(paradaFocada) === String(parada.id_parada);
          const lat = Number(parada.nr_latitude);
          const lng = Number(parada.nr_longitude);

          if (isNaN(lat) || isNaN(lng) || lat === 0) return null;

          return (
            <Marker 
              // A key dinâmica com 'estaFocada' força o Leaflet a renderizar o ícone correto na troca
              key={`marker-${parada.id_parada}-${estaFocada}`}
              position={[lat, lng]}
              icon={estaFocada ? stopFocusIcon : stopIcon}
              // ZIndex maior para o ícone vermelho não ser coberto pelos azuis
              zIndexOffset={estaFocada ? 1000 : 0}
            >
              <Popup autoPan={false}>
                <strong>{parada.nm_parada}</strong>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};