import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import api from "./api";

interface EnderecoResponse {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface ApiProfileResponse {
  id: number;
  nome_estabelecimento: string;
  nome_dono: string;
  email_responsavel: string;
  celular_responsavel: string;
  generos_musicais: string;
  horario_funcionamento_inicio: string;
  horario_funcionamento_fim: string;
  endereco_id: number;
  senha?: string;
  endereco: EnderecoResponse;
}

export interface ProfileResponse {
  estabelecimento: Omit<ApiProfileResponse, "endereco">;
  endereco: EnderecoResponse;
}

/** Perfil de artista mínimo (tela legada HomePage). */
export const createArtistProfile = async (data: {
  nome_dono?: string;
  nome?: string;
}): Promise<void> => {
  try {
    const payload = {
      nome_artistico: data.nome_dono || data.nome || "Artista",
      biografia: "Perfil criado via app",
      instrumentos: [],
      generos: [],
      anos_experiencia: 0,
    };

    await api.post("/usuarios/perfil-artista", payload);
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao criar perfil de artista:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    throw error;
  }
};

export const getEstabelecimentoProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get("/usuarios/perfil");
    const user = (response.data as { user: Record<string, unknown> }).user;
    const profiles = user.establishment_profiles as Array<Record<string, unknown>> | undefined;
    const estab = profiles?.[0] ?? null;

    if (!estab) {
      throw new Error("Perfil de estabelecimento não encontrado.");
    }

    const enderecoData = (estab.Address as EnderecoResponse | undefined) ?? {
      id: (estab.endereco_id as number) || 0,
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    };

    return {
      estabelecimento: {
        id: estab.id as number,
        nome_estabelecimento: estab.nome_estabelecimento as string,
        nome_dono: user.nome_completo as string,
        email_responsavel: user.email as string,
        celular_responsavel: estab.telefone_contato as string,
        generos_musicais: estab.generos_musicais as string,
        horario_funcionamento_inicio: estab.horario_abertura as string,
        horario_funcionamento_fim: estab.horario_fechamento as string,
        endereco_id: estab.endereco_id as number,
        senha: "",
      },
      endereco: enderecoData,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao buscar perfil:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    throw error;
  }
};

export const updateEstabelecimento = async (
  updateData: Record<string, unknown>
): Promise<void> => {
  const estabelecimentoId = await AsyncStorage.getItem("estabelecimentoId");
  if (!estabelecimentoId) {
    throw new Error("ID do estabelecimento não encontrado.");
  }
  await api.put(`/estabelecimentos/${estabelecimentoId}`, updateData);
};

export const updateEndereco = async (
  enderecoId: number,
  updateData: Record<string, unknown>
): Promise<void> => {
  await api.put(`/enderecos/${enderecoId}`, updateData);
};

export const deleteEstabelecimento = async (): Promise<void> => {
  const estabelecimentoId = await AsyncStorage.getItem("estabelecimentoId");
  if (!estabelecimentoId) {
    throw new Error("ID do estabelecimento não encontrado.");
  }
  await api.delete(`/estabelecimentos/${estabelecimentoId}`);
};

export const deleteEndereco = async (enderecoId: number): Promise<void> => {
  await api.delete(`/enderecos/${enderecoId}`);
};
