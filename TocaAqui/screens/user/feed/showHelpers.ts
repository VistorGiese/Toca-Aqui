import { Show } from "@/http/showService";
import { colors, genreColorWithAlpha } from "@/utils/colors";
import {
  formatBRL,
  getTicketBaseUnitPrice,
  getTicketDisplayPriceWithFee,
} from "@/utils/ticketPricing";

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function formatShowDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} de ${month}, ${year}`;
}

export function getShowTitle(show: Show): string {
  return show.titulo_evento;
}

export function getShowVenue(show: Show): string {
  return show.EstablishmentProfile?.nome_estabelecimento || "";
}

export function getShowPrice(show: Show): number {
  return getTicketDisplayPriceWithFee(show.preco_ingresso_inteira, show.capacidade_maxima);
}

export function getShowArtistName(show: Show): string | null {
  return show.nome_artista ?? show.Contract?.Band?.nome_banda ?? null;
}

export function isShowFree(show: Show): boolean {
  return getTicketBaseUnitPrice(show.preco_ingresso_inteira, show.capacidade_maxima) === 0;
}

export function getShowPriceLabel(show: Show): string {
  return isShowFree(show) ? "Gratuito" : formatBRL(getShowPrice(show));
}

export function getShowCtaLabel(show: Show): string {
  return isShowFree(show) ? "CONFIRMAR PRESENÇA" : "COMPRAR INGRESSO";
}

export function getShowCardColor(show: Show, alpha = "55"): string {
  if (!show.genero_musical) return colors.cardFallback;
  return genreColorWithAlpha(show.genero_musical, alpha);
}
