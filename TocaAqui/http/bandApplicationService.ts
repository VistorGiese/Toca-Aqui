import api from "./api";
import { parseDateOnly } from "@/utils/datetime";

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

export interface ConfirmedApplication extends BandApplication {
  nome_artista?: string;
  foto_artista?: string;
}

function parseApplications(data: unknown): BandApplication[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: BandApplication[] }).data;
  }
  return [];
}

function isShowDateFuture(dataShow: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDateOnly(dataShow) >= today;
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
  const response = await api.get("/eventos/minhas");
  return parseApplications(response.data);
};

/** Candidaturas aceitas com data futura — espelha Minhas Vagas > Aceitas. */
const getUpcomingConfirmedApplications = async (
  limit = 3,
  artistInfo?: { nome_artistico?: string; foto_perfil?: string | null }
): Promise<ConfirmedApplication[]> => {
  const applications = await getMyApplications();
  return applications
    .filter((app) => app.status === "aceito" && app.data_show && isShowDateFuture(app.data_show))
    .sort((a, b) => new Date(a.data_show!).getTime() - new Date(b.data_show!).getTime())
    .slice(0, limit)
    .map((app) => ({
      ...app,
      nome_artista: artistInfo?.nome_artistico,
      foto_artista: artistInfo?.foto_perfil ?? undefined,
    }));
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
  getUpcomingConfirmedApplications,
  acceptApplication,
  rejectApplication,
};
