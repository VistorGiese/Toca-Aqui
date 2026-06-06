import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export interface Gig {
  id: number;
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  horario_inicio: string;
  horario_fim: string;
  // Campos legados mantidos para compatibilidade de payload antigo
  cache_minimo?: number;
  cache_maximo?: number;
  generos_musicais?: string;
  // Campos canônicos persistidos pelo backend
  preco_ingresso_inteira?: number;
  genero_musical?: string;
  status: "aberta" | "encerrada" | "rascunho" | "pendente" | "aceito" | "rejeitado" | "cancelado" | "realizado";
  candidaturas_count?: number;
  estabelecimento_id?: number;
  perfil_estabelecimento_id?: number;
}

export interface Candidatura {
  id: number;
  evento_id: number;
  artista_id?: number;
  banda_id?: number;
  mensagem?: string;
  status: "pendente" | "aceito" | "rejeitado";
  nome_artista?: string;
  foto_artista?: string;
  genero?: string;
  nota_media?: number;
  shows_realizados?: number;
  favorited?: boolean;
  valor_proposto?: number;
}

export interface GigApplicationsResult {
  closed: boolean;
  message?: string;
  candidaturas: Candidatura[];
}

/** ID da candidatura em aplicacoes_banda_evento — nunca evento_id, artista_id ou banda_id. */
function resolveApplicationId(raw: any): number {
  const candidates = [
    raw?.id,
    raw?.aplicacao_id,
    raw?.candidatura_id,
    raw?.application_id,
    raw?.aplicacao?.id,
    raw?.candidatura?.id,
  ];
  for (const value of candidates) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function normalizeCandidatura(raw: any): Candidatura {
  const applicationId = resolveApplicationId(raw);
  const normalizedEventoId = Number(raw?.evento_id ?? raw?.event_id ?? 0);
  const normalizedStatus = raw?.status === "recusado" ? "rejeitado" : raw?.status;
  const generosBanda: string[] = Array.isArray(raw?.Band?.generos_musicais)
    ? raw.Band.generos_musicais
    : [];

  return {
    id: applicationId,
    evento_id: normalizedEventoId,
    artista_id: raw?.artista_id ?? raw?.artist_id,
    banda_id: raw?.banda_id ?? raw?.band_id,
    mensagem: raw?.mensagem ?? raw?.message,
    status: (normalizedStatus ?? "pendente") as Candidatura["status"],
    nome_artista:
      raw?.nome_artista ??
      raw?.nome_artistico ??
      raw?.ArtistProfile?.nome_artistico ??
      raw?.Band?.nome_banda,
    foto_artista: raw?.foto_artista ?? raw?.ArtistProfile?.foto_perfil,
    genero:
      raw?.genero ??
      (Array.isArray(raw?.ArtistProfile?.generos) ? raw.ArtistProfile.generos[0] : undefined) ??
      generosBanda[0],
    nota_media: raw?.nota_media,
    shows_realizados: raw?.shows_realizados,
    favorited: raw?.favorited,
    valor_proposto: raw?.valor_proposto,
  };
}

export interface EstablishmentProfile {
  id: number;
  nome_estabelecimento: string;
  tipo_estabelecimento?: string;
  descricao?: string;
  generos_musicais?: string;
  horario_abertura?: string;
  horario_fechamento?: string;
  telefone_contato?: string;
  foto_url?: string;
  nota_media?: number;
  cidade?: string;
  estado?: string;
  capacidade?: number;
}

export interface ArtistPublicProfile {
  id: number;
  nome_artistico?: string;
  nome?: string;
  foto_url?: string;
  foto_perfil?: string;
  tipo?: string;
  tipo_atuacao?: string;
  generos?: string[];
  nota_media?: number;
  shows_realizados?: number;
  cache_minimo?: number;
  cache_maximo?: number;
  cache_medio?: number;
  biografia?: string;
  cidade?: string;
  estado?: string;
}

export interface BandPublicProfile {
  id: number;
  nome_banda?: string;
  descricao?: string;
  imagem?: string;
  generos_musicais?: string[];
  nota_media?: number;
  shows_realizados?: number;
  cache_minimo?: number;
  cache_maximo?: number;
  cidade?: string;
  estado?: string;
  telefone_contato?: string;
}

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const e = data as Record<string, unknown>;
    for (const key of ["data", "items", "results", "contratos", "notificacoes", "candidaturas", "agendamentos", "artistas", "perfis"]) {
      if (Array.isArray(e[key])) return e[key] as T[];
    }
  }
  return [];
}

