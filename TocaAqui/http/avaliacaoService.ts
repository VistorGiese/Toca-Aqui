import api from "./api";

export interface Avaliacao {
  id: number;
  usuario_id: number;
  agendamento_id: number;
  nota_artista: number;
  nota_local: number;
  comentario?: string;
  tags_artista?: string[];
  tags_local?: string[];
  createdAt: string;
  Usuario?: { nome: string };
}

export interface AvaliacoesResponse {
  media_artista: number;
  media_local: number;
  total: number;
  avaliacoes: Avaliacao[];
}

export interface CriarAvaliacaoPayload {
  agendamento_id: number;
  nota_artista: number;
  nota_local: number;
  comentario?: string;
  tags_artista?: string[];
  tags_local?: string[];
}

export const avaliacaoService = {
  async criarAvaliacao(data: CriarAvaliacaoPayload): Promise<Avaliacao> {
    const response = await api.post<{ avaliacao: Avaliacao }>("/avaliacoes", data);
    return response.data.avaliacao;
  },

  async getAvaliacoesByShow(agendamentoId: number): Promise<AvaliacoesResponse> {
    const response = await api.get<AvaliacoesResponse>(`/avaliacoes/show/${agendamentoId}`);
    return response.data;
  },
};
