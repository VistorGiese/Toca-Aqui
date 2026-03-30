import NavBar from "@/components/Allcomponents/NavBar";
import api from "@/http/api";
import { createArtistProfile } from "@/http/RegisterService";
import { colors } from "@/utils/colors";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ArtistProfileData = {
  nome_artistico?: string;
  biografia?: string;
  instrumentos?: string | string[];
  generos?: string | string[];
  anos_experiencia?: number;
  url_portfolio?: string;
};

const parseMaybeJsonArray = (value?: string | string[]) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ArtistSelfProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [artistProfile, setArtistProfile] = useState<ArtistProfileData | null>(null);

  const loadArtistProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/usuarios/perfil");
      const user = response.data?.user || {};
      const firstArtistProfile =
        user.artist_profiles?.[0] ||
        user.ArtistProfiles?.[0] ||
        user.artist_profile ||
        null;

      setUserName(user.nome || "");
      setUserEmail(user.email || "");
      setArtistProfile(firstArtistProfile);
    } catch (error) {
      console.error("Erro ao buscar perfil de artista:", error);
      setArtistProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadArtistProfile();
    }, [loadArtistProfile])
  );

  const instruments = parseMaybeJsonArray(artistProfile?.instrumentos);
  const genres = parseMaybeJsonArray(artistProfile?.generos);

  const handleCreateArtistProfile = async () => {
    try {
      setIsCreatingProfile(true);
      await createArtistProfile({
        nome_dono: userName || "Artista",
        nome: userName || "Artista",
      });
      await loadArtistProfile();
      Alert.alert("Sucesso", "Perfil artistico criado com sucesso.");
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Nao foi possivel criar o perfil artistico.";
      Alert.alert("Erro", msg);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu perfil de artista</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.purple} size="large" style={styles.loader} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.itemTitle}>{artistProfile?.nome_artistico || userName || "-"}</Text>
            <Text style={styles.itemText}>Nome: {userName || "-"}</Text>
            <Text style={styles.itemText}>Email: {userEmail || "-"}</Text>
            <Text style={styles.itemText}>
              Experiencia: {artistProfile?.anos_experiencia ?? 0} anos
            </Text>
            <Text style={styles.itemText}>
              Portfolio: {artistProfile?.url_portfolio || "-"}
            </Text>
            <Text style={styles.itemText}>
              Instrumentos: {instruments.length ? instruments.join(", ") : "-"}
            </Text>
            <Text style={styles.itemText}>
              Generos: {genres.length ? genres.join(", ") : "-"}
            </Text>
            <Text style={styles.bioTitle}>Biografia</Text>
            <Text style={styles.bioText}>
              {artistProfile?.biografia || "Sem biografia cadastrada."}
            </Text>
          </View>

          {!artistProfile && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Seu usuario esta logado, mas ainda nao possui perfil artistico completo.
              </Text>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCreateArtistProfile}
                disabled={isCreatingProfile}
              >
                {isCreatingProfile ? (
                  <ActivityIndicator size="small" color={colors.purpleDark} />
                ) : (
                  <Text style={styles.completeButtonText}>Completar perfil de artista</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0212",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "AkiraExpanded-Superbold",
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: "#1E112C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3d2a52",
    padding: 16,
    marginBottom: 180,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
  },
  itemText: {
    color: "#ddd",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    marginBottom: 6,
  },
  bioTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginTop: 10,
    marginBottom: 6,
  },
  bioText: {
    color: "#ddd",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    lineHeight: 20,
  },
  emptyText: {
    color: "#ddd",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
  },
  emptyState: {
    marginTop: 20,
    gap: 14,
  },
  completeButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.neutral,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  completeButtonText: {
    color: colors.purpleDark,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});
