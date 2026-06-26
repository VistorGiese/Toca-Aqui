import { Contract } from "@/http/contractService";
import { DateBadge } from "./types";

export function formatDateBadge(date: string): DateBadge {
  try {
    const dt = new Date(date);
    return {
      dia: String(dt.getDate()).padStart(2, "0"),
      mes: dt.toLocaleString("pt-BR", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { dia: "--", mes: "---" };
  }
}

export function getFirstName(fullName?: string | null): string {
  if (!fullName) return "Artista";
  return fullName.split(" ")[0];
}

export function getContractBadge(status: Contract["status"]): {
  label: string;
  backgroundColor: string;
  color: string;
} {
  if (status === "aceito") {
    return { label: "CONFIRMADO", backgroundColor: "#10B98133", color: "#10B981" };
  }
  if (status === "aguardando_aceite") {
    return { label: "NEGOCIANDO", backgroundColor: "#F59E0B33", color: "#F59E0B" };
  }
  return { label: "ENVIADO", backgroundColor: "#6C5CE733", color: "#6C5CE7" };
}

export function formatContractDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatContractCache(cache?: number | null): string | null {
  if (cache == null || cache <= 0) return null;
  return `R$ ${Number(cache).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
