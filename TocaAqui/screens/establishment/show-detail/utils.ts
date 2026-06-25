import { parseDateOnly } from "@/utils/datetime";
import { STATUS_MAP } from "./constants";
import { ContractDetail, ShowDetailDisplay } from "./types";

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const error = err as { response?: { data?: { message?: string; error?: string } } };
  return error?.response?.data?.message ?? error?.response?.data?.error ?? fallback;
}

export function formatShowDateLong(dateString?: string): string {
  if (!dateString?.trim()) return "Data não informada";
  try {
    return parseDateOnly(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatCurrency(value?: number | string): string {
  return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function buildRefNumber(contractId: number): string {
  return `TA-${String(contractId).padStart(4, "0")}`;
}

export function getArtistName(contract: ContractDetail): string {
  return contract.nome_artista ?? contract.nome_contratado ?? "Artista";
}

export function buildShowDetailDisplay(
  contract: ContractDetail,
  contractId: number,
  showIsPublic: boolean
): ShowDetailDisplay {
  const statusKey = contract.status ?? "";
  const status = STATUS_MAP[statusKey] ?? {
    label: statusKey.toUpperCase() || "—",
    color: "#555577",
  };

  const isConcluido = statusKey === "concluido" || statusKey === "realizado";
  const isCancelled = statusKey === "cancelado" || statusKey === "recusado";
  const isActive = statusKey === "aceito" || statusKey === "aguardando_aceite";
  const contractedName =
    contract.nome_contratado ??
    contract.nome_artista ??
    (contract.artista_id ? `Artista #${contract.artista_id}` : undefined);

  const eventoId = contract.evento_id != null ? Number(contract.evento_id) : undefined;

  return {
    contractId,
    refNumber: buildRefNumber(contractId),
    statusLabel: status.label,
    statusColor: status.color,
    eventName: contract.nome_evento ?? `Show #${contractId}`,
    formattedDate: formatShowDateLong(contract.data_evento),
    cacheLabel: formatCurrency(contract.cache_total),
    horarioInicio: contract.horario_inicio,
    horarioFim: contract.horario_fim,
    contractedName,
    contratanteName: contract.nome_contratante,
    localEvento: contract.local_evento,
    sinalLabel:
      contract.valor_sinal != null
        ? `SINAL (${contract.percentual_sinal ?? 50}%)`
        : undefined,
    sinalValue:
      contract.valor_sinal != null ? formatCurrency(contract.valor_sinal) : undefined,
    showIsPublic,
    isConcluido,
    isCancelled,
    isActive,
    canComplete: statusKey === "aceito",
    canRate: isConcluido,
    showSchedule: Boolean(contract.horario_inicio || contract.horario_fim),
    showContracted: Boolean(contractedName || contract.artista_id),
    showContratante: Boolean(contract.nome_contratante),
    showLocal: Boolean(contract.local_evento),
    showSinal: contract.valor_sinal != null,
    showCancellationClause: isActive,
    showCancelAction: isActive,
    eventoId,
  };
}
