/**
 * Configurações geográficas padrão (Brasília/DF)
 */
export const MAP_CONFIG = {
  INITIAL_CENTER: [-15.7942, -47.8822] as [number, number],
  INITIAL_ZOOM: 11,
  MIN_ZOOM: 10,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

/**
 * Constantes de interface e UX
 */
export const UI_STRINGS = {
  LOADING_MESSAGE: 'Carregando dados do transporte...',
  ERROR_MESSAGE: 'Ocorreu um erro ao processar sua solicitação.',
  NO_LINES_FOUND: 'Nenhuma linha encontrada.',
  SELECT_LINE_PROMPT: 'Selecione uma linha para visualizar o itinerário.'
};

/**
 * Cores e Estilos para o Leaflet (PostGIS Geometries)
 */
export const MAP_STYLES = {
  LINE_WEIGHT: 4,
  LINE_COLOR: '#2563eb', // Azul moderno
  LINE_OPACITY: 0.8,
};