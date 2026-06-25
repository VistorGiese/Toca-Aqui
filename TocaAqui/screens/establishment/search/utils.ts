import { ArtistPublicProfile } from "@/http/establishmentService";
import { normalizeArtistProfileSnapshot } from "@/utils/artistProfile";

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getArtistSearchName(artist: ArtistPublicProfile): string {
  return artist.nome_artistico ?? artist.nome ?? "";
}

export function normalizeSearchArtists(raw: unknown[]): ArtistPublicProfile[] {
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => normalizeArtistProfileSnapshot(item) as ArtistPublicProfile);
}

export function filterArtistsByName(
  artists: ArtistPublicProfile[],
  query: string
): ArtistPublicProfile[] {
  const needle = normalizeSearchText(query);
  if (!needle) return artists;

  return artists.filter((artist) => {
    const name = normalizeSearchText(getArtistSearchName(artist));
    return name.includes(needle);
  });
}

export function formatBRL(value?: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function formatCacheLabel(min?: number, max?: number): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) {
    return `${formatBRL(min)} - ${formatBRL(max)}`;
  }
  return formatBRL(min ?? max);
}

const TIPO_LABELS: Record<string, string> = {
  solo: "Artista solo",
  banda: "Banda",
  dj: "DJ",
  dupla: "Dupla",
};

export function formatArtistType(tipo?: string): string {
  if (!tipo?.trim()) return "Artista";
  const key = tipo.trim().toLowerCase();
  return TIPO_LABELS[key] ?? tipo;
}

export function buildSearchParams(query: string): { q?: string } {
  return { q: query.trim() || undefined };
}
