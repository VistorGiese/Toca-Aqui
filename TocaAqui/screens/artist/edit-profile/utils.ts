import { parseCurrencyBRL } from "@/screens/establishment/new-gig/utils";

export { maskCurrencyBRL, currencyFromNumber } from "@/screens/establishment/new-gig/utils";

export function toggleListItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function parseCacheInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = parseCurrencyBRL(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

export function maskExperienceYears(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 2);
}

export function maskDateIso(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function isValidDateIso(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
