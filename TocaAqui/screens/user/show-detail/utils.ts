import { Show } from "@/http/showService";
import { MONTH_NAMES } from "./constants";

export function formatShowDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} de ${month}, ${year}`;
}

export function formatTime(timeString: string): string {
  return timeString.substring(0, 5);
}

export function buildAddress(show: Show): string {
  const addr = show.EstablishmentProfile?.Address;
  if (!addr) return "";
  const parts = [
    addr.rua,
    addr.numero,
    addr.bairro,
    addr.cidade,
    addr.estado,
  ].filter(Boolean);
  return parts.join(", ");
}
