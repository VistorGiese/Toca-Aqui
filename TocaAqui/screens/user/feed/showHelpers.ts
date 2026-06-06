import { Show } from "@/http/showService";
import { colors, genreColorWithAlpha } from "@/utils/colors";

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
  const price = show.preco_ingresso_inteira;
  if (price == null) return 0;
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

export function getShowCardColor(show: Show, alpha = "55"): string {
  if (!show.genero_musical) return colors.cardFallback;
  return genreColorWithAlpha(show.genero_musical, alpha);
}
