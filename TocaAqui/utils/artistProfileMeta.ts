import { parseJsonArray } from "@/utils/parseJsonArray";

const META_PREFIX = "__toca_meta__:";

export type ArtistProfileMeta = {
  instrumentos: string[];
  estrutura_som: string[];
  tem_estrutura_som: boolean;
  tipo_atuacao?: string;
  cidade?: string;
  estado?: string;
  esta_disponivel?: boolean;
};

export function encodeArtistMeta(meta: ArtistProfileMeta): string {
  return `${META_PREFIX}${JSON.stringify(meta)}`;
}

export function decodeArtistMeta(links: string[]): ArtistProfileMeta | null {
  const metaLink = links.find((link) => link.startsWith(META_PREFIX));
  if (!metaLink) return null;
  try {
    const parsed = JSON.parse(metaLink.slice(META_PREFIX.length)) as Partial<ArtistProfileMeta>;
    return {
      instrumentos: parseJsonArray(parsed.instrumentos),
      estrutura_som: parseJsonArray(parsed.estrutura_som),
      tem_estrutura_som: Boolean(parsed.tem_estrutura_som),
      tipo_atuacao:
        typeof parsed.tipo_atuacao === "string" ? parsed.tipo_atuacao : undefined,
      cidade: typeof parsed.cidade === "string" ? parsed.cidade : undefined,
      estado: typeof parsed.estado === "string" ? parsed.estado : undefined,
      esta_disponivel:
        typeof parsed.esta_disponivel === "boolean" ? parsed.esta_disponivel : undefined,
    };
  } catch {
    return null;
  }
}

export function stripMetaLinks(links: string[]): string[] {
  return links.filter((link) => !link.startsWith(META_PREFIX));
}

export function buildLinksWithMeta(publicLinks: string[], meta: ArtistProfileMeta): string[] {
  return [...stripMetaLinks(publicLinks), encodeArtistMeta(meta)];
}

export function mergeProfileMetaFields(
  raw: Record<string, unknown>,
  allLinks: string[]
): {
  instrumentos: string[];
  estrutura_som: string[];
  tem_estrutura_som: boolean;
  tipo_atuacao?: string;
  cidade?: string;
  estado?: string;
  esta_disponivel?: boolean;
} {
  const meta = decodeArtistMeta(allLinks);
  const dbInstrumentos = parseJsonArray(raw.instrumentos);
  const dbEstrutura = parseJsonArray(raw.estrutura_som);
  const dbTipo =
    typeof raw.tipo_atuacao === "string"
      ? raw.tipo_atuacao
      : typeof raw.tipo === "string"
        ? raw.tipo
        : undefined;
  const dbCidade = typeof raw.cidade === "string" ? raw.cidade : undefined;
  const dbEstado = typeof raw.estado === "string" ? raw.estado : undefined;
  const dbDisponivel =
    typeof raw.esta_disponivel === "boolean" ? raw.esta_disponivel : undefined;

  if (meta) {
    return {
      instrumentos: meta.instrumentos.length > 0 ? meta.instrumentos : dbInstrumentos,
      estrutura_som: meta.estrutura_som,
      tem_estrutura_som: meta.tem_estrutura_som,
      tipo_atuacao: meta.tipo_atuacao ?? dbTipo,
      cidade: meta.cidade ?? dbCidade,
      estado: meta.estado ?? dbEstado,
      esta_disponivel: meta.esta_disponivel ?? dbDisponivel,
    };
  }

  return {
    instrumentos: dbInstrumentos,
    estrutura_som: dbEstrutura,
    tem_estrutura_som: Boolean(raw.tem_estrutura_som),
    tipo_atuacao: dbTipo,
    cidade: dbCidade,
    estado: dbEstado,
    esta_disponivel: dbDisponivel,
  };
}
