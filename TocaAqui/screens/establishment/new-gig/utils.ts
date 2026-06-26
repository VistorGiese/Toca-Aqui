import { ZERO_CURRENCY_DISPLAY } from "./constants";

export function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function maskDigits(raw: string, maxLength = 6): string {
  return raw.replace(/\D/g, "").slice(0, maxLength);
}

export function maskCurrencyBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const amount = Number(digits) / 100;
  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function normalizeCurrencyDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return ZERO_CURRENCY_DISPLAY;
  const masked = maskCurrencyBRL(trimmed);
  return masked || ZERO_CURRENCY_DISPLAY;
}

export function currencyFromNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ZERO_CURRENCY_DISPLAY;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyBRL(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}
