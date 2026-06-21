import { parseJsonArray } from "@/utils/parseJsonArray";

const META_PREFIX = "__toca_meta__:";

export type ArtistProfileMeta = {
  instrumentos: string[];
  estrutura_som: string[];
  tem_estrutura_som: boolean;
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
): { instrumentos: string[]; estrutura_som: string[]; tem_estrutura_som: boolean } {
  const meta = decodeArtistMeta(allLinks);
  const dbInstrumentos = parseJsonArray(raw.instrumentos);
  const dbEstrutura = parseJsonArray(raw.estrutura_som);

  if (meta) {
    return {
      instrumentos: meta.instrumentos.length > 0 ? meta.instrumentos : dbInstrumentos,
      estrutura_som: meta.estrutura_som,
      tem_estrutura_som: meta.tem_estrutura_som,
    };
  }

  return {
    instrumentos: dbInstrumentos,
    estrutura_som: dbEstrutura,
    tem_estrutura_som: Boolean(raw.tem_estrutura_som),
  };
}
