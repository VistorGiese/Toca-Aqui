import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { getGenreColor } from "@/utils/colors";
import { artistaPublicoService, ArtistaPublico, preferenciaService } from "@/http/artistaPublicoService";
import { ingressoService, Ingresso } from "@/http/ingressoService";
import { userService } from "@/http/userService";
import api from "@/http/api";

type NavProp = NativeStackNavigationProp<UserStackParamList>;

function resolvePhotoUrl(fotoPerfil: string): string {
  if (fotoPerfil.startsWith("http")) return fotoPerfil;
  const base = api.defaults.baseURL ?? "";
  return `${base}/${fotoPerfil}`;
}

function formatShowDate(dataShow: string): string {
  try {
    const date = new Date(dataShow);
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    return `${day} ${month}`;
  } catch {
    return dataShow;
  }
}

export default function UserProfile() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const displayName = user?.nome_completo || "Usuário";

  const [artistasSeguidos, setArtistasSeguidos] = useState<ArtistaPublico[]>([]);
  const [proximosShows, setProximosShows] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [localizacao, setLocalizacao] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [artistas, ingressos, perfil, prefs] = await Promise.allSettled([
        artistaPublicoService.getArtistasQueSigo(),
        ingressoService.getMeusIngressos("proximos"),
        userService.getProfile(),
        preferenciaService.buscar(),
      ]);
      if (artistas.status === "fulfilled") setArtistasSeguidos(artistas.value);
      if (ingressos.status === "fulfilled") setProximosShows(ingressos.value);
      if (perfil.status === "fulfilled" && perfil.value.user.foto_perfil) {
        setFotoPerfil(resolvePhotoUrl(perfil.value.user.foto_perfil));
      }
      if (prefs.status === "fulfilled" && prefs.value?.cidade) {
        setLocalizacao(prefs.value.cidade);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSelecionarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria para alterar a foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setUploadingFoto(true);
    try {
      const data = await userService.uploadFoto(uri);
      setFotoPerfil(resolvePhotoUrl(data.foto_perfil));
    } catch (e: any) {
      Alert.alert("Erro no upload", e?.message ?? "Não foi possível fazer o upload da foto.");
    } finally {
      setUploadingFoto(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  function goToSettings() {
    navigation.navigate("UserSettings");
  }

  function goToShowDetail(id: number) {
    navigation.navigate("UserShowDetail", { showId: id });
  }

  function goToArtist(id: number) {
    navigation.navigate("UserArtistProfile", { artistId: id });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="user" size={13} color="#A78BFA" />
        </View>
        <Text style={styles.headerBrand}>TOCA AQUI</Text>
        <TouchableOpacity onPress={goToSettings}>
          <FontAwesome5 name="cog" size={18} color="#A0A0B8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleSelecionarFoto} activeOpacity={0.85}>
            <View style={styles.avatarBorder}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarInner}>
                  <FontAwesome5 name="user" size={36} color="#A78BFA" />
                </View>
              )}
            </View>
            <View style={styles.cameraBtn}>
              {uploadingFoto ? (
                <ActivityIndicator size={10} color="#FFFFFF" />
              ) : (
                <FontAwesome5 name="camera" size={10} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.displayName}>{displayName}</Text>
          {localizacao && (
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={12} color="#555577" />
              <Text style={styles.locationText}>{localizacao}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A78BFA" />
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{proximosShows.length}</Text>
                <Text style={styles.statLabel}>SHOWS{"\n"}ASSISTIDOS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>AVALIA-{"\n"}ÇÕES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{artistasSeguidos.length}</Text>
                <Text style={styles.statLabel}>ARTISTAS{"\n"}SEGUIDOS</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editPrefsBtn} activeOpacity={0.8} onPress={() => navigation.navigate("UserSettings")}>
              <FontAwesome5 name="cog" size={14} color="#A78BFA" style={{ marginRight: 8 }} />
              <Text style={styles.editPrefsBtnText}>EDITAR PREFERÊNCIAS MUSICAIS</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos shows</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>VER TODOS</Text>
              </TouchableOpacity>
            </View>

            {proximosShows.length === 0 ? (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>Nenhum show próximo</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.upcomingRow}
              >
                {proximosShows.map((ingresso) => {
                  const show = ingresso.Show;
                  if (!show) return null;
                  const imageColor = getGenreColor(show.genero_musical?.toUpperCase() ?? "") + "44" || "#2D1B4E";
                  return (
                    <TouchableOpacity
                      key={ingresso.id}
                      style={styles.upcomingCard}
                      onPress={() => goToShowDetail(show.id)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.upcomingImage, { backgroundColor: imageColor }]}>
                        <FontAwesome5 name="music" size={16} color="rgba(255,255,255,0.3)" />
                      </View>
                      <View style={styles.upcomingInfo}>
                        <Text style={styles.upcomingDate}>{formatShowDate(show.data_show)}</Text>
                        <Text style={styles.upcomingTitle} numberOfLines={2}>{show.titulo_evento}</Text>
                      </View>
                      <FontAwesome5 name="ticket-alt" size={12} color="#A78BFA" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Artistas seguidos</Text>
            </View>

            {artistasSeguidos.length === 0 ? (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>Você ainda não segue nenhum artista</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.artistsRow}
              >
                {artistasSeguidos.map((artista) => {
                  const imageColor = getGenreColor(artista.generos?.[0]?.toUpperCase() ?? "") + "44" || "#2D1B4E";
                  return (
                    <TouchableOpacity
                      key={artista.id}
                      style={styles.artistItem}
                      onPress={() => goToArtist(artista.id)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.artistAvatar, { backgroundColor: imageColor }]}>
                        <FontAwesome5 name="microphone" size={16} color="rgba(255,255,255,0.4)" />
                      </View>
                      <Text style={styles.artistName} numberOfLines={1}>{artista.nome_artistico}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrand: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
    letterSpacing: 2,
  },
  scrollContent: { paddingBottom: 20 },
  profileSection: { alignItems: "center", paddingVertical: 20 },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 55,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#A78BFA",
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(167,139,250,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#09090F",
  },
  displayName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#A0A0B8",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: "#A78BFA",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#555577",
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 4,
  },
  editPrefsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#A78BFA",
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 24,
  },
  editPrefsBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: "#A78BFA",
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  seeAll: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: "#A78BFA",
    letterSpacing: 1,
  },
  emptyListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyListText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#555577",
  },
  upcomingRow: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
    marginBottom: 24,
  },
  upcomingCard: {
    width: 200,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 10,
  },
  upcomingImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingInfo: { flex: 1 },
  upcomingDate: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: "#A78BFA",
    marginBottom: 2,
  },
  upcomingTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 16,
  },
  artistsRow: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 4,
  },
  artistItem: { alignItems: "center", width: 64 },
  artistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: "rgba(167,139,250,0.3)",
  },
  artistName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: "#A0A0B8",
    textAlign: "center",
  },
});
