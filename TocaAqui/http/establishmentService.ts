import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export interface Gig {
  id: number;
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  horario_inicio: string;
  horario_fim: string;
  cache_minimo?: number;
  cache_maximo?: number;
  preco_ingresso_inteira?: number; // campo real do backend (equivale ao cache_minimo)
  generos_musicais?: string;
  genero_musical?: string;         // campo real do backend (singular)
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

const createGig = async (data: {
  titulo_evento: string; data_show: string; horario_inicio: string; horario_fim: string;
  cache_minimo?: number; cache_maximo?: number; generos_musicais?: string; descricao_evento?: string;
}): Promise<Gig> => {
  const r = await api.post<Gig>("/agendamentos", data);
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

const getGigApplications = async (eventoId: number): Promise<Candidatura[]> => {
  const r = await api.get(`/eventos/${eventoId}`);
  return toArray<Candidatura>(r.data);
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
  endereco_id: number; telefone_contato: string;
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
  searchArtists, getArtistPublicProfile,
  getMyContracts, getContractById,
  getMyEstablishmentProfile, updateMyEstablishmentProfile, createEndereco, createEstablishmentProfile,
  rateArtist, getNotifications, markNotificationsRead,
  listMembers, addMember, removeMember,
};
