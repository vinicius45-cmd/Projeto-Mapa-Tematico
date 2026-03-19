import type { Linha, Parada } from '../types/Linha';

/**
 * O Vite exige o prefixo VITE_ para expor variáveis ao navegador.
 * Certifique-se de que VITE_API_URL esteja definida no seu arquivo .env
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

console.log("Tentando conectar em:", API_BASE_URL); // Isso vai aparecer no F12 para confirmarmos

export const api = {
  /**
   * Busca todas as linhas de ônibus disponíveis.
   */
  async getLinhas(): Promise<Linha[]> {
    const response = await fetch(`${API_BASE_URL}/linhas`);
    if (!response.ok) throw new Error('Erro ao buscar linhas');
    return response.json();
  },

  /**
   * Busca detalhes específicos de uma linha pelo ID.
   */
  async getDetalhesLinha(id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/linhas/${id}/detalhes`);
    if (!response.ok) throw new Error('Erro ao buscar detalhes');
    return response.json();
  },

  /**
   * Busca as paradas de uma linha específica baseada no código e sentido.
   * Centraliza a formatação dos dados para o padrão da interface 'Parada'.
   */
  async getParadas(codigo: string, sentido: string, signal?: AbortSignal): Promise<Parada[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/paradas/busca?codigo=${codigo}&sentido=${sentido}`, 
        { signal }
      );
      
      if (!response.ok) return [];
      
      const dados = await response.json();
      
      // Mapeia os dados do backend (que usa latitude/id) para o padrão do frontend (nr_latitude/id_parada)
      return dados.map((p: any, index: number) => ({
        id_parada: Number(p.id),
        nr_sequencia: index + 1,
        nr_latitude: p.latitude,
        nr_longitude: p.longitude,
        nm_parada: p.nm_parada || `Parada ${index + 1}`
      }));
    } catch (error: any) {
      if (error.name === 'AbortError') return []; // Ignora erros de cancelamento de requisição
      console.error("Erro ao buscar paradas:", error);
      return [];
    }
  }
};