const getMyGigs = async (estabelecimentoId?: number): Promise<Gig[]> => {
  const params = estabelecimentoId ? { estabelecimento_id: estabelecimentoId } : undefined;
  const r = await api.get("/agendamentos", { params });
  return toArray<Gig>(r.data);
};

async function resolveEstablishmentProfileId(): Promise<number> {
  const storedId = await AsyncStorage.getItem("estabelecimentoId");
  if (storedId) return Number(storedId);
  const profile = await getMyEstablishmentProfile();
  await AsyncStorage.setItem("estabelecimentoId", String(profile.id));
  return profile.id;
}

const createGig = async (data: {
  titulo_evento: string; data_show: string; horario_inicio: string; horario_fim: string;
  preco_ingresso_inteira?: number;
  genero_musical?: string;
  // Compatibilidade para chamadas antigas
  cache_minimo?: number;
  cache_maximo?: number;
  generos_musicais?: string;
  descricao_evento?: string;
  perfil_estabelecimento_id?: number;
  esta_publico?: boolean;
}): Promise<Gig> => {
  const perfil_estabelecimento_id = data.perfil_estabelecimento_id ?? (await resolveEstablishmentProfileId());
  const preco_ingresso_inteira = data.preco_ingresso_inteira ?? data.cache_minimo;
  const genero_musical = data.genero_musical ?? data.generos_musicais;
  const r = await api.post<Gig>("/agendamentos", {
    ...data,
    perfil_estabelecimento_id,
    preco_ingresso_inteira,
    genero_musical,
    esta_publico: data.esta_publico ?? true,
  });
  return r.data;
};

const getGigById = async (id: number): Promise<Gig> => {
  const r = await api.get<Gig>(`/agendamentos/${id}`);
  return r.data;
};

const updateGig = async (id: number, data: Partial<Gig>): Promise<Gig> => {
  const r = await api.put<Gig>(`/agendamentos/${id}`, data);
  return r.data;
};

const deleteGig = async (id: number): Promise<void> => {
  await api.delete(`/agendamentos/${id}`);
};

const getGigApplications = async (eventoId: number): Promise<GigApplicationsResult> => {
  const r = await api.get(`/eventos/${eventoId}`);
  const data = r.data;

  if (data && typeof data === "object" && !Array.isArray(data) && (data as any).closed) {
    const payload = data as { closed: boolean; message?: string; candidaturas?: unknown[] };
    return {
      closed: true,
      message: payload.message,
      candidaturas: (payload.candidaturas ?? []).map(normalizeCandidatura),
    };
  }

  const list = Array.isArray(data) ? data : toArray<any>(data);
  return { closed: false, candidaturas: list.map(normalizeCandidatura) };
};

const acceptApplication = async (applicationId: number): Promise<any> => {
  const r = await api.put(`/eventos/${applicationId}/aceitar`);
  return r.data;
};

const rejectApplication = async (applicationId: number): Promise<any> => {
  const r = await api.put(`/eventos/${applicationId}/recusar`);
  return r.data;
};

const searchArtists = async (params?: { q?: string; genero?: string }): Promise<ArtistPublicProfile[]> => {
  const r = await api.get("/artistas/busca", { params });
  return toArray<ArtistPublicProfile>(r.data);
};

const getArtistPublicProfile = async (artistId: number): Promise<ArtistPublicProfile> => {
  const r = await api.get(`/artistas/${artistId}/publico`);
  // Backend retorna { message, perfil } — extrair o perfil
  const data = r.data as any;
  return data?.perfil ?? data;
};

