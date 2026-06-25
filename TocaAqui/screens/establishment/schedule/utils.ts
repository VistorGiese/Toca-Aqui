import { parseDateOnly, toLocalDateKey } from "@/utils/datetime";
import {
  Gig,
  isGigAberta,
  isGigConfirmada,
  isGigFutura,
} from "@/http/establishmentService";
import { MONTH_NAMES, ScheduleFilter } from "./constants";
import { CalendarDay, ScheduleDayGroup } from "./types";

export function toDateKey(date: Date): string {
  return toLocalDateKey(date);
}

export function parseGigDate(dataShow: string): Date {
  return parseDateOnly(dataShow);
}

export function isDateFuture(dataShow: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseGigDate(dataShow) >= today;
}

export function formatGroupLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} de ${monthName}`;
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function buildCalendarDays(
  year: number,
  month: number,
  eventDateKeys: Set<string>
): CalendarDay[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let i = 0; i < startOffset; i++) {
    const date = new Date(year, month, i - startOffset + 1);
    const dateKey = toDateKey(date);
    days.push({ date, inMonth: false, dateKey, hasEvents: eventDateKeys.has(dateKey) });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);
    days.push({ date, inMonth: true, dateKey, hasEvents: eventDateKeys.has(dateKey) });
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const date = new Date(last);
    date.setDate(date.getDate() + 1);
    const dateKey = toDateKey(date);
    days.push({ date, inMonth: false, dateKey, hasEvents: eventDateKeys.has(dateKey) });
  }

  return days;
}

export function chunkCalendarWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function filterGigs(
  gigs: Gig[],
  filter: ScheduleFilter,
  selectedDateKey: string | null
): Gig[] {
  let result = gigs;

  if (selectedDateKey) {
    result = result.filter((gig) => toDateKey(parseGigDate(gig.data_show)) === selectedDateKey);
  }

  switch (filter) {
    case "confirmados":
      result = result.filter((gig) => isGigConfirmada(gig.status));
      break;
    case "abertos":
      result = result.filter((gig) => isGigAberta(gig.status));
      break;
    case "proximos":
      result = result.filter((gig) => isGigFutura(gig.data_show));
      break;
    case "passados":
      result = result.filter((gig) => !isGigFutura(gig.data_show));
      break;
  }

  return [...result].sort((a, b) => {
    const diff = parseGigDate(a.data_show).getTime() - parseGigDate(b.data_show).getTime();
    return filter === "passados" ? -diff : diff;
  });
}

export function groupGigsByDate(gigs: Gig[]): ScheduleDayGroup[] {
  const map = new Map<string, Gig[]>();

  for (const gig of gigs) {
    const key = toDateKey(parseGigDate(gig.data_show));
    const list = map.get(key) ?? [];
    list.push(gig);
    map.set(key, list);
  }

  return Array.from(map.entries()).map(([dateKey, items]) => ({
    dateKey,
    label: formatGroupLabel(dateKey),
    gigs: items.sort(
      (a, b) => (a.horario_inicio ?? "").localeCompare(b.horario_inicio ?? "")
    ),
  }));
}

export function getStatusLabel(status: Gig["status"]): string {
  switch (status) {
    case "aceito":
      return "Confirmado";
    case "aberta":
    case "pendente":
      return "Vaga aberta";
    case "rascunho":
      return "Rascunho";
    case "realizado":
      return "Realizado";
    case "cancelado":
      return "Cancelado";
    case "rejeitado":
      return "Rejeitado";
    case "encerrada":
      return "Encerrada";
    default:
      return status;
  }
}

export function getStatusColor(status: Gig["status"]): string {
  if (isGigConfirmada(status)) return "#00C853";
  if (isGigAberta(status)) return "#00CEC9";
  if (status === "rascunho") return "#F59E0B";
  if (status === "realizado") return "#7B61FF";
  return "#8888AA";
}
