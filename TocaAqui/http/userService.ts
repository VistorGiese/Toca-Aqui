import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    nome_completo: string;
    email: string;
    role: string;
  };
}

// getUserProfile retorna: { user: { id, nome, email, role, establishment_profiles, artist_profiles } }
interface ProfileResponse {
  user: {
    id: number;
    nome_completo: string;
    email: string;
    role: string;
    foto_perfil: string | null;
    establishment_profiles: any[];
    artist_profiles: any[];
  };
}

// registroSchema (backend): nome, email, senha (min 8, >=1 maiúscula, >=1 número), tipo_usuario (opcional)
interface RegisterPayload {
  nome_completo: string;
  email: string;
  senha: string;
  tipo_usuario?: string;
}

// Resposta de /usuarios/registro: { message, user: { id, nome, email }, token }
interface RegisterResponse {
  message: string;
  user: {
    id: number;
    nome_completo: string;
    email: string;
  };
  token: string;
}

export const userService = {
  async login(email: string, senha: string): Promise<LoginResponse> {
    delete api.defaults.headers.common["Authorization"];
    const response = await api.post<LoginResponse>("/usuarios/login", {
      email: email.trim(),
      senha,
    });

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>("/usuarios/perfil");
    return response.data;
  },

  async register(data: RegisterPayload): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/usuarios/registro", data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/usuarios/logout");
    } catch {
      // ignore logout errors
    }
    await AsyncStorage.multiRemove(["token", "estabelecimentoId"]);
    delete api.defaults.headers.common["Authorization"];
  },

  async redefinirSenha(email: string): Promise<void> {
    await api.post("/usuarios/esqueci-senha", { email });
  },

  async alterarEmail(novo_email: string, senha: string): Promise<void> {
    await api.put("/usuarios/email", { novo_email, senha });
  },

  async excluirConta(senha: string): Promise<void> {
    await api.delete("/usuarios/conta", { data: { senha } });
  },

  async uploadFoto(uri: string): Promise<{ foto_perfil: string }> {
    const formData = new FormData();
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    formData.append("foto", { uri, name: filename, type } as any);
    const response = await api.patch<{ foto_perfil: string }>("/usuarios/foto", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
