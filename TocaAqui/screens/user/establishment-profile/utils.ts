import { EstablishmentPublicProfile } from "@/http/establishmentService";
import { resolveImageUrl } from "@/utils/adapters";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";
import { DEFAULT_GENRE_LABEL, MONTH_ABBR, TIPO_LABEL } from "./constants";
import { UserEstablishmentProfileDisplay } from "./types";

export function formatShowDate(dataShow: string): string {
  try {
    const date = new Date(dataShow);
    return `${date.getUTCDate()} ${MONTH_ABBR[date.getUTCMonth()]}`;
  } catch {
    return dataShow;
  }
}

export function parsePhotos(raw?: string | string[]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function buildAddress(profile: EstablishmentPublicProfile): string {
  const addr = profile.Address;
  if (!addr) {
    return [profile.cidade, profile.estado].filter(Boolean).join(", ");
  }
  const street = [addr.rua, addr.numero].filter(Boolean).join(", ");
  const district = [addr.bairro, addr.cidade, addr.estado].filter(Boolean).join(" · ");
  return [street, district].filter(Boolean).join(" · ");
}

export function buildDisplayData(
  profile: EstablishmentPublicProfile
): UserEstablishmentProfileDisplay {
  const generos = parseGenres(profile.generos_musicais);
  const genreLabel =
    generos[0] ?? TIPO_LABEL[profile.tipo_estabelecimento ?? ""] ?? DEFAULT_GENRE_LABEL;
  const photosUrls = parsePhotos(profile.fotos)
    .map((path) => resolveImageUrl(path))
    .filter(Boolean) as string[];
  const coverUrl = photosUrls[0] ?? resolveImageUrl(profile.foto_url);

  return {
    genreLabel,
    genreColor: getGenreColor(genreLabel),
    coverUrl,
    photosUrls,
    addressLabel: buildAddress(profile) || "Endereço não informado",
    nome: profile.nome_estabelecimento,
    rating: profile.nota_media ?? 0,
    abertura: profile.horario_abertura?.substring(0, 5) ?? "--:--",
    fechamento: profile.horario_fechamento?.substring(0, 5) ?? "--:--",
    capacidade: profile.capacidade,
    descricao: profile.descricao ?? "",
    generos,
    telefone: profile.telefone_contato ?? "",
  };
}
