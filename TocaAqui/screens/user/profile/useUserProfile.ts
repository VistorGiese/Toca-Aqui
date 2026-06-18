import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { useAuth } from "@/contexts/AuthContext";
import {
  artistaPublicoService,
  ArtistaPublico,
  preferenciaService,
} from "@/http/artistaPublicoService";
import { ingressoService, Ingresso } from "@/http/ingressoService";
import { userService } from "@/http/userService";
import { resolveImageUrl } from "@/utils/adapters";
import { UserProfileStat, UserProfileViewModel } from "./types";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

export function useUserProfile(): UserProfileViewModel {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [artistasSeguidos, setArtistasSeguidos] = useState<ArtistaPublico[]>([]);
  const [proximosShows, setProximosShows] = useState<Ingresso[]>([]);
  const [showsPassados, setShowsPassados] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [localizacao, setLocalizacao] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [artistas, ingressosProximos, ingressosPassados, perfil, prefs] = await Promise.allSettled([
      artistaPublicoService.getArtistasQueSigo(),
      ingressoService.getMeusIngressos("proximos"),
      ingressoService.getMeusIngressos("passados"),
      userService.getProfile(),
      preferenciaService.buscar(),
    ]);

    if (artistas.status === "fulfilled") setArtistasSeguidos(artistas.value);
    if (ingressosProximos.status === "fulfilled") setProximosShows(ingressosProximos.value);
    if (ingressosPassados.status === "fulfilled") setShowsPassados(ingressosPassados.value);
    if (perfil.status === "fulfilled") {
      setFotoPerfil(resolveImageUrl(perfil.value.user.foto_perfil));
    }
    if (prefs.status === "fulfilled") {
      setLocalizacao(prefs.value?.cidade ?? null);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSelecionarFoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para alterar a foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingFoto(true);
    try {
      const data = await userService.uploadFoto(result.assets[0].uri);
      setFotoPerfil(resolveImageUrl(data.foto_perfil));
    } catch {
      // silenciado temporariamente
    } finally {
      setUploadingFoto(false);
    }
  }, []);

  const goToSettings = useCallback(() => navigation.navigate("UserSettings"), [navigation]);
  const goToShowDetail = useCallback(
    (showId: number) => navigation.navigate("UserShowDetail", { showId }),
    [navigation]
  );
  const goToArtist = useCallback(
    (artistId: number) => navigation.navigate("UserArtistProfile", { artistId }),
    [navigation]
  );
  const goToAllTickets = useCallback(() => navigation.navigate("UserTickets"), [navigation]);

  const stats: UserProfileStat[] = [
    { label: 'SHOWS\nPASSADOS', value: showsPassados.length },
    { label: 'PROXIMOS\nSHOWS', value: proximosShows.length },
    { label: 'ARTISTAS\nSEGUIDOS', value: artistasSeguidos.length },
  ];

  return {
    displayName: user?.nome_completo || "Usuário",
    fotoPerfil,
    localizacao,
    uploadingFoto,
    loading,
    proximosShows,
    artistasSeguidos,
    stats,
    handleSelecionarFoto,
    goToSettings,
    goToShowDetail,
    goToArtist,
    goToAllTickets,
  };
}
