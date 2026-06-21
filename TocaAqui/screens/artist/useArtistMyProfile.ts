import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  artistProfileService,
  ArtistProfileData,
  ArtistProfileUpdatePayload,
} from "@/http/artistProfileService";

export type EditSection =
  | "nome"
  | "bio"
  | "generos"
  | "instrumentos"
  | "experiencia"
  | "cache"
  | "portfolio"
  | "links"
  | "som"
  | "equipamentos"
  | "indisponibilidades"
  | null;

export function useArtistMyProfile() {
  const [profile, setProfile] = useState<ArtistProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeEdit, setActiveEdit] = useState<EditSection>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPressKit, setUploadingPressKit] = useState(false);
  const [removingPressKitPath, setRemovingPressKitPath] = useState<string | null>(null);

  const loadProfile = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await artistProfileService.getMyProfile();
      setProfile(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seu perfil de artista.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const patchProfile = useCallback(
    async (payload: ArtistProfileUpdatePayload) => {
      if (!profile) return;
      try {
        const updated = await artistProfileService.updateProfile(profile.id, payload, profile);
        setProfile(updated);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Não foi possível salvar as alterações.";
        Alert.alert("Erro", message);
        throw err;
      }
    },
    [profile]
  );

  const pickAndUploadPhoto = useCallback(async () => {
    if (!profile) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita acesso à galeria para alterar a foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const path = await artistProfileService.uploadPhoto(profile.id, result.assets[0].uri);
      setProfile((prev) => (prev ? { ...prev, foto_perfil: path } : prev));
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a foto de perfil.");
    } finally {
      setUploadingPhoto(false);
    }
  }, [profile]);

  const pickAndUploadPressKit = useCallback(async () => {
    if (!profile) return;
    const remaining = Math.max(0, 5 - profile.press_kit.length);
    if (remaining === 0) {
      Alert.alert("Limite atingido", "Você pode adicionar até 5 fotos no press kit.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita acesso à galeria para adicionar fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: remaining,
    });
    if (result.canceled || result.assets.length === 0) return;

    setUploadingPressKit(true);
    try {
      const paths = await artistProfileService.uploadPressKit(
        profile.id,
        result.assets.map((a) => a.uri)
      );
      setProfile((prev) => (prev ? { ...prev, press_kit: paths } : prev));
      await loadProfile(true);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar as fotos do press kit.");
    } finally {
      setUploadingPressKit(false);
    }
  }, [profile]);

  const updateIndisponibilidades = useCallback(
    async (dates: string[]) => {
      if (!profile) return;
      try {
        const updated = await artistProfileService.updateIndisponibilidades(profile.id, dates);
        setProfile((prev) => (prev ? { ...prev, datas_indisponiveis: updated } : prev));
      } catch {
        Alert.alert("Erro", "Não foi possível atualizar as datas indisponíveis.");
        throw new Error("update failed");
      }
    },
    [profile]
  );

  const removePressKitPhoto = useCallback(
    async (photoPath: string) => {
      if (!profile) return;
      setRemovingPressKitPath(photoPath);
      try {
        const paths = await artistProfileService.removePressKitPhoto(profile.id, photoPath, profile);
        setProfile((prev) => (prev ? { ...prev, press_kit: paths } : prev));
      } catch {
        Alert.alert("Erro", "Não foi possível remover a foto do press kit.");
      } finally {
        setRemovingPressKitPath(null);
      }
    },
    [profile]
  );

  return {
    profile,
    loading,
    refreshing,
    activeEdit,
    setActiveEdit,
    loadProfile,
    patchProfile,
    updateIndisponibilidades,
    pickAndUploadPhoto,
    pickAndUploadPressKit,
    removePressKitPhoto,
    uploadingPhoto,
    uploadingPressKit,
    removingPressKitPath,
  };
}
