import L from 'leaflet';

/**
 * Usando caminhos absolutos baseados na raiz do projeto Vite.
 * Certifique-se de que os nomes dos arquivos estão EXATAMENTE assim na pasta.
 */
import blueIconUrl from '/src/assets/icons/blue-stop-marker.png';
import redIconUrl from '/src/assets/icons/red-stop-marker.png';
import shadowIconUrl from '/src/assets/icons/marker-shadow.png';

const baseOptions: L.IconOptions = {
  iconUrl: '', 
  shadowUrl: shadowIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],   
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
};

export const stopIcon = new L.Icon({
  ...baseOptions,
  iconUrl: blueIconUrl,
});

export const stopFocusIcon = new L.Icon({
  ...baseOptions,
  iconUrl: redIconUrl,
});