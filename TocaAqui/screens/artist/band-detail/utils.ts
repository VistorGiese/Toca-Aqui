import { Band } from "@/types";

export function formatBandCreatedDate(band: Band): string {
  const raw = band.data_criacao || (band as Band & { createdAt?: string }).createdAt || band.created_at;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("pt-BR");
}
