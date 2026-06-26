import { ArtistaPublico } from "@/http/artistaPublicoService";
import { parsePressKit, resolveImageUrl } from "@/utils/adapters";
import {
  ArtistProfileSnapshot,
  formatCacheRange,
  mergeArtistSnapshots,
  normalizeArtistProfileSnapshot,
  TIPO_ATUACAO_LABEL,
} from "@/utils/artistProfile";
import { DEFAULT_ARTIST_NAME, MONTH_ABBR } from "./constants";
import { UserArtistProfileDisplay } from "./types";

function resolveProfilePhotoUrl(
  profile: ArtistProfileSnapshot,
  pressKitUrls: string[]
): string | null {
  for (const candidate of [profile.foto_perfil, (profile as { foto_url?: string }).foto_url]) {
    const url = resolveImageUrl(candidate);
    if (url) return url;
  }
  return pressKitUrls[0] ?? null;
}

export function buildArtistDisplay(
  profile: ArtistProfileSnapshot,
  rating: number
): UserArtistProfileDisplay {
  const nome = profile.nome_artistico ?? DEFAULT_ARTIST_NAME;
  const tipo =
    TIPO_ATUACAO_LABEL[profile.tipo_atuacao ?? ""] ??
    profile.tipo_atuacao?.toUpperCase() ??
    "ARTISTA";
  const localizacao = [profile.cidade, profile.estado].filter(Boolean).join(" · ");
  const pressKitUrls = parsePressKit(profile.press_kit)
    .map((path) => resolveImageUrl(path))
    .filter(Boolean) as string[];
  const fotoUrl = resolveProfilePhotoUrl(profile, pressKitUrls);

  return {
    nome,
    tipoLabel: tipo,
    localizacao: localizacao || undefined,
    fotoUrl,
    coverUrl: fotoUrl ?? pressKitUrls[0] ?? null,
    pressKitUrls,
    instrumentos: profile.instrumentos ?? [],
    generos: profile.generos ?? [],
    showsCount: profile.shows_realizados ?? 0,
    cacheLabel: formatCacheRange(profile.cache_minimo, profile.cache_maximo),
    rating,
  };
}

export function mergeOwnProfileFields(
  base: ArtistProfileSnapshot,
  own: Record<string, unknown>
): ArtistProfileSnapshot {
  return mergeArtistSnapshots(base, {
    instrumentos: own.instrumentos as string[] | undefined,
    estrutura_som: own.estrutura_som as string[] | undefined,
    tem_estrutura_som: own.tem_estrutura_som as boolean | undefined,
    generos: own.generos as string[] | undefined,
    biografia: own.biografia as string | undefined,
    foto_perfil: own.foto_perfil as string | undefined,
    press_kit: own.press_kit as string[] | undefined,
    cache_minimo: own.cache_minimo as number | undefined,
    cache_maximo: own.cache_maximo as number | undefined,
    cidade: own.cidade as string | undefined,
    estado: own.estado as string | undefined,
    links_sociais: own.links_sociais as string[] | undefined,
    anos_experiencia: own.anos_experiencia as number | undefined,
    tipo_atuacao: own.tipo_atuacao as string | undefined,
    esta_disponivel: own.esta_disponivel as boolean | undefined,
    url_portfolio: own.url_portfolio as string | undefined,
  });
}

export function mergePublicProfile(
  snapshot: ArtistProfileSnapshot,
  publico: ArtistaPublico
): ArtistProfileSnapshot {
  const pressKitFromPublic = parsePressKit(publico.press_kit);
  return mergeArtistSnapshots(snapshot, {
    nome_artistico: publico.nome_artistico || snapshot.nome_artistico,
    biografia: snapshot.biografia || publico.biografia,
    foto_perfil: snapshot.foto_perfil || publico.foto_perfil,
    generos: snapshot.generos?.length ? snapshot.generos : publico.generos,
    instrumentos: snapshot.instrumentos?.length ? snapshot.instrumentos : publico.instrumentos,
    nota_media: snapshot.nota_media ?? publico.media_nota,
    cidade: snapshot.cidade || publico.cidade,
    estado: snapshot.estado || publico.estado,
    press_kit: snapshot.press_kit?.length ? snapshot.press_kit : pressKitFromPublic,
  });
}

export function profileFromHint(
  artistId: number,
  hint?: Partial<ArtistProfileSnapshot>
): ArtistProfileSnapshot {
  return normalizeArtistProfileSnapshot({ id: artistId, ...hint });
}

export function formatShowDate(dataShow: string): string {
  try {
    const date = new Date(dataShow);
    return `${date.getUTCDate()} ${MONTH_ABBR[date.getUTCMonth()]}`;
  } catch {
    return dataShow;
  }
}
