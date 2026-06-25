export interface ContractDetail {
  id?: number;
  status?: string;
  nome_evento?: string;
  data_evento?: string;
  cache_total?: number | string;
  horario_inicio?: string;
  horario_fim?: string;
  nome_contratado?: string;
  nome_artista?: string;
  artista_id?: number;
  nome_contratante?: string;
  local_evento?: string;
  valor_sinal?: number | string;
  percentual_sinal?: number;
  evento_id?: number | string;
  [key: string]: unknown;
}

export interface ShowDetailDisplay {
  contractId: number;
  refNumber: string;
  statusLabel: string;
  statusColor: string;
  eventName: string;
  formattedDate: string;
  cacheLabel: string;
  horarioInicio?: string;
  horarioFim?: string;
  contractedName?: string;
  contratanteName?: string;
  localEvento?: string;
  sinalLabel?: string;
  sinalValue?: string;
  showIsPublic: boolean;
  isConcluido: boolean;
  isCancelled: boolean;
  isActive: boolean;
  canComplete: boolean;
  canRate: boolean;
  showSchedule: boolean;
  showContracted: boolean;
  showContratante: boolean;
  showLocal: boolean;
  showSinal: boolean;
  showCancellationClause: boolean;
  showCancelAction: boolean;
  eventoId?: number;
}
