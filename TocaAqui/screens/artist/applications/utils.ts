import { BandApplication } from "@/http/bandApplicationService";
import { ApplicationTab } from "./types";

export function filterApplicationsByTab(
  applications: BandApplication[],
  tab: ApplicationTab
): BandApplication[] {
  switch (tab) {
    case "Em análise":
      return applications.filter((a) => a.status === "pendente");
    case "Aceitas":
      return applications.filter((a) => a.status === "aceito");
    case "Recusadas":
      return applications.filter((a) => a.status === "recusado");
    default:
      return [];
  }
}

export function formatApplicationDate(dateStr?: string): string {
  if (!dateStr) return "Data não informada";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatProposedValue(value?: number): string | null {
  if (value == null) return null;
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}
