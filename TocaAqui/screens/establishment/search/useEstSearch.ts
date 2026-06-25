import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { ArtistPublicProfile, establishmentService } from "@/http/establishmentService";
import { DEFAULT_HEADER_NAME, SEARCH_DEBOUNCE_MS } from "./constants";
import { buildSearchParams, filterArtistsByName, normalizeSearchArtists } from "./utils";

type NavProp = NativeStackNavigationProp<EstStackParamList>;

export function useEstSearch() {
  const navigation = useNavigation<NavProp>();

  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<ArtistPublicProfile[]>([]);
  const [headerName, setHeaderName] = useState(DEFAULT_HEADER_NAME);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadHeader = useCallback(async () => {
    try {
      const profile = await establishmentService.getMyEstablishmentProfile();
      setHeaderName(profile.nome_estabelecimento ?? DEFAULT_HEADER_NAME);
    } catch {
      setHeaderName(DEFAULT_HEADER_NAME);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHeader();
    }, [loadHeader])
  );

  const search = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const raw = await establishmentService.searchArtists(buildSearchParams(query));
        const normalized = normalizeSearchArtists(raw);
        setArtists(filterArtistsByName(normalized, query));
      } catch {
        Alert.alert("Erro", "Não foi possível buscar artistas.");
        setArtists([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    search(true);
  }, [search]);

  const goToNotifications = useCallback(() => {
    navigation.navigate("EstNotifications");
  }, [navigation]);

  const openArtistProfile = useCallback(
    (artist: ArtistPublicProfile) => {
      navigation.navigate("EstArtistProfile", {
        artistId: artist.id,
        profile: artist,
      });
    },
    [navigation]
  );

  return {
    query,
    setQuery,
    artists,
    headerName,
    loading,
    refreshing,
    refresh,
    goToNotifications,
    openArtistProfile,
  };
}
