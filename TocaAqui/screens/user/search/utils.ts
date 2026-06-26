import { Show } from "@/http/showService";
import { getShowArtistName, isShowFree } from "@/screens/user/feed/showHelpers";
import { SearchFilterTab } from "./types";

function parseEventDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const raw = dateStr.trim();
  if (!raw) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

function isThisWeek(dateStr: string | null | undefined): boolean {
  const date = parseEventDate(dateStr);
  if (!date) return false;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

function isWeekend(dateStr: string | null | undefined): boolean {
  const date = parseEventDate(dateStr);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function formatShowListDate(dateStr: string): string {
  const date = parseEventDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatShowTime(timeStr: string): string {
  return timeStr?.slice(0, 5) ?? "";
}

export function getShowVenueLabel(show: Show): string {
  return show.EstablishmentProfile?.nome_estabelecimento ?? "Local não informado";
}

export function filterShows(
  shows: Show[],
  searchText: string,
  activeTab: SearchFilterTab
): Show[] {
  const query = searchText.trim().toLowerCase();

  return shows.filter((show) => {
    const artistName = getShowArtistName(show);
    const venue = show.EstablishmentProfile?.nome_estabelecimento;
    const city = show.EstablishmentProfile?.Address?.cidade;

    const matchesSearch =
      !query ||
      [
        show.titulo_evento,
        show.genero_musical,
        show.descricao_evento,
        artistName,
        venue,
        city,
      ].some((value) => value?.toLowerCase().includes(query));

    const matchesTab =
      activeTab === "TODOS"
        ? true
        : activeTab === "ESTA SEMANA"
          ? isThisWeek(show.data_show)
          : activeTab === "FIM DE SEMANA"
            ? isWeekend(show.data_show)
            : isShowFree(show);

    return matchesSearch && matchesTab;
  });
}
