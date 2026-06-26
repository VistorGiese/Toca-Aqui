import { Contract } from "@/http/contractService";
import { STATUS_CONFIG } from "./constants";
import { StatusConfig } from "./types";

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.rascunho;
}

export function formatContractValue(contract: Contract): string {
  return `R$ ${Number(contract.cache_total ?? contract.cache_acordado ?? 0).toFixed(2)}`;
}
