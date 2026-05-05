import api from "./api";

export interface Ingresso {
  id: number;
  usuario_id: number;
  agendamento_id: number;
  tipo: "inteira" | "meia_entrada" | "vip";
  preco: number;
  status: "pendente" | "confirmado" | "cancelado" | "utilizado";
  codigo_qr: string;
  createdAt: string;
  Show?: {
    id: number;
    titulo_evento: string;
    data_show: string;
    horario_inicio: string;
    imagem_capa?: string;
    genero_musical?: string;
    EstablishmentProfile?: {
      nome_estabelecimento: string;
      Address?: { cidade: string; estado: string };
    };
  };
}

export interface ComprarIngressoPayload {
  agendamento_id: number;
  tipo: "inteira" | "meia_entrada" | "vip";
  nome_comprador: string;
  cpf: string;
  telefone: string;
}

export const ingressoService = {
  async comprarIngresso(data: ComprarIngressoPayload): Promise<{ ingresso: Ingresso }> {
    const response = await api.post<{ ingresso: Ingresso }>("/ingressos", data);
    return response.data;
  },

  async getMeusIngressos(tipo?: "proximos" | "passados"): Promise<Ingresso[]> {
    const response = await api.get<{ ingressos: Ingresso[] }>("/ingressos/meus", {
      params: tipo ? { tipo } : undefined,
    });
    return response.data.ingressos;
  },

  async getIngressoById(id: number): Promise<Ingresso> {
    const response = await api.get<{ ingresso: Ingresso }>(`/ingressos/${id}`);
    return response.data.ingresso;
  },
};
