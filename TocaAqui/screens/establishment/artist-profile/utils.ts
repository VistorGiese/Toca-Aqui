import { BandPublicProfile } from "@/http/establishmentService";
import { parsePressKit, resolveImageUrl } from "@/utils/adapters";
import {
  ArtistProfileSnapshot,
  formatCacheRange,
  TIPO_ATUACAO_LABEL,
} from "@/utils/artistProfile";
import { DEFAULT_ARTIST_NAME, DEFAULT_BAND_NAME } from "./constants";
import { BandView, EstArtistProfileArtistDisplay, EstArtistProfileHeroDisplay } from "./types";

function resolveProfilePhotoUrl(
  profile: ArtistProfileSnapshot,
  pressKitUrls: string[]
): string | null {
  const candidates = [
    profile.foto_perfil,
    (profile as { foto_url?: string }).foto_url,
  ];
  for (const candidate of candidates) {
    const url = resolveImageUrl(candidate);
    if (url) return url;
  }
  return pressKitUrls[0] ?? null;
}

export function mapBand(band: BandPublicProfile): BandView {
  const generos = Array.isArray(band.generos_musicais) ? band.generos_musicais : [];
  return {
    id: band.id,
    nome: band.nome_banda ?? DEFAULT_BAND_NAME,
    descricao: band.descricao,
    generos,
    foto: band.imagem,
    esta_ativo: (band as { esta_ativo?: boolean }).esta_ativo,
    data_criacao: (band as { data_criacao?: string }).data_criacao,
  };
}

export function buildArtistDisplay(profile: ArtistProfileSnapshot): EstArtistProfileArtistDisplay {
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
    coverUrl: fotoUrl,
    fallbackIcon: "user",
    pressKitUrls,
    instrumentos: profile.instrumentos ?? [],
    showsCount: profile.shows_realizados ?? 0,
    cacheLabel: formatCacheRange(profile.cache_minimo, profile.cache_maximo),
  };
}

export function buildBandHeroDisplay(band: BandView): EstArtistProfileHeroDisplay {
  const fotoUrl = band.foto ? resolveImageUrl(band.foto) : null;
  return {
    nome: band.nome,
    tipoLabel: "BANDA",
    fotoUrl,
    coverUrl: fotoUrl,
    fallbackIcon: "users",
  };
}
