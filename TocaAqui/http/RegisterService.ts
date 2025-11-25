import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AccountProps } from "../contexts/AccountFromContexto";
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

interface EstabelecimentoResponse {
  id: number;
}

interface LoginResponse {
  token: string;
  estabelecimentoId: number;
  user?: any;
  message?: string;
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

interface ProfileResponse {
  estabelecimento: Omit<ApiProfileResponse, "endereco">;
  endereco: EnderecoResponse;
}

type LoginPayload = {
  email_responsavel?: string;
  email?: string;
  senha?: string;
};

export const createEndereco = async (
  enderecoData: Partial<AccountProps>
): Promise<EnderecoResponse> => {
  try {
    const response = await api.post<EnderecoResponse>(
      "/enderecos",
      enderecoData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao criar endereço:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao criar endereço:", error);
    throw error;
  }
};

export const createEstabelecimento = async (
  estabelecimentoData: Partial<AccountProps>
): Promise<EstabelecimentoResponse> => {
  try {
    const payloadNovo = {
      nome_estabelecimento: estabelecimentoData.nome_estabelecimento,
      tipo_estabelecimento: "bar",
      descricao: "Cadastrado via App",
      generos_musicais: estabelecimentoData.generos_musicais,
      horario_abertura: estabelecimentoData.horario_funcionamento_inicio,
      horario_fechamento: estabelecimentoData.horario_funcionamento_fim,
      endereco_id:
        (estabelecimentoData as any).endereco_id ||
        (estabelecimentoData as any).endereco?.id,
      telefone_contato: estabelecimentoData.celular_responsavel,
    };

    const response = await api.post<EstabelecimentoResponse>(
      "/usuarios/perfil-estabelecimento",
      payloadNovo
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao criar estabelecimento:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao criar estabelecimento:", error);
    throw error;
  }
};

export const loginEstabelecimento = async (
  loginData: LoginPayload
): Promise<LoginResponse> => {
  try {
    const payload = {
      email: loginData.email_responsavel || loginData.email,
      senha: loginData.senha,
    };

    const response = await api.post<LoginResponse>("/usuarios/login", payload);
    const { token } = response.data;
    let estabelecimentoId = 0;

    if (token) {
      await AsyncStorage.setItem("token", token);

      try {
        const perfilResponse = await api.get("/usuarios/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData: any = perfilResponse.data.user;

        if (
          userData.establishment_profiles &&
          userData.establishment_profiles.length > 0
        ) {
          estabelecimentoId = userData.establishment_profiles[0].id;
          await AsyncStorage.setItem(
            "estabelecimentoId",
            String(estabelecimentoId)
          );
        }
      } catch (err) {
        console.error("Erro ao recuperar ID do estabelecimento:", err);
      }
    }

    return {
      token: token,
      estabelecimentoId: estabelecimentoId,
      user: response.data.user,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro de login:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const getEstabelecimentoProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get("/usuarios/perfil");
    const user = (response.data as any).user;
    const estab = user.establishment_profiles
      ? user.establishment_profiles[0]
      : null;

    if (!estab) {
      throw new Error("Perfil de estabelecimento não encontrado.");
    }

    const enderecoData = estab.Address || {
      id: estab.endereco_id || 0,
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    };

    return {
      estabelecimento: {
        id: estab.id,
        nome_estabelecimento: estab.nome_estabelecimento,
        nome_dono: user.nome,
        email_responsavel: user.email,
        celular_responsavel: estab.telefone_contato,
        generos_musicais: estab.generos_musicais,
        horario_funcionamento_inicio: estab.horario_abertura,
        horario_funcionamento_fim: estab.horario_fechamento,
        endereco_id: estab.endereco_id,
        senha: "",
      },
      endereco: enderecoData,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao buscar perfil:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao buscar perfil:", error);
    throw error;
  }
};

export const updateEstabelecimento = async (
  updateData: Partial<AccountProps>
): Promise<void> => {
  try {
    const estabelecimentoId = await AsyncStorage.getItem("estabelecimentoId");
    if (!estabelecimentoId) {
      throw new Error("ID do estabelecimento não encontrado.");
    }
    await api.put(`/estabelecimentos/${estabelecimentoId}`, updateData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao atualizar estabelecimento:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao atualizar estabelecimento:", error);
    throw error;
  }
};

export const updateEndereco = async (
  enderecoId: number,
  updateData: Partial<AccountProps>
): Promise<void> => {
  try {
    await api.put(`/enderecos/${enderecoId}`, updateData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao atualizar endereço:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao atualizar endereço:", error);
    throw error;
  }
};

export const deleteEstabelecimento = async (): Promise<void> => {
  try {
    const estabelecimentoId = await AsyncStorage.getItem("estabelecimentoId");
    if (!estabelecimentoId) {
      throw new Error("ID do estabelecimento não encontrado.");
    }
    await api.delete(`/estabelecimentos/${estabelecimentoId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao deletar estabelecimento:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao deletar estabelecimento:", error);
    throw error;
  }
};

export const deleteEndereco = async (enderecoId: number): Promise<void> => {
  try {
    await api.delete(`/enderecos/${enderecoId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Detalhes do erro ao deletar endereço:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    console.error("Erro ao deletar endereço:", error);
    throw error;
  }
};
