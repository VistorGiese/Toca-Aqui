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
  valor_proposto?: number;
  nome_estabelecimento?: string;
  cidade?: string;
  created_at?: string;
  contrato_id?: number;
}

const applyToEvent = async (data: { evento_id: number; artista_id?: number; mensagem: string; valor_proposto: number }): Promise<BandApplication> => {
  const response = await api.post<BandApplication>("/eventos", data);
  return response.data;
};

const getApplicationsByEvent = async (evento_id: number): Promise<BandApplication[]> => {
  const response = await api.get(`/eventos/${evento_id}`);
  const data = response.data;
  // Backend returns array when event is open, or { closed, candidaturas } when closed
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.candidaturas)) {
    return data.candidaturas;
  }
  return [];
};

const getMyApplications = async (): Promise<BandApplication[]> => {
  const response = await api.get<BandApplication[]>("/eventos/minhas");
  return response.data;
};

const acceptApplication = async (applicationId: number): Promise<BandApplication> => {
  const response = await api.put<BandApplication>(`/eventos/${applicationId}/aceitar`);
  return response.data;
};

const rejectApplication = async (applicationId: number): Promise<BandApplication> => {
  const response = await api.put<BandApplication>(`/eventos/${applicationId}/recusar`);
  return response.data;
};

export const bandApplicationService = {
  applyToEvent,
  getApplicationsByEvent,
  getMyApplications,
  acceptApplication,
  rejectApplication,
};
