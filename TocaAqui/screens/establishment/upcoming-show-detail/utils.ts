import { MONTH_NAMES } from "./constants";

export function formatShowDateLong(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = MONTH_NAMES[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} de ${month}, ${year}`;
  } catch {
    return dateString || "—";
  }
}

export function formatHorario(inicio: string, fim?: string): string {
  const start = inicio?.substring(0, 5) ?? "—";
  if (!fim) return start;
  return `${start} – ${fim.substring(0, 5)}`;
}
