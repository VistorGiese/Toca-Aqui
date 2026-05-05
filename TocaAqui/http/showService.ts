import api from "./api";

export interface Show {
  id: number;
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  horario_inicio: string;
  horario_fim: string;
  genero_musical?: string;
  imagem_capa?: string;
  preco_ingresso_inteira?: number;
  preco_ingresso_meia?: number;
  capacidade_maxima?: number;
  ingressos_vendidos?: number;
  classificacao_etaria?: string;
  esta_publico: boolean;
  EstablishmentProfile?: {
    id: number;
    nome_estabelecimento: string;
    tipo_estabelecimento: string;
    telefone_contato?: string;
    Address?: { cidade: string; estado: string; rua: string; numero: string; bairro: string };
  };
  Contract?: {
    Band?: { id: number; nome_banda: string; generos_musicais?: string[] };
  };
}

export interface ShowsResponse {
  shows: Show[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShowsParams {
  cidade?: string;
  genero?: string;
  esta_semana?: boolean;
  fim_de_semana?: boolean;
  esta_hoje?: boolean;
  page?: number;
  limit?: number;
}

export const showService = {
  async getPublicShows(params?: ShowsParams): Promise<ShowsResponse> {
    const response = await api.get<ShowsResponse>("/shows", { params });
    return response.data;
  },

  async getShowsDestaque(limit = 5): Promise<Show[]> {
    const response = await api.get<{ shows: Show[] }>("/shows/destaque", { params: { limit } });
    return response.data.shows;
  },

  async searchShows(query: string, tipo?: "shows" | "artistas" | "locais"): Promise<any> {
    const response = await api.get("/shows/buscar", { params: { q: query, tipo } });
    return response.data;
  },

  async getShowById(id: number): Promise<Show> {
    const response = await api.get<{ show: Show }>(`/shows/${id}`);
    return response.data.show;
  },
};
