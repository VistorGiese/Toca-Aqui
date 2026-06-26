import { Booking } from "@/http/bookingService";
import { BandApplication } from "@/http/bandApplicationService";
import { FilterTab } from "./types";

export function parseEventDate(dateStr: string | null | undefined): Date | null {
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

export function isThisWeek(dateStr: string | null | undefined): boolean {
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

export function isWeekend(dateStr: string | null | undefined): boolean {
  const date = parseEventDate(dateStr);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isFromTodayOrFuture(dateStr: string | null | undefined): boolean {
  const date = parseEventDate(dateStr);
  if (!date) return false;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const eventDay = new Date(date);
  eventDay.setHours(0, 0, 0, 0);

  return eventDay >= todayStart;
}

export function formatBookingDate(dateStr: string): string {
  const date = parseEventDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function filterBookings(
  bookings: Booking[],
  searchText: string,
  activeTab: FilterTab
): Booking[] {
  return bookings.filter((booking) => {
    const matchesSearch =
      !searchText.trim() ||
      booking.titulo_evento?.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab =
      activeTab === "TODOS"
        ? true
        : activeTab === "ESTA SEMANA"
          ? isThisWeek(booking.data_show)
          : isWeekend(booking.data_show);

    return matchesSearch && matchesTab && isFromTodayOrFuture(booking.data_show);
  });
}

export function buildApplicationStatusMap(
  applications: BandApplication[]
): Record<number, BandApplication["status"]> {
  const byEvent: Record<number, BandApplication["status"]> = {};
  applications.forEach((application) => {
    if (application.evento_id) {
      byEvent[application.evento_id] = application.status;
    }
  });
  return byEvent;
}

export function getVenueLabel(booking: Booking): string {
  return (
    booking.nome_estabelecimento ??
    (booking.perfil_estabelecimento_id
      ? `Estabelecimento #${booking.perfil_estabelecimento_id}`
      : "Local a confirmar")
  );
}
