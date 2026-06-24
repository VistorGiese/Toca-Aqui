import type { ContractTemplateData } from "@/types/contractPdf";

function formatDateBr(value?: string | Date | null): string {
  if (!value) return "—";
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return String(value);
  }
}

function formatMoney(value?: number | string | null): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = raw[key];
    if (val != null && String(val).trim()) return String(val);
  }
  return "";
}

/** Mapeia resposta da API de contrato para dados do template PDF. */
export function mapApiContractToTemplateData(raw: Record<string, unknown>): ContractTemplateData {
  const event = (raw.Event ?? raw.event) as Record<string, unknown> | undefined;
  const tituloEvento =
    pickString(raw, "nome_evento") ||
    pickString(event ?? {}, "titulo_evento") ||
    `Show #${raw.id ?? ""}`;

  const contractId = Number(raw.id ?? 0);

  return {
    nomeContratante: pickString(raw, "nome_contratante") || "Estabelecimento",
    documentoContratante: pickString(raw, "documento_contratante") || "—",
    telefoneContratante: pickString(raw, "telefone_contratante") || "—",
    enderecoContratante: pickString(raw, "endereco_contratante", "local_evento") || "—",
    nomeContratado: pickString(raw, "nome_contratado", "nome_artista") || "Artista",
    documentoContratado: pickString(raw, "documento_contratado") || "—",
    telefoneContratado: pickString(raw, "telefone_contratado") || "—",
    tituloEvento,
    dataEvento: formatDateBr(pickString(raw, "data_evento", "data_show") || undefined),
    horarioInicio: pickString(raw, "horario_inicio") || "—",
    horarioFim: pickString(raw, "horario_fim") || "—",
    duracaoMinutos: raw.duracao_minutos != null ? String(raw.duracao_minutos) : "—",
    generoMusical: pickString(raw, "genero_musical") || "—",
    localEvento: pickString(raw, "local_evento", "endereco_contratante") || "—",
    cacheTotal: formatMoney(raw.cache_total as number | string | undefined),
    percentualSinal: raw.percentual_sinal != null ? String(raw.percentual_sinal) : "50",
    valorSinal: formatMoney(raw.valor_sinal as number | string | undefined),
    metodoPagamento: pickString(raw, "metodo_pagamento") || "A combinar",
    penalidade72h: raw.penalidade_cancelamento_72h != null ? String(raw.penalidade_cancelamento_72h) : "0",
    penalidade24_72h:
      raw.penalidade_cancelamento_24_72h != null ? String(raw.penalidade_cancelamento_24_72h) : "50",
    penalidade24h: raw.penalidade_cancelamento_24h != null ? String(raw.penalidade_cancelamento_24h) : "100",
    dataGeracao: new Date().toLocaleDateString("pt-BR"),
    refContrato: `TA-${String(contractId).padStart(4, "0")}`,
  };
}