const getBandById = async (bandaId: number): Promise<BandPublicProfile> => {
  const r = await api.get(`/bandas/${bandaId}`);
  const data = r.data as any;
  return data?.data ?? data;
};

const getMyContracts = async (): Promise<any[]> => {
  const r = await api.get("/contratos/meus");
  return toArray<any>(r.data);
};

const getContractById = async (id: number): Promise<any> => {
  const r = await api.get(`/contratos/${id}`);
  return r.data;
};

const getMyEstablishmentProfile = async (): Promise<EstablishmentProfile> => {
  const r = await api.get("/usuarios/perfil");
  const data = r.data as any;
  const user = data?.user ?? data;
  const profiles: any[] = user?.establishment_profiles ?? [];
  if (profiles.length === 0) throw new Error("Perfil de estabelecimento não encontrado.");

  const storedId = await AsyncStorage.getItem("estabelecimentoId");
  const p = (storedId ? profiles.find((x: any) => String(x.id) === storedId) : null) ?? profiles[0];
  return { ...p, cidade: p?.Address?.cidade ?? p?.cidade, estado: p?.Address?.estado ?? p?.estado };
};

const createEndereco = async (data: {
  rua: string; numero: string; bairro: string; cidade: string; estado: string; cep: string;
}): Promise<{ id: number }> => {
  const r = await api.post<{ id: number }>("/enderecos", data);
  return r.data;
};

const createEstablishmentProfile = async (data: {
  nome_estabelecimento: string; tipo_estabelecimento?: string; descricao?: string;
  generos_musicais: string; horario_abertura: string; horario_fechamento: string;
  telefone_contato: string;
  endereco: {
    rua: string; numero: string; bairro: string; cidade: string; estado: string; cep: string;
  };
}): Promise<any> => {
  const r = await api.post("/usuarios/perfil-estabelecimento", data);
  return r.data;
};

const updateMyEstablishmentProfile = async (id: number, data: Partial<EstablishmentProfile>): Promise<EstablishmentProfile> => {
  const r = await api.put<EstablishmentProfile>(`/estabelecimentos/${id}`, data);
  return r.data;
};

const rateArtist = async (contratoId: number, data: { nota: number; comentario?: string; tags?: string[] }): Promise<any> => {
  const r = await api.post(`/contratos/${contratoId}/avaliar-artista`, data);
  return r.data;
};

const getNotifications = async (): Promise<any[]> => {
  try {
    const r = await api.get("/notificacoes");
    return toArray<any>(r.data);
  } catch { return []; }
};

const markNotificationsRead = async (): Promise<void> => {
  try { await api.put("/notificacoes/marcar-lidas"); } catch { /* ignore */ }
};

// --- Gerenciadores/Membros do estabelecimento ---

export interface EstablishmentMember {
  id: number;
  nome_completo: string;
  email: string;
  foto_perfil: string | null;
  role: string;
  membro_id?: number;
}

export interface EstablishmentMembersResponse {
  owner: EstablishmentMember | null;
  members: EstablishmentMember[];
}

const listMembers = async (estabelecimentoId: number): Promise<EstablishmentMembersResponse> => {
  const r = await api.get<EstablishmentMembersResponse>(`/estabelecimentos/${estabelecimentoId}/membros`);
  return r.data;
};

const addMember = async (estabelecimentoId: number, email: string): Promise<any> => {
  const r = await api.post(`/estabelecimentos/${estabelecimentoId}/membros`, { email });
  return r.data;
};

const removeMember = async (estabelecimentoId: number, usuarioId: number): Promise<void> => {
  await api.delete(`/estabelecimentos/${estabelecimentoId}/membros/${usuarioId}`);
};

export const establishmentService = {
  getMyGigs, createGig, getGigById, updateGig, deleteGig,
  getGigApplications, acceptApplication, rejectApplication,
  searchArtists, getArtistPublicProfile, getBandById,
  getMyContracts, getContractById,
  getMyEstablishmentProfile, updateMyEstablishmentProfile, createEndereco, createEstablishmentProfile,
  rateArtist, getNotifications, markNotificationsRead,
  listMembers, addMember, removeMember,
};
