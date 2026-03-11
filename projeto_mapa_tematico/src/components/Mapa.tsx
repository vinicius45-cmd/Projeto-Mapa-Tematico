import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importar o tipo Linha
import type { Linha } from '../types/Linha'; 

// 1. ÍCONE PADRÃO (Azul original do Leaflet)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const blueIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// 2. ÍCONE DE DESTAQUE (Vermelho quando passa o mouse)
const highlightedRedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [30, 48], 
    iconAnchor: [15, 48],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterMapa = ({ geometry }: { geometry: any }) => {
  const map = useMap();
  useEffect(() => {
    if (geometry) {
      const layer = L.geoJSON(geometry);
      map.fitBounds(layer.getBounds(), { padding: [50, 50] });
    }
  }, [geometry, map]);
  return null;
};

interface MapaProps {
  linhaSelecionada: Linha | null;
  paradas: any[];
  paradaFocada?: string | number | null; 
}

export const Mapa = ({ linhaSelecionada, paradas, paradaFocada }: MapaProps) => {
  const centroInicial: [number, number] = [-7.1195, -34.845]; 

  return (
    <MapContainer 
      center={centroInicial} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {linhaSelecionada && (
        <>
          {linhaSelecionada.geometry && (
            <>
              <GeoJSON 
                key={`line-${linhaSelecionada.cd_linha}`} 
                data={linhaSelecionada.geometry}
                style={{
                  color: '#000080',
                  weight: 5,
                  opacity: 0.7
                }}
              />
              <RecenterMapa geometry={linhaSelecionada.geometry} />
            </>
          )}

          {paradas && paradas.map((parada) => (
            <Marker 
              key={`parada-${parada.id_parada}`} 
              position={[parada.nr_latitude, parada.nr_longitude]}
              // LÓGICA DE COR: Se estiver focada fica Vermelha, senão fica Azul (Original)
              icon={paradaFocada === parada.id_parada ? highlightedRedIcon : blueIcon}
              zIndexOffset={paradaFocada === parada.id_parada ? 1000 : 0}
            >
              <Popup>
                <strong>{parada.nm_parada}</strong><br/>
                Sequencial: {parada.nr_sequencia}
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  );
};