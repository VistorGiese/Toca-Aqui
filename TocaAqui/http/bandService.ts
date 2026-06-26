import api from "./api";
import { Band } from "../types";

interface CreateBandPayload {
  nome_banda: string;
  descricao?: string;
  generos_musicais?: string[];
  perfil_artista_id: number;
}

interface UpdateBandPayload {
  nome_banda?: string;
  descricao?: string;
  generos_musicais?: string[];
}

export const bandService = {
  async getMyBands(): Promise<Band[]> {
    const response = await api.get<{ bands: Band[] }>("/gerenciamento-bandas/minhas-bandas");
    const bands = response.data.bands ?? [];
    return bands.map((b) => ({
      ...b,
      generos_musicais: Array.isArray(b.generos_musicais)
        ? b.generos_musicais
        : typeof b.generos_musicais === "string"
        ? JSON.parse((b.generos_musicais as string) || "[]")
        : [],
    }));
  },

  async createBand(data: CreateBandPayload): Promise<Band> {
    const response = await api.post("/gerenciamento-bandas", data);
    return response.data.band;
  },

  async updateBand(id: number, data: UpdateBandPayload): Promise<Band> {
    const formData = new FormData();
    if (data.nome_banda) formData.append("nome_banda", data.nome_banda);
    if (data.descricao) formData.append("descricao", data.descricao);
    if (data.generos_musicais) {
      data.generos_musicais.forEach((g) => formData.append("generos_musicais", g));
    }
    const response = await api.put(`/bandas/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.banda;
  },

  async deleteBand(id: number): Promise<void> {
    await api.delete(`/bandas/${id}`);
  },

  async inviteMember(bandaId: number, perfilArtistaId: number, funcao?: string): Promise<void> {
    await api.post('/gerenciamento-bandas/convidar', {
      banda_id: bandaId,
      perfil_artista_id: perfilArtistaId,
      funcao,
    });
  },
};
