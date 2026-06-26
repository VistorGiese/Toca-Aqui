import { Booking } from "@/http/bookingService";
import { EstabelecimentoInfo, EventDetailDisplay } from "./types";

export function parseEventGenres(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.toUpperCase());
}

export function statusLabel(status: Booking["status"] | undefined): string {
  if (status === "pendente") return "VAGA ABERTA";
  if (status === "aceito") return "VAGA FECHADA";
  return "EM ANÁLISE";
}

export function formatEventDate(date?: string): string {
  if (!date) return "Data não informada";
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function formatEventDateShort(date?: string): string {
  if (!date) return "Data não informada";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCacheValue(cacheMinimo: unknown): string {
  if (cacheMinimo == null) return "A combinar";
  return `R$ ${Number(cacheMinimo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function buildEventDisplay(
  booking: Booking,
  estabelecimento: EstabelecimentoInfo | null
): EventDetailDisplay {
  const eventGenres = parseEventGenres(booking.genero_musical);
  const mainGenre = eventGenres[0] ?? "SEM GÊNERO";
  const venueName = estabelecimento?.nome_estabelecimento ?? booking.nome_estabelecimento;
  const venueLocation = estabelecimento?.cidade
    ? `${venueName ?? "Estabelecimento"} · ${estabelecimento.cidade}`
    : venueName;

  const offeredCache = formatCacheValue(booking.cache_minimo);

  return {
    eventTitle: booking.titulo_evento || `Vaga #${booking.id}`,
    venueLocation,
    formattedDate: formatEventDate(booking.data_show),
    horario: `${booking.horario_inicio} — ${booking.horario_fim}`,
    offeredCache,
    mainGenre,
    eventGenres,
    statusLabel: statusLabel(booking.status),
    description: booking.descricao_evento,
    venueDescription:
      estabelecimento?.descricao || venueName
        ? `${venueName ?? "Estabelecimento"}${estabelecimento?.descricao ? ` — ${estabelecimento.descricao}` : ""}`
        : "Informações do local serão disponibilizadas pelo estabelecimento.",
  };
}

export function buildApplyParams(booking: Booking) {
  const formattedDate = formatEventDateShort(booking.data_show);
  const timeStr = `${booking.horario_inicio || ""} — ${booking.horario_fim || ""}`;
  const offeredCache = formatCacheValue(booking.cache_minimo);

  return {
    eventId: booking.id,
    eventName: booking.titulo_evento || `Vaga #${booking.id}`,
    date: formattedDate,
    time: timeStr,
    cache: offeredCache,
  };
}
