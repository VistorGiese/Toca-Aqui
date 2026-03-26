import api from "./api";

export interface Comentario {
  id: number;
  usuario_id: number;
  agendamento_id: number;
  texto: string;
  curtidas_count: number;
  parent_id?: number;
  eu_curtei?: boolean;
  createdAt: string;
  Usuario?: { nome: string };
  Respostas?: Comentario[];
}

export interface CriarComentarioPayload {
  agendamento_id: number;
  texto: string;
  parent_id?: number;
}

export const comentarioService = {
  async getComentariosByShow(agendamentoId: number): Promise<Comentario[]> {
    const response = await api.get<{ comentarios: Comentario[] }>(
      `/comentarios/show/${agendamentoId}`
    );
    return response.data.comentarios;
  },

  async criarComentario(data: CriarComentarioPayload): Promise<Comentario> {
    const response = await api.post<{ comentario: Comentario }>("/comentarios", data);
    return response.data.comentario;
  },

  async curtirComentario(id: number): Promise<{ curtiu: boolean; curtidas_count: number }> {
    const response = await api.post<{ curtiu: boolean; curtidas_count: number }>(
      `/comentarios/${id}/curtir`
    );
    return response.data;
  },
};
