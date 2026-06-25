import { parseDateOnly } from "@/utils/datetime";

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatShowDateLong(dateString?: string): string {
  if (!dateString?.trim()) return "";
  try {
    const date = parseDateOnly(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  } catch {
    return dateString;
  }
}

export function toggleChipSelection(selected: string[], label: string): string[] {
  return selected.includes(label)
    ? selected.filter((item) => item !== label)
    : [...selected, label];
}
