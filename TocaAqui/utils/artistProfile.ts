import type { ArtistaPublico } from "@/http/artistaPublicoService";
import { mergeProfileMetaFields, stripMetaLinks } from "@/utils/artistProfileMeta";

export interface ArtistProfileSnapshot {
  id: number;
  nome_artistico?: string;
  biografia?: string;
  instrumentos?: string[];
  generos?: string[];
  anos_experiencia?: number;
  url_portfolio?: string;
  foto_perfil?: string;
  esta_disponivel?: boolean;
  tipo_atuacao?: string;
  cache_minimo?: number;
  cache_maximo?: number;
  tem_estrutura_som?: boolean;
  estrutura_som?: string[];
  cidade?: string;
  estado?: string;
  links_sociais?: string[];
  press_kit?: string[];
  shows_realizados?: number;
  nota_media?: number;
}

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function toOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeArtistProfileSnapshot(raw: Record<string, unknown>): ArtistProfileSnapshot {
  const allLinks = parseJsonArray(raw.links_sociais);
  const metaFields = mergeProfileMetaFields(raw, allLinks);

  return {
    id: Number(raw.id),
    nome_artistico:
      (raw.nome_artistico as string | undefined) ??
      (raw.nome as string | undefined),
    biografia: raw.biografia as string | undefined,
    instrumentos: metaFields.instrumentos,
    generos: parseJsonArray(raw.generos),
    anos_experiencia: toOptionalNumber(raw.anos_experiencia),
    url_portfolio: raw.url_portfolio as string | undefined,
    foto_perfil:
      (raw.foto_perfil as string | undefined) ??
      (raw.foto_url as string | undefined) ??
      (raw.foto_artista as string | undefined),
    esta_disponivel:
      metaFields.esta_disponivel ??
      (typeof raw.esta_disponivel === "boolean" ? raw.esta_disponivel : undefined),
    tipo_atuacao: metaFields.tipo_atuacao,
    cache_minimo: toOptionalNumber(raw.cache_minimo),
    cache_maximo: toOptionalNumber(raw.cache_maximo ?? raw.cache_medio),
    tem_estrutura_som: metaFields.tem_estrutura_som,
    estrutura_som: metaFields.estrutura_som,
    cidade: metaFields.cidade,
    estado: metaFields.estado,
    links_sociais: stripMetaLinks(allLinks),
    press_kit: parseJsonArray(raw.press_kit),
    shows_realizados: toOptionalNumber(raw.shows_realizados),
    nota_media: toOptionalNumber(raw.nota_media),
  };
}

export function mergeArtistSnapshots(
  base: ArtistProfileSnapshot,
  extra?: Partial<ArtistProfileSnapshot>
): ArtistProfileSnapshot {
  if (!extra) return base;
  const merged = { ...base, ...extra, id: base.id };
  for (const key of Object.keys(extra) as (keyof ArtistProfileSnapshot)[]) {
    const value = extra[key];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}

export function formatRating(value: unknown): string {
  const n = toOptionalNumber(value);
  return n != null ? `${n.toFixed(1)} ★` : "— ★";
}

export function formatCacheRange(min?: number, max?: number): string {
  if (min != null && max != null && max !== min) {
    return `R$ ${min.toLocaleString("pt-BR")} – R$ ${max.toLocaleString("pt-BR")}`;
  }
  if (min != null) return `R$ ${min.toLocaleString("pt-BR")}`;
  if (max != null) return `R$ ${max.toLocaleString("pt-BR")}`;
  return "A negociar";
}

export const TIPO_ATUACAO_LABEL: Record<string, string> = {
  solo: "ARTISTA SOLO",
  banda: "BANDA",
  duo: "DUO",
  trio: "TRIO",
};

export function snapshotToArtistaPublico(snapshot: ArtistProfileSnapshot): ArtistaPublico {
  return {
    id: snapshot.id,
    nome_artistico: snapshot.nome_artistico ?? "Artista",
    biografia: snapshot.biografia,
    foto_perfil: snapshot.foto_perfil,
    press_kit: snapshot.press_kit,
    generos: snapshot.generos,
    instrumentos: snapshot.instrumentos,
    total_seguidores: 0,
    media_nota: snapshot.nota_media,
    seguindo: false,
    cidade: snapshot.cidade,
    estado: snapshot.estado,
    ProximosShows: [],
  };
}
