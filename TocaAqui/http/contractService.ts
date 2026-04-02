import api from "./api";

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
  nome_evento?: string;
  nome_estabelecimento?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  nome_responsavel?: string;
  cargo_responsavel?: string;
  created_at?: string;
  updated_at?: string;
}

const getMyContracts = async (): Promise<Contract[]> => {
  const response = await api.get("/contratos/meus");
  const data = response.data;
  return Array.isArray(data) ? data : (data?.contratos ?? data?.data ?? []);
};

const getContractById = async (id: number): Promise<Contract> => {
  const response = await api.get<Contract>(`/contratos/${id}`);
  return response.data;
};

const acceptContract = async (id: number): Promise<Contract> => {
  const response = await api.put<Contract>(`/contratos/${id}/aceitar`);
  return response.data;
};

const cancelContract = async (id: number): Promise<Contract> => {
  const response = await api.put<Contract>(`/contratos/${id}/cancelar`);
  return response.data;
};

const completeContract = async (id: number): Promise<Contract> => {
  const response = await api.put<Contract>(`/contratos/${id}/concluir`);
  return response.data;
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
  acceptContract,
  cancelContract,
  completeContract,
  avaliarEstabelecimento,
};
