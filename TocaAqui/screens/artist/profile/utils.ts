import { ArtistProfileData } from "@/http/artistProfileService";
import { parsePressKit, resolveImageUrl } from "@/utils/adapters";
import { DEFAULT_PROFILE_NAME, DEFAULT_TIPO_LABEL, TIPO_ATUACAO_LABEL } from "./constants";
import { ArtistProfileDisplayData, EMPTY_DISPLAY } from "./types";

export function formatCurrency(value?: number): string {
  if (value == null || Number.isNaN(value)) return "A combinar";
  return `R$ ${Number(value).toLocaleString("pt-BR")}`;
}

export function buildDisplayData(
  profile: ArtistProfileData | Record<string, unknown> | null,
  fallbackName?: string
): ArtistProfileDisplayData {
  if (!profile) return { ...EMPTY_DISPLAY, nome: fallbackName ?? DEFAULT_PROFILE_NAME };

  const p = profile as ArtistProfileData & Record<string, unknown>;
  const pressKitUrls = parsePressKit(p.press_kit)
    .map((path) => resolveImageUrl(path))
    .filter((u): u is string => Boolean(u));
  const avatarUrl = resolveImageUrl(p.foto_perfil as string | undefined);
  const coverUrl = pressKitUrls[0] ?? avatarUrl ?? null;

  const tipoRaw = String(p.tipo_atuacao ?? "");
  const cidade = p.cidade ? String(p.cidade) : "";
  const estado = p.estado ? String(p.estado) : "";
  const localizacao = [cidade, estado].filter(Boolean).join(" · ");

  return {
    nome: String(p.nome_artistico ?? fallbackName ?? DEFAULT_PROFILE_NAME),
    tipoLabel:
      TIPO_ATUACAO_LABEL[tipoRaw] ??
      (tipoRaw ? tipoRaw.toUpperCase() : DEFAULT_TIPO_LABEL),
    localizacao,
    disponivel: p.esta_disponivel !== false,
    biografia: p.biografia ? String(p.biografia) : "",
    generos: Array.isArray(p.generos) ? p.generos : [],
    instrumentos: Array.isArray(p.instrumentos) ? p.instrumentos : [],
    temEstruturaSom: Boolean(p.tem_estrutura_som),
    estruturaSom: Array.isArray(p.estrutura_som) ? p.estrutura_som : [],
    cacheMinimo: p.cache_minimo != null ? Number(p.cache_minimo) : undefined,
    cacheMaximo: p.cache_maximo != null ? Number(p.cache_maximo) : undefined,
    anosExperiencia:
      p.anos_experiencia != null && Number(p.anos_experiencia) > 0
        ? Number(p.anos_experiencia)
        : undefined,
    urlPortfolio: p.url_portfolio ? String(p.url_portfolio) : undefined,
    coverUrl,
    pressKitUrls,
  };
}
