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
    establishment_memberships: Array<{
      role: string;
      estabelecimento: { id: number; nome_estabelecimento: string; tipo_estabelecimento: string };
    }>;
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
    const token = await AsyncStorage.getItem("token");
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const ext = (/\.(\w+)$/.exec(filename)?.[1] ?? "jpeg").toLowerCase();
    const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

    const formData = new FormData();
    // React Native aceita este objeto como arquivo em FormData quando não se define Content-Type
    formData.append("imagem", { uri, name: filename, type: mimeType } as any);

    // NÃO definir Content-Type — o fetch do React Native define automaticamente
    // com o boundary correto para multipart/form-data
    const response = await fetch(`${api.defaults.baseURL}/usuarios/foto`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token ?? ""}` },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message ?? `Upload falhou (${response.status})`);
    }

    return response.json();
  },
};
