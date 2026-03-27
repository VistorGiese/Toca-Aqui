import api from "./api";

export interface BandApplication {
  id: number;
  evento_id: number;
  banda_id?: number;
  artista_id?: number;
  mensagem?: string;
  status: "pendente" | "aceito" | "recusado";
  nome_evento?: string;
  data_show?: string;
  horario_inicio?: string;
  horario_fim?: string;
  cache_minimo?: number;
  cache_maximo?: number;
  nome_estabelecimento?: string;
  cidade?: string;
  created_at?: string;
}

const applyToEvent = async (data: { evento_id: number; artista_id?: number; mensagem: string }): Promise<BandApplication> => {
  const response = await api.post<BandApplication>("/eventos", data);
  return response.data;
};

const getApplicationsByEvent = async (evento_id: number): Promise<BandApplication[]> => {
  const response = await api.get<BandApplication[]>(`/band-applications/${evento_id}`);
  return response.data;
};

export const bandApplicationService = {
  applyToEvent,
  getApplicationsByEvent,
};
