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
  ingressos_disponiveis?: number | null;
  esgotado?: boolean;
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
  } | null;
  nome_artista?: string | null;
  foto_artista?: string | null;
}

export interface ShowsResponse {
  shows: Show[];
  total: number;
  page: number;
  totalPages: number;
  message?: string;
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

/** Converte payload bruto do backend (DECIMAL como string, includes Sequelize) em Show tipado. */
export function normalizeShow(raw: Record<string, unknown>): Show {
  const profile = raw.EstablishmentProfile as Record<string, unknown> | undefined;
  const contract = raw.Contract as Record<string, unknown> | null | undefined;
  const band = contract?.Band as Record<string, unknown> | undefined;
  const apps = raw.Applications as Array<Record<string, unknown>> | undefined;
  const acceptedApp = apps?.find((a) => a.status === "aceito") ?? apps?.[0];
  const appArtist = acceptedApp?.ArtistProfile as Record<string, unknown> | undefined;
  const appBand = acceptedApp?.Band as Record<string, unknown> | undefined;

  const nomeArtista =
    raw.nome_artista != null
      ? String(raw.nome_artista)
      : appArtist?.nome_artistico != null
        ? String(appArtist.nome_artistico)
        : appBand?.nome_banda != null
          ? String(appBand.nome_banda)
          : band?.nome_banda != null
            ? String(band.nome_banda)
            : undefined;

  const fotoArtista =
    raw.foto_artista != null
      ? String(raw.foto_artista)
      : appArtist?.foto_perfil != null
        ? String(appArtist.foto_perfil)
        : appBand?.imagem != null
          ? String(appBand.imagem)
          : undefined;

  return {
    id: Number(raw.id),
    titulo_evento: String(raw.titulo_evento ?? ""),
    descricao_evento: raw.descricao_evento != null ? String(raw.descricao_evento) : undefined,
    data_show: String(raw.data_show ?? ""),
    horario_inicio: String(raw.horario_inicio ?? ""),
    horario_fim: String(raw.horario_fim ?? ""),
    genero_musical: raw.genero_musical != null ? String(raw.genero_musical) : undefined,
    imagem_capa: raw.imagem_capa != null ? String(raw.imagem_capa) : undefined,
    preco_ingresso_inteira:
      raw.preco_ingresso_inteira != null ? Number(raw.preco_ingresso_inteira) : undefined,
    preco_ingresso_meia:
      raw.preco_ingresso_meia != null ? Number(raw.preco_ingresso_meia) : undefined,
    capacidade_maxima:
      raw.capacidade_maxima != null ? Number(raw.capacidade_maxima) : undefined,
    ingressos_vendidos:
      raw.ingressos_vendidos != null ? Number(raw.ingressos_vendidos) : undefined,
    ingressos_disponiveis:
      raw.ingressos_disponiveis != null ? Number(raw.ingressos_disponiveis) : undefined,
    esgotado: raw.esgotado != null ? Boolean(raw.esgotado) : undefined,
    classificacao_etaria:
      raw.classificacao_etaria != null ? String(raw.classificacao_etaria) : undefined,
    esta_publico: Boolean(raw.esta_publico),
    EstablishmentProfile: profile
      ? {
          id: Number(profile.id),
          nome_estabelecimento: String(profile.nome_estabelecimento ?? ""),
          tipo_estabelecimento: String(profile.tipo_estabelecimento ?? ""),
          telefone_contato:
            profile.telefone_contato != null ? String(profile.telefone_contato) : undefined,
          Address: profile.Address as NonNullable<Show["EstablishmentProfile"]>["Address"],
        }
      : undefined,
    Contract: contract
      ? {
          Band: band
            ? {
                id: Number(band.id),
                nome_banda: String(band.nome_banda ?? ""),
                generos_musicais: band.generos_musicais as string[] | undefined,
              }
            : undefined,
        }
      : null,
    nome_artista: nomeArtista ?? null,
    foto_artista: fotoArtista ?? null,
  };
}

export interface ShowDetailParams {
  nomeEvento: string;
  nomeArtista?: string;
  fotoArtista?: string;
  horarioInicio: string;
  horarioFim?: string;
  dataShow: string;
}

export function showToDetailParams(show: Show): ShowDetailParams {
  return {
    nomeEvento: show.titulo_evento,
    nomeArtista: show.nome_artista ?? show.Contract?.Band?.nome_banda ?? undefined,
    fotoArtista: show.foto_artista ?? undefined,
    horarioInicio: show.horario_inicio,
    horarioFim: show.horario_fim,
    dataShow: show.data_show,
  };
}

/** Extrai array de shows do formato canônico ou legado da API. */
export function extractShowsFromResponse(data: unknown): Show[] {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeShow(item as Record<string, unknown>));
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const list = obj.shows ?? obj.resultados ?? obj.data;
    if (Array.isArray(list)) {
      return list.map((item) => normalizeShow(item as Record<string, unknown>));
    }
  }
  return [];
}

/** Serializa params no formato que o ShowController espera (booleans como string "true"). */
function serializeShowsParams(params?: ShowsParams): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const query: Record<string, string | number> = {};
  if (params.cidade) query.cidade = params.cidade;
  if (params.genero) query.genero = params.genero;
  if (params.esta_semana) query.esta_semana = "true";
  if (params.fim_de_semana) query.fim_de_semana = "true";
  if (params.esta_hoje) query.esta_hoje = "true";
  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;
  return Object.keys(query).length > 0 ? query : undefined;
}

export const showService = {
  async getConfirmedShows(params?: ShowsParams): Promise<ShowsResponse> {
    const response = await api.get("/shows/confirmados", { params: serializeShowsParams(params) });
    const body = response.data as Record<string, unknown>;
    const shows = extractShowsFromResponse(body);
    return {
      shows,
      total: Number(body.total ?? shows.length),
      page: Number(body.page ?? 1),
      totalPages: Number(body.totalPages ?? 1),
      message: body.message != null ? String(body.message) : undefined,
    };
  },

  async getPublicShows(params?: ShowsParams): Promise<ShowsResponse> {
    const response = await api.get("/shows", { params: serializeShowsParams(params) });
    const body = response.data as Record<string, unknown>;
    const shows = extractShowsFromResponse(body);
    return {
      shows,
      total: Number(body.total ?? shows.length),
      page: Number(body.page ?? 1),
      totalPages: Number(body.totalPages ?? 1),
      message: body.message != null ? String(body.message) : undefined,
    };
  },

  async getShowsDestaque(limit = 5): Promise<Show[]> {
    const response = await api.get("/shows/destaque", { params: { limit } });
    return extractShowsFromResponse(response.data);
  },

  async searchShows(query: string, tipo?: "shows" | "artistas" | "locais"): Promise<{
    tipo?: string;
    resultados: Show[];
    shows?: Show[];
  }> {
    const response = await api.get("/shows/buscar", { params: { q: query, tipo } });
    const body = response.data as Record<string, unknown>;
    if (body.tipo === "shows" || !body.tipo) {
      return { ...body, resultados: extractShowsFromResponse(body), tipo: String(body.tipo ?? "shows") };
    }
    return { ...body, resultados: [] };
  },

  async getShowById(id: number): Promise<Show> {
    const response = await api.get(`/shows/${id}`);
    const body = response.data as Record<string, unknown>;
    const raw = (body.show ?? body) as Record<string, unknown>;
    return normalizeShow(raw);
  },
};
