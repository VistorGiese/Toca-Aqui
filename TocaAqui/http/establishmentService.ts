import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import {
  ArtistProfileSnapshot,
  mergeArtistSnapshots,
  normalizeArtistProfileSnapshot,
} from "@/utils/artistProfile";

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
  capacidade_maxima?: number;
  genero_musical?: string;
  imagem_capa?: string;
  modo_venda_ingresso?: "antecipada" | "na_porta";
  status: "aberta" | "encerrada" | "rascunho" | "pendente" | "aceito" | "rejeitado" | "cancelado" | "realizado";
  candidaturas_count?: number;
  estabelecimento_id?: number;
  perfil_estabelecimento_id?: number;
}

export interface ConfirmedGig extends Gig {
  nome_artista?: string;
  foto_artista?: string;
}

export const isGigAberta = (status: Gig["status"]) =>
  status === "aberta" || status === "pendente";

export const isGigEncerrada = (status: Gig["status"]) =>
  status === "aceito" || status === "encerrada" || status === "realizado" || status === "cancelado";

/** Mesmo critério da aba Minhas Vagas > Encerradas (artista contratado). */
export const isGigConfirmada = (status: Gig["status"]) => status === "aceito";

export const isGigFutura = (dataShow: string): boolean => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dataShow);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  } catch {
    return false;
  }
};

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
  profileSnapshot?: ArtistProfileSnapshot;
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

  const artistProfileRaw = raw?.ArtistProfile as Record<string, unknown> | undefined;
  const artistaId = raw?.artista_id ?? raw?.artist_id;
  let profileSnapshot: ArtistProfileSnapshot | undefined;
  if (artistaId && artistProfileRaw) {
    profileSnapshot = normalizeArtistProfileSnapshot({
      ...artistProfileRaw,
      id: artistProfileRaw.id ?? artistaId,
    });
  } else if (artistaId) {
    profileSnapshot = normalizeArtistProfileSnapshot({
      id: artistaId,
      nome_artistico: raw?.nome_artista ?? raw?.nome_artistico,
      foto_perfil: raw?.foto_artista,
      generos: raw?.genero ? [raw.genero] : undefined,
      nota_media: raw?.nota_media,
      shows_realizados: raw?.shows_realizados,
    });
  }

  return {
    id: applicationId,
    evento_id: normalizedEventoId,
    artista_id: artistaId,
    banda_id: raw?.banda_id ?? raw?.band_id,
    mensagem: raw?.mensagem ?? raw?.message,
    status: (normalizedStatus ?? "pendente") as Candidatura["status"],
    nome_artista:
      raw?.nome_artista ??
      raw?.nome_artistico ??
      raw?.ArtistProfile?.nome_artistico ??
      raw?.Band?.nome_banda,
    foto_artista:
      raw?.foto_artista ??
      raw?.ArtistProfile?.foto_perfil ??
      raw?.Band?.imagem,
    genero:
      raw?.genero ??
      (Array.isArray(raw?.ArtistProfile?.generos) ? raw.ArtistProfile.generos[0] : undefined) ??
      generosBanda[0],
    nota_media: raw?.nota_media ?? profileSnapshot?.nota_media,
    shows_realizados: raw?.shows_realizados ?? profileSnapshot?.shows_realizados,
    favorited: raw?.favorited,
    valor_proposto: raw?.valor_proposto,
    profileSnapshot,
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
  cnpj?: string;
  foto_url?: string;
  nota_media?: number;
  cidade?: string;
  estado?: string;
  capacidade?: number;
}

export type ArtistPublicProfile = ArtistProfileSnapshot & {
  nome?: string;
  foto_url?: string;
  tipo?: string;
  cache_medio?: number;
};

