import { ShowDetailContract, ShowDetailDisplay } from "./types";

export function formatDateShort(dataEvento?: string): string {
  if (!dataEvento) return "--";

  return new Date(dataEvento)
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
}

export function formatWeekday(dataEvento?: string): string {
  if (!dataEvento) return "";

  return new Date(dataEvento).toLocaleDateString("pt-BR", { weekday: "long" });
}

export function formatCacheValue(cacheTotal?: number): string {
  return Number(cacheTotal || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
}

export function buildMapsUrl(endereco?: string, cidade?: string): string {
  const query = encodeURIComponent(endereco || cidade || "");
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildShowDetailDisplay(contract: ShowDetailContract): ShowDetailDisplay {
  const formattedDate = formatDateShort(contract.data_evento);
  const cidadeEstado = contract.cidade
    ? `${contract.cidade}${contract.estado ? `, ${contract.estado}` : ""}`
    : undefined;

  const display: ShowDetailDisplay = {
    title: contract.nome_evento || `Show #${contract.id}`,
    formattedDate,
    weekday: formatWeekday(contract.data_evento),
    horarioInicio: contract.horario_inicio || "—",
    horarioFim: contract.horario_fim || "—",
    cacheFormatted: formatCacheValue(contract.cache_total),
    establishmentName: contract.nome_estabelecimento || "Estabelecimento",
    endereco: contract.endereco,
    cidadeEstado,
  };

  if (contract.nome_responsavel) {
    display.responsavel = {
      nome: contract.nome_responsavel,
      cargo: contract.cargo_responsavel || "Responsável",
      initial: contract.nome_responsavel.charAt(0).toUpperCase(),
    };
  }

  return display;
}
