export interface Linha {
  id_linha: number;
  cd_linha: string | number; // Ex: "101"
  tx_linha: string;          // Ex: "LINHA VERDE - CIRCULAR"
  geometry: any;             // O GeoJSON do itinerário
  id?: number | string;      // Identificador único
  paradas?: any[];           // Lista de paradas (opcional)
}