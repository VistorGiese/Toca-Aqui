import api from "./api";
import { mapApiContractToTemplateData } from "@/utils/contract-data-mapper";

export interface Contract {
  id: number;
  evento_id: number;
  artista_id?: number;
  banda_id?: number;
  perfil_estabelecimento_id?: number;
  status: "rascunho" | "aguardando_aceite" | "aceito" | "cancelado" | "concluido";
  cache_total?: number;
  horario_inicio?: string;
  horario_fim?: string;
  data_evento?: string;
  data_show?: string;
  nome_evento?: string;
  nome_estabelecimento?: string;
  nome_contratante?: string;
  nome_contratado?: string;
  nome_artista?: string;
  local_evento?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  endereco_contratante?: string;
  documento_contratante?: string;
  documento_contratado?: string;
  telefone_contratante?: string;
  telefone_contratado?: string;
  percentual_sinal?: number;
  valor_sinal?: number;
  duracao_minutos?: number;
  genero_musical?: string;
  metodo_pagamento?: string;
  penalidade_cancelamento_72h?: number;
  penalidade_cancelamento_24_72h?: number;
  penalidade_cancelamento_24h?: number;
  observacoes?: string;
  cache_acordado?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContractHistoryEntry {
  id?: number;
  campo_alterado: string;
  valor_anterior?: string;
  valor_novo?: string;
  alterado_por?: string;
  created_at?: string;
}

function normalizeContract(raw: Record<string, unknown>): Contract {
  const event = (raw.Event ?? raw.event) as Record<string, unknown> | undefined;
  const establishment = (raw.EstablishmentProfile ?? raw.establishmentProfile) as
    | Record<string, unknown>
    | undefined;
  const mapped = mapApiContractToTemplateData(raw);

  return {
    ...(raw as Contract),
    id: Number(raw.id),
    evento_id: Number(raw.evento_id),
    data_evento:
      (raw.data_evento as string | undefined) ??
      (raw.data_show as string | undefined) ??
      (event?.data_show as string | undefined),
    data_show:
      (raw.data_show as string | undefined) ??
      (raw.data_evento as string | undefined) ??
      (event?.data_show as string | undefined),
    nome_evento:
      (raw.nome_evento as string | undefined) ??
      (event?.titulo_evento as string | undefined) ??
      mapped.tituloEvento,
    nome_estabelecimento:
      (raw.nome_estabelecimento as string | undefined) ??
      (establishment?.nome_estabelecimento as string | undefined) ??
      mapped.nomeContratante,
    cache_total:
      raw.cache_total != null
        ? Number(raw.cache_total)
        : raw.cache_acordado != null
          ? Number(raw.cache_acordado)
          : undefined,
    cache_acordado:
      raw.cache_acordado != null
        ? Number(raw.cache_acordado)
        : raw.cache_total != null
          ? Number(raw.cache_total)
          : undefined,
    endereco:
      (raw.endereco as string | undefined) ??
      (raw.endereco_contratante as string | undefined) ??
      (raw.local_evento as string | undefined),
  };
}

const getMyContracts = async (): Promise<Contract[]> => {
  const response = await api.get("/contratos/meus");
  const data = response.data;
  const list = Array.isArray(data) ? data : (data?.contratos ?? data?.data ?? []);
  return list.map((item: Record<string, unknown>) => normalizeContract(item));
};

const getContractById = async (id: number): Promise<Contract> => {
  const response = await api.get(`/contratos/${id}`);
  return normalizeContract(response.data as Record<string, unknown>);
};

const editContract = async (
  id: number,
  payload: Record<string, unknown>
): Promise<Contract> => {
  const response = await api.put(`/contratos/${id}/editar`, payload);
  return normalizeContract(response.data as Record<string, unknown>);
};

const getContractHistory = async (id: number): Promise<ContractHistoryEntry[]> => {
  const response = await api.get(`/contratos/${id}/historico`);
  const data = response.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
};

const acceptContract = async (id: number): Promise<Contract> => {
  const response = await api.put<Contract>(`/contratos/${id}/aceitar`);
  return normalizeContract(response.data as Record<string, unknown>);
};

const cancelContract = async (id: number, motivo: string): Promise<Contract> => {
  const response = await api.put<Contract>(`/contratos/${id}/cancelar`, { motivo });
  return normalizeContract(response.data as Record<string, unknown>);
};

const completeContract = async (id: number): Promise<Contract> => {
  const response = await api.put<Contract>(`/contratos/${id}/concluir`);
  return normalizeContract(response.data as Record<string, unknown>);
};

const avaliarEstabelecimento = async (
  contractId: number,
  payload: { nota: number; comentario?: string; tags?: string[] }
): Promise<void> => {
  await api.post(`/contratos/${contractId}/avaliar`, payload);
};

export const contractService = {
  getMyContracts,
  getContractById,
  editContract,
  getContractHistory,
  acceptContract,
  cancelContract,
  completeContract,
  avaliarEstabelecimento,
};

export { normalizeContract, mapApiContractToTemplateData };
