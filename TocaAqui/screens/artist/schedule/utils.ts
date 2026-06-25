import { BandApplication } from "@/http/bandApplicationService";
import { Contract } from "@/http/contractService";
import {
  buildCalendarDays,
  chunkCalendarWeeks,
  formatGroupLabel,
  formatMonthYear,
  isDateFuture,
  parseGigDate,
  toDateKey,
} from "@/screens/establishment/schedule/utils";
import { ScheduleFilter } from "./constants";
import { ArtistScheduleDayGroup, ArtistScheduleItem } from "./types";

export { buildCalendarDays, chunkCalendarWeeks, formatMonthYear, parseGigDate, toDateKey };

function contractStatusLabel(status: Contract["status"]): string {
  switch (status) {
    case "aceito":
      return "Show confirmado";
    case "aguardando_aceite":
      return "Contrato pendente";
    case "concluido":
      return "Realizado";
    case "cancelado":
      return "Cancelado";
    case "rascunho":
      return "Rascunho";
    default:
      return status;
  }
}

function contractStatusColor(status: Contract["status"]): string {
  switch (status) {
    case "aceito":
      return "#00C853";
    case "aguardando_aceite":
      return "#F59E0B";
    case "concluido":
      return "#6C5CE7";
    case "cancelado":
      return "#E74C3C";
    default:
      return "#8888AA";
  }
}

function applicationStatusLabel(status: BandApplication["status"]): string {
  switch (status) {
    case "pendente":
      return "Candidatura em análise";
    case "aceito":
      return "Candidatura aceita";
    case "recusado":
      return "Candidatura recusada";
    default:
      return status;
  }
}

function applicationStatusColor(status: BandApplication["status"]): string {
  switch (status) {
    case "pendente":
      return "#6C5CE7";
    case "aceito":
      return "#00C853";
    case "recusado":
      return "#E74C3C";
    default:
      return "#8888AA";
  }
}

export function contractToScheduleItem(contract: Contract): ArtistScheduleItem | null {
  const dataShow = contract.data_show ?? contract.data_evento;
  if (!dataShow) return null;

  return {
    key: `contract-${contract.id}`,
    kind: "contract",
    contractId: contract.id,
    eventoId: contract.evento_id,
    title: contract.nome_evento ?? "Show",
    subtitle: contract.nome_estabelecimento ?? contract.local_evento,
    dataShow,
    horarioInicio: contract.horario_inicio,
    horarioFim: contract.horario_fim,
    statusLabel: contractStatusLabel(contract.status),
    statusColor: contractStatusColor(contract.status),
  };
}

export function applicationToScheduleItem(application: BandApplication): ArtistScheduleItem | null {
  if (!application.data_show) return null;

  return {
    key: `application-${application.id}`,
    kind: "application",
    applicationId: application.id,
    eventoId: application.evento_id,
    title: application.nome_evento ?? "Vaga",
    subtitle: application.nome_estabelecimento ?? application.cidade,
    dataShow: application.data_show,
    horarioInicio: application.horario_inicio,
    horarioFim: application.horario_fim,
    statusLabel: applicationStatusLabel(application.status),
    statusColor: applicationStatusColor(application.status),
  };
}

export function mergeScheduleItems(
  contracts: Contract[],
  applications: BandApplication[]
): ArtistScheduleItem[] {
  const contractEventIds = new Set(contracts.map((c) => c.evento_id));
  const items: ArtistScheduleItem[] = [];

  for (const contract of contracts) {
    const item = contractToScheduleItem(contract);
    if (item) items.push(item);
  }

  for (const application of applications) {
    if (application.status === "aceito" && contractEventIds.has(application.evento_id)) {
      continue;
    }
    const item = applicationToScheduleItem(application);
    if (item) items.push(item);
  }

  return items.sort(
    (a, b) => parseGigDate(a.dataShow).getTime() - parseGigDate(b.dataShow).getTime()
  );
}

function isConfirmedItem(item: ArtistScheduleItem): boolean {
  return item.statusLabel === "Show confirmado" || item.statusLabel === "Candidatura aceita";
}

function isPendingItem(item: ArtistScheduleItem): boolean {
  return (
    item.statusLabel === "Contrato pendente" || item.statusLabel === "Candidatura em análise"
  );
}

export function filterScheduleItems(
  items: ArtistScheduleItem[],
  filter: ScheduleFilter,
  selectedDateKey: string | null
): ArtistScheduleItem[] {
  let result = items;

  if (selectedDateKey) {
    result = result.filter((item) => toDateKey(parseGigDate(item.dataShow)) === selectedDateKey);
  }

  switch (filter) {
    case "confirmados":
      result = result.filter(isConfirmedItem);
      break;
    case "pendentes":
      result = result.filter(isPendingItem);
      break;
    case "proximos":
      result = result.filter(
        (item) => isDateFuture(item.dataShow) && item.statusLabel !== "Candidatura recusada"
      );
      break;
    case "passados":
      result = result.filter(
        (item) =>
          !isDateFuture(item.dataShow) ||
          item.statusLabel === "Realizado" ||
          item.statusLabel === "Cancelado"
      );
      break;
  }

  return [...result].sort((a, b) => {
    const diff = parseGigDate(a.dataShow).getTime() - parseGigDate(b.dataShow).getTime();
    return filter === "passados" ? -diff : diff;
  });
}

export function groupItemsByDate(items: ArtistScheduleItem[]): ArtistScheduleDayGroup[] {
  const map = new Map<string, ArtistScheduleItem[]>();

  for (const item of items) {
    const key = toDateKey(parseGigDate(item.dataShow));
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  return Array.from(map.entries()).map(([dateKey, dayItems]) => ({
    dateKey,
    label: formatGroupLabel(dateKey),
    items: dayItems.sort((a, b) =>
      (a.horarioInicio ?? "").localeCompare(b.horarioInicio ?? "")
    ),
  }));
}
