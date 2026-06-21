import { Platform } from "react-native";
import api from "./api";
import { userService } from "./userService";
import { buildImageFormFile, parsePressKit } from "@/utils/adapters";
import {
  buildLinksWithMeta,
  mergeProfileMetaFields,
  stripMetaLinks,
} from "@/utils/artistProfileMeta";
import { parseJsonArray } from "@/utils/parseJsonArray";

export { parseJsonArray };

export interface ArtistProfileData {
  id: number;
  nome_artistico: string;
  biografia?: string;
  instrumentos: string[];
  generos: string[];
  anos_experiencia: number;
  url_portfolio?: string;
  foto_perfil?: string;
  esta_disponivel: boolean;
  tipo_atuacao?: string;
  cache_minimo?: number;
  cache_maximo?: number;
  tem_estrutura_som: boolean;
  estrutura_som: string[];
  cidade?: string;
  estado?: string;
  links_sociais: string[];
  press_kit: string[];
  datas_indisponiveis: string[];
  shows_realizados: number;
  nota_media?: number;
}

export type ArtistProfileUpdatePayload = Partial<{
  nome_artistico: string;
  biografia: string;
  generos: string[];
  instrumentos: string[];
  cache_minimo: number;
  cache_maximo: number;
  anos_experiencia: number;
  tem_estrutura_som: boolean;
  estrutura_som: string[];
  links_sociais: string[];
  url_portfolio: string;
  press_kit: string[];
}>;

function normalizeProfile(raw: Record<string, unknown>): ArtistProfileData {
  const allLinks = parseJsonArray(raw.links_sociais);
  const publicLinks = stripMetaLinks(allLinks);
  const metaFields = mergeProfileMetaFields(raw, allLinks);

  return {
    id: Number(raw.id),
    nome_artistico: String(raw.nome_artistico ?? ""),
    biografia: raw.biografia ? String(raw.biografia) : undefined,
    instrumentos: metaFields.instrumentos,
    generos: parseJsonArray(raw.generos),
    anos_experiencia: Number(raw.anos_experiencia ?? 0),
    url_portfolio: raw.url_portfolio ? String(raw.url_portfolio) : undefined,
    foto_perfil: raw.foto_perfil ? String(raw.foto_perfil) : undefined,
    esta_disponivel: raw.esta_disponivel !== false,
    tipo_atuacao: raw.tipo_atuacao ? String(raw.tipo_atuacao) : undefined,
    cache_minimo: raw.cache_minimo != null ? Number(raw.cache_minimo) : undefined,
    cache_maximo: raw.cache_maximo != null ? Number(raw.cache_maximo) : undefined,
    tem_estrutura_som: metaFields.tem_estrutura_som,
    estrutura_som: metaFields.estrutura_som,
    cidade: raw.cidade ? String(raw.cidade) : undefined,
    estado: raw.estado ? String(raw.estado) : undefined,
    links_sociais: publicLinks,
    press_kit: parsePressKit(raw.press_kit),
    datas_indisponiveis: parseJsonArray(raw.datas_indisponiveis),
    shows_realizados: Number(raw.shows_realizados ?? 0),
    nota_media: raw.nota_media != null ? Number(raw.nota_media) : undefined,
  };
}

function buildPayload(
  data: ArtistProfileUpdatePayload,
  current: ArtistProfileData
): ArtistProfileUpdatePayload {
  const payload: ArtistProfileUpdatePayload = { ...data };

  const touchesSoundOrInstruments =
    data.instrumentos !== undefined ||
    data.estrutura_som !== undefined ||
    data.tem_estrutura_som !== undefined;

  if (touchesSoundOrInstruments) {
    const instrumentos = data.instrumentos ?? current.instrumentos;
    const estrutura_som = data.estrutura_som ?? current.estrutura_som;
    const tem_estrutura_som = data.tem_estrutura_som ?? current.tem_estrutura_som;
    payload.instrumentos = instrumentos;
    payload.estrutura_som = estrutura_som;
    payload.tem_estrutura_som = tem_estrutura_som;
    payload.links_sociais = buildLinksWithMeta(current.links_sociais, {
      instrumentos,
      estrutura_som,
      tem_estrutura_som,
    });
  }

  if (data.links_sociais !== undefined && !touchesSoundOrInstruments) {
    payload.links_sociais = buildLinksWithMeta(data.links_sociais, {
      instrumentos: current.instrumentos,
      estrutura_som: current.estrutura_som,
      tem_estrutura_som: current.tem_estrutura_som,
    });
  }

  return payload;
}

export const artistProfileService = {
  async getMyProfile(): Promise<ArtistProfileData | null> {
    const { user } = await userService.getProfile();
    const raw =
      user.artist_profiles?.[0] ??
      (user as { ArtistProfiles?: Record<string, unknown>[] }).ArtistProfiles?.[0] ??
      null;
    if (!raw) return null;
    return normalizeProfile(raw as Record<string, unknown>);
  },

  async updateProfile(
    profileId: number,
    data: ArtistProfileUpdatePayload,
    current?: ArtistProfileData
  ): Promise<ArtistProfileData> {
    const base = current ?? (await this.getMyProfile());
    if (!base) throw new Error("Perfil não encontrado");

    const payload = buildPayload(data, base);
    await api.patch(`/usuarios/perfil-artista/${profileId}`, payload);

    const refreshed = await this.getMyProfile();
    if (!refreshed) throw new Error("Perfil não encontrado após atualização");
    return refreshed;
  },

  async uploadPhoto(profileId: number, uri: string): Promise<string> {
    const formData = new FormData();
    const file = buildImageFormFile(uri, "artist-profile.jpg");
    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((r) => r.blob());
      formData.append("imagem", blob, file.name);
    } else {
      formData.append("imagem", file as unknown as Blob);
    }
    const response = await api.patch<{ foto_perfil: string }>(
      `/usuarios/perfil-artista/${profileId}/foto`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.foto_perfil;
  },

  async uploadPressKit(profileId: number, uris: string[]): Promise<string[]> {
    const formData = new FormData();
    for (let i = 0; i < uris.length; i++) {
      const file = buildImageFormFile(uris[i], `press_kit_${i}.jpg`);
      if (Platform.OS === "web") {
        const blob = await fetch(uris[i]).then((r) => r.blob());
        formData.append("imagens", blob, file.name);
      } else {
        formData.append("imagens", file as unknown as Blob);
      }
    }
    const response = await api.patch<{ press_kit: string[] }>(
      `/usuarios/perfil-artista/${profileId}/press-kit`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return parsePressKit(response.data.press_kit);
  },

  async removePressKitPhoto(profileId: number, photoPath: string, current: ArtistProfileData): Promise<string[]> {
    const next = current.press_kit.filter((path) => path !== photoPath);
    await api.patch(`/usuarios/perfil-artista/${profileId}`, { press_kit: next });
    const refreshed = await this.getMyProfile();
    return refreshed?.press_kit ?? next;
  },

  async updateIndisponibilidades(profileId: number, datas: string[]): Promise<string[]> {
    const response = await api.patch<{ datas_indisponiveis: string[] }>(
      `/usuarios/perfil-artista/${profileId}/indisponibilidades`,
      { datas_indisponiveis: datas }
    );
    return parseJsonArray(response.data.datas_indisponiveis);
  },
};
