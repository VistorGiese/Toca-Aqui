import api from "./api";

export interface ArtistaPublico {
  id: number;
  nome_artistico: string;
  biografia?: string;
  foto_perfil?: string;
  generos?: string[];
  instrumentos?: string[];
  total_seguidores: number;
  media_nota?: number;
  seguindo: boolean;
  cidade?: string;
  estado?: string;
  User?: { nome: string };
  ProximosShows?: Array<{
    id: number;
    titulo_evento: string;
    data_show: string;
    horario_inicio: string;
    preco_ingresso_inteira?: number;
    EstablishmentProfile?: { nome_estabelecimento: string; Address?: { cidade: string } };
  }>;
}

export interface Preferencias {
  generos_favoritos?: string[];
  cidade?: string;
  raio_busca_km?: number;
  tipos_local?: string[];
  notif_novos_shows?: boolean;
  notif_lembretes?: boolean;
}

export const artistaPublicoService = {
  async getPerfilPublico(artistaId: number): Promise<ArtistaPublico> {
    const response = await api.get<{ artista: ArtistaPublico }>(`/artistas/${artistaId}/publico`);
    return response.data.artista;
  },

  async seguirOuDesseguir(artistaId: number): Promise<{ seguindo: boolean; total_seguidores: number }> {
    const response = await api.post<{ seguindo: boolean; total_seguidores: number }>(
      `/artistas/${artistaId}/seguir`
    );
    return response.data;
  },

  async getArtistasQueSigo(): Promise<ArtistaPublico[]> {
    const response = await api.get<{ artistas: ArtistaPublico[] }>("/artistas/seguindo");
    return response.data.artistas;
  },
};

export const preferenciaService = {
  async salvar(data: Preferencias): Promise<void> {
    await api.post("/usuarios/preferencias", data);
  },

  async buscar(): Promise<Preferencias> {
    const response = await api.get<{ preferencias: Preferencias }>("/usuarios/preferencias");
    return response.data.preferencias;
  },
};
