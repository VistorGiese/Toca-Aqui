import { Gig, isGigAberta, isGigEncerrada } from "@/http/establishmentService";
import { parseDateOnly } from "@/utils/datetime";
import { GigTab } from "./types";

export function formatBRL(value?: number | string): string {
  if (value == null) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export function formatGigDate(date: string): string {
  try {
    return parseDateOnly(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export function formatCacheRange(min?: number, max?: number): string {
  const minLabel = formatBRL(min);
  if (max == null) return minLabel;
  return `${minLabel} - ${formatBRL(max)}`;
}

export function filterGigsByTab(gigs: Gig[], tab: GigTab): Gig[] {
  return gigs.filter((gig) => {
    if (tab === "abertas") return isGigAberta(gig.status);
    if (tab === "encerradas") return isGigEncerrada(gig.status);
    return gig.status === "rascunho";
  });
}
