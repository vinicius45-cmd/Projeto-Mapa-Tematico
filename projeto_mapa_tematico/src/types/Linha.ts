export interface Parada {
  id_parada: number;
  nm_parada: string;
  nr_latitude: number;
  nr_longitude: number;
  nr_sequencia: number;
  // Adicione outros campos que venham do seu banco se necessário
}

export interface Linha {
  id_linha: number;
  cd_linha: string;      // Ex: "001"
  tx_linha: string;      // Ex: "Circular / Centro"
  tp_sentido?: string;   // Opcional: Ida ou Volta
  geometry?: any;        // GeoJSON vindo do PostGIS
  paradas?: Parada[];    // A lista de paradas vinculadas
}