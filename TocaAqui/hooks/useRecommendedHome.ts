import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArtistPublicProfile,
  EstablishmentPublicProfile,
  establishmentService,
} from "@/http/establishmentService";

const DEFAULT_LIMIT = 5;

export function useRecommendedHome(limit = DEFAULT_LIMIT) {
  const [artists, setArtists] = useState<ArtistPublicProfile[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentPublicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [artistsResult, establishmentsResult] = await Promise.allSettled([
        establishmentService.searchArtists(),
        establishmentService.searchEstablishments({ limit: Math.max(limit, 20) }),
      ]);

      if (artistsResult.status === "fulfilled") {
        setArtists(artistsResult.value.slice(0, limit));
      } else {
        setArtists([]);
      }

      if (establishmentsResult.status === "fulfilled") {
        setEstablishments(establishmentsResult.value.slice(0, limit));
      } else {
        setEstablishments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { artists, establishments, loading, reload: load };
}