export interface EstablishmentPublicProfile {
  id: number;
  nome_estabelecimento: string;
  tipo_estabelecimento?: string;
  generos_musicais?: string;
  foto_url?: string;
  nota_media?: number;
  descricao?: string;
  horario_abertura?: string;
  horario_fechamento?: string;
  telefone_contato?: string;
  capacidade?: number;
  fotos?: string | string[];
  cidade?: string;
  estado?: string;
  Address?: {
    id?: number;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
}

export type { ArtistProfileSnapshot };

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
  cache_minimo?: number;
  preco_ingresso_inteira?: number;
  capacidade_maxima?: number;
  genero_musical?: string;
  modo_venda_ingresso?: "antecipada" | "na_porta";
  cache_maximo?: number;
  generos_musicais?: string;
  descricao_evento?: string;
  perfil_estabelecimento_id?: number;
  esta_publico?: boolean;
}): Promise<Gig> => {
  const perfil_estabelecimento_id = data.perfil_estabelecimento_id ?? (await resolveEstablishmentProfileId());
  const genero_musical = data.genero_musical ?? data.generos_musicais;
  const r = await api.post<Gig>("/agendamentos", {
    ...data,
    perfil_estabelecimento_id,
    genero_musical,
    esta_publico: data.esta_publico ?? false,
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

const uploadGigCover = async (id: number, uri: string): Promise<{ imagem_capa: string }> => {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
  const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  const formData = new FormData();
  formData.append("imagem", { uri, name: `gig-cover.${ext}`, type: mime } as any);
  const r = await api.patch<{ imagem_capa: string }>(`/agendamentos/${id}/capa`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
  return r.data?.data ?? r.data;
};

/** Busca contrato do evento após aceite (fallback se resposta não trouxer contrato). */
const getContractByEventId = async (eventoId: number): Promise<any | null> => {
  try {
    const r = await api.get(`/contratos/evento/${eventoId}`);
    return r.data?.data ?? r.data ?? null;
  } catch {
    return null;
  }
};

const rejectApplication = async (applicationId: number): Promise<any> => {
  const r = await api.put(`/eventos/${applicationId}/recusar`);
  return r.data;
};

const searchArtists = async (params?: { q?: string; genero?: string }): Promise<ArtistPublicProfile[]> => {
  const r = await api.get("/artistas/busca", { params });
  return toArray<ArtistPublicProfile>(r.data);
};

const searchEstablishments = async (params?: {
  limit?: number;
  nome?: string;
  tipo?: string;
  cidade?: string;
  genero?: string;
}): Promise<EstablishmentPublicProfile[]> => {
  const r = await api.get("/estabelecimentos", { params });
  return toArray<EstablishmentPublicProfile>(r.data);
};

function normalizeEstablishmentProfile(raw: Record<string, unknown>): EstablishmentPublicProfile {
  const address = raw.Address as EstablishmentPublicProfile["Address"] | undefined;
  return {
    id: Number(raw.id),
    nome_estabelecimento: String(raw.nome_estabelecimento ?? ""),
    tipo_estabelecimento:
      raw.tipo_estabelecimento != null ? String(raw.tipo_estabelecimento) : undefined,
    generos_musicais:
      raw.generos_musicais != null ? String(raw.generos_musicais) : undefined,
    foto_url: raw.foto_url != null ? String(raw.foto_url) : undefined,
    nota_media: raw.nota_media != null ? Number(raw.nota_media) : undefined,
    descricao: raw.descricao != null ? String(raw.descricao) : undefined,
    horario_abertura:
      raw.horario_abertura != null ? String(raw.horario_abertura) : undefined,
    horario_fechamento:
      raw.horario_fechamento != null ? String(raw.horario_fechamento) : undefined,
    telefone_contato:
      raw.telefone_contato != null ? String(raw.telefone_contato) : undefined,
    capacidade: raw.capacidade != null ? Number(raw.capacidade) : undefined,
    fotos: raw.fotos as string | string[] | undefined,
    Address: address,
    cidade: address?.cidade ?? (raw.cidade != null ? String(raw.cidade) : undefined),
    estado: address?.estado ?? (raw.estado != null ? String(raw.estado) : undefined),
  };
}

const getEstablishmentById = async (id: number): Promise<EstablishmentPublicProfile> => {
  const r = await api.get(`/estabelecimentos/${id}`);
  const body = r.data as Record<string, unknown>;
  const raw = (body.data ?? body) as Record<string, unknown>;
  return normalizeEstablishmentProfile(raw);
};

/** Busca registro completo em endpoints que já retornam todos os campos da tabela. */
const fetchFullArtistFromContracts = async (
  artistId: number
): Promise<ArtistProfileSnapshot | null> => {
  try {
    const r = await api.get("/contratos/meus");
    const contracts = toArray<Record<string, unknown>>(r.data);
    for (const contract of contracts) {
      const profile =
        (contract.ArtistProfile as Record<string, unknown> | undefined) ??
        (contract.artistProfile as Record<string, unknown> | undefined);
      const contractArtistId = Number(contract.artista_id ?? profile?.id);
      if (profile && contractArtistId === artistId) {
        return normalizeArtistProfileSnapshot({ ...profile, id: artistId });
      }
    }
  } catch {
    // endpoint pode falhar se usuário não tiver contratos
  }
  return null;
};

const fetchFullArtistFromFavorites = async (
  artistId: number
): Promise<ArtistProfileSnapshot | null> => {
  try {
    const r = await api.get("/favoritos", { params: { tipo: "perfil_artista" } });
    const payload = r.data as Record<string, unknown>;
    const favoritos = toArray<Record<string, unknown>>(payload.favoritos ?? payload);
    for (const fav of favoritos) {
      const item = (fav.item ?? fav) as Record<string, unknown>;
      if (Number(item?.id) === artistId) {
        return normalizeArtistProfileSnapshot(item);
      }
    }
  } catch {
    // ignorar — favoritos são opcionais
  }
  return null;
};

/** GET /shows/buscar?tipo=artistas retorna todos os campos de perfis_artistas (sem alterar backend). */
const fetchFullArtistFromShowSearch = async (
  artistId: number,
  nomeArtistico?: string
): Promise<ArtistProfileSnapshot | null> => {
  const queries = new Set<string>();
  const trimmed = nomeArtistico?.trim();
  if (trimmed) {
    queries.add(trimmed);
    const firstWord = trimmed.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 2) {
      queries.add(firstWord);
    }
  }
  // Backend exige q não vazio — fallback amplo para localizar o id na lista
  if (queries.size === 0) {
    queries.add("a");
  }

  for (const q of queries) {
    try {
      const r = await api.get("/shows/buscar", { params: { q, tipo: "artistas" } });
      const payload = r.data as Record<string, unknown>;
      const resultados = toArray<Record<string, unknown>>(payload.resultados ?? payload);
      const found = resultados.find((item) => Number(item.id) === artistId);
      if (found) {
        return normalizeArtistProfileSnapshot(found);
      }
    } catch {
      // tenta próxima query
    }
  }
  return null;
};

/** Busca artista via GET /artistas/busca + enriquecimento de contratos/favoritos. */
const findArtistById = async (
  artistId: number,
  hint?: Partial<ArtistProfileSnapshot>
): Promise<ArtistProfileSnapshot> => {
  const pick = (list: ArtistPublicProfile[]) =>
    list.find((item) => item.id === artistId);

  let base: ArtistProfileSnapshot | null = null;

  if (hint?.nome_artistico?.trim()) {
    const byName = await searchArtists({ q: hint.nome_artistico.trim() });
    const found = pick(byName);
    if (found) {
      base = normalizeArtistProfileSnapshot(found as Record<string, unknown>);
    }
  }

  if (!base) {
    const list = await searchArtists();
    const found = pick(list);
    if (found) {
      base = normalizeArtistProfileSnapshot(found as Record<string, unknown>);
    }
  }

  if (!base && hint) {
    base = normalizeArtistProfileSnapshot({ id: artistId, ...hint });
  }

  const nomeParaBusca = hint?.nome_artistico ?? base?.nome_artistico;

  const [fromContracts, fromFavorites, fromShowSearch] = await Promise.all([
    fetchFullArtistFromContracts(artistId),
    fetchFullArtistFromFavorites(artistId),
    fetchFullArtistFromShowSearch(artistId, nomeParaBusca),
  ]);

  if (fromContracts) {
    base = base
      ? mergeArtistSnapshots(base, fromContracts)
      : fromContracts;
  }
  if (fromFavorites) {
    base = base
      ? mergeArtistSnapshots(base, fromFavorites)
      : fromFavorites;
  }
  if (fromShowSearch) {
    base = base
      ? mergeArtistSnapshots(base, fromShowSearch)
      : fromShowSearch;
  }

  if (hint) {
    base = base
      ? mergeArtistSnapshots(base, hint)
      : normalizeArtistProfileSnapshot({ id: artistId, ...hint });
  }

  if (!base) {
    throw new Error("Artista não encontrado");
  }

  if (
    (!base.instrumentos?.length || !base.estrutura_som?.length) &&
    base.nome_artistico
  ) {
    const enriched = await fetchFullArtistFromShowSearch(artistId, base.nome_artistico);
    if (enriched) {
      base = mergeArtistSnapshots(base, enriched);
    }
  }

  return base;
};

const getBandById = async (bandaId: number): Promise<BandPublicProfile> => {
  const r = await api.get(`/bandas/${bandaId}`);
  const data = r.data as any;
  return data?.data ?? data;
};

export interface EstablishmentContract {
  id: number;
  evento_id?: number;
  status: string;
  data_show: string | null;
  nome_evento: string;
  nome_artista?: string | null;
  horario_inicio?: string | null;
  cache_acordado?: number | null;
  nome_estabelecimento?: string | null;
}

export function normalizeEstablishmentContract(raw: Record<string, unknown>): EstablishmentContract {
  const event = raw.Event as Record<string, unknown> | undefined;
  const artist = raw.ArtistProfile as Record<string, unknown> | undefined;
  const band = raw.Band as Record<string, unknown> | undefined;
  const establishment = raw.EstablishmentProfile as Record<string, unknown> | undefined;

  return {
    id: Number(raw.id),
    evento_id: raw.evento_id != null ? Number(raw.evento_id) : undefined,
    status: String(raw.status ?? "aguardando_aceite"),
    data_show:
      (raw.data_show as string | undefined) ??
      (raw.data_evento as string | undefined) ??
      (event?.data_show as string | undefined) ??
      null,
    nome_evento:
      (raw.nome_evento as string | undefined) ??
      (event?.titulo_evento as string | undefined) ??
      (raw.local_evento as string | undefined) ??
      `Show #${raw.id}`,
    nome_artista:
      (raw.nome_artista as string | undefined) ??
      (raw.nome_contratado as string | undefined) ??
      (artist?.nome_artistico as string | undefined) ??
      (band?.nome_banda as string | undefined) ??
      null,
    horario_inicio:
      (raw.horario_inicio as string | undefined) ??
      (event?.horario_inicio as string | undefined) ??
      null,
    cache_acordado:
      raw.cache_acordado != null
        ? Number(raw.cache_acordado)
        : raw.cache_total != null
          ? Number(raw.cache_total)
          : null,
    nome_estabelecimento:
      (raw.nome_estabelecimento as string | undefined) ??
      (establishment?.nome_estabelecimento as string | undefined) ??
      null,
  };
}

const getMyContracts = async (): Promise<any[]> => {
  const r = await api.get("/contratos/meus");
  return toArray<any>(r.data);
};

const getMyContractsNormalized = async (): Promise<EstablishmentContract[]> => {
  const raw = await getMyContracts();
  return raw.map((item) => normalizeEstablishmentContract(item as Record<string, unknown>));
};

/** Shows futuros com contrato aceito por ambas as partes (artista confirmado). */
const getUpcomingConfirmedShows = async (limit = 3): Promise<EstablishmentContract[]> => {
  const contracts = await getMyContractsNormalized();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return contracts
    .filter((c) => {
      if (c.status !== "aceito" || !c.data_show) return false;
      const eventDate = new Date(c.data_show);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.data_show!).getTime() - new Date(b.data_show!).getTime()
    )
    .slice(0, limit);
};

async function enrichGigWithAcceptedArtist(gig: Gig): Promise<ConfirmedGig> {
  try {
    const result = await getGigApplications(gig.id);
    const accepted = result.candidaturas.find((c) => c.status === "aceito");
    return {
      ...gig,
      nome_artista: accepted?.nome_artista ?? undefined,
      foto_artista: accepted?.foto_artista ?? undefined,
    };
  } catch {
    return { ...gig };
  }
}

/**
 * Próximos shows confirmados — mesma fonte da aba Minhas Vagas > Encerradas
 * (agendamentos com status "aceito"), filtrados por data futura.
 */
const getUpcomingConfirmedGigs = async (
  estabelecimentoId?: number,
  limit = 3
): Promise<ConfirmedGig[]> => {
  const gigs = await getMyGigs(estabelecimentoId);
  const upcoming = gigs
    .filter((g) => isGigConfirmada(g.status) && isGigFutura(g.data_show))
    .sort((a, b) => new Date(a.data_show).getTime() - new Date(b.data_show).getTime())
    .slice(0, limit);

  return Promise.all(upcoming.map(enrichGigWithAcceptedArtist));
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
  cnpj?: string;
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
  uploadGigCover,
  getGigApplications, acceptApplication, rejectApplication,
  searchArtists, searchEstablishments, getEstablishmentById, findArtistById, getBandById,
  getMyContracts, getMyContractsNormalized, getUpcomingConfirmedShows, getUpcomingConfirmedGigs, getContractById, getContractByEventId,
  getMyEstablishmentProfile, updateMyEstablishmentProfile, createEndereco, createEstablishmentProfile,
  rateArtist, getNotifications, markNotificationsRead,
  listMembers, addMember, removeMember,
};
