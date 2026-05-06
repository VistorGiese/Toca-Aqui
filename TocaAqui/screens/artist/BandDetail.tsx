import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors, getGenreColor } from "@/utils/colors";
import { artistService } from "@/http/artistService";
import { Band } from "@/types";
import { resolveImageUrl } from "@/utils/adapters";
import { showApiError } from "@/utils/errorHandler";

const { height, width } = Dimensions.get("window");

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  success: "#10B981",
  danger: "#E53E3E",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BandDetail() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "BandDetail">>();
  const { bandId } = route.params;
  const { signOut } = useAuth();

  function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  const [band, setBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBand();
  }, [bandId]);

  async function loadBand() {
    try {
      const band = await artistService.getBandById(bandId);
      setBand(band);
    } catch (error) {
      showApiError(error, "Erro ao carregar banda.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  if (loading || !band) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DS.accent} />
        </View>
      </View>
    );
  }

  const imageUrl = resolveImageUrl(band.imagem);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <FontAwesome5 name="users" size={52} color={DS.accent} />
          </View>
        )}

        {/* Back button overlay */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={17} color={DS.white} />
        </TouchableOpacity>

        {/* Home + Logout overlays */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("ArtistHome")}
        >
          <FontAwesome5 name="home" size={16} color={DS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={15} color="#E53E3E" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Band Name */}
          <Text style={styles.bandName}>{band.nome_banda}</Text>

          {/* Genre Pills */}
          {band.generos_musicais && band.generos_musicais.length > 0 && (
            <View style={styles.genresContainer}>
              {band.generos_musicais.map((genre) => (
                <View
                  key={genre}
                  style={[styles.genrePill, { backgroundColor: getGenreColor(genre) }]}
                >
                  <Text style={styles.genrePillText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {band.descricao && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                SO<Text style={styles.sectionTitleAccent}>BRE</Text>
              </Text>
              <Text style={styles.description}>{band.descricao}</Text>
            </View>
          )}

          {/* Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              INFORMA<Text style={styles.sectionTitleAccent}>ÇÕES</Text>
            </Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <FontAwesome5 name="calendar" size={14} color={DS.textSec} />
                <Text style={styles.infoText}>
                  Criada em {new Date(band.data_criacao || (band as any).createdAt || band.created_at).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <FontAwesome5
                  name="circle"
                  size={10}
                  color={band.esta_ativo ? DS.success : DS.danger}
                />
                <Text style={[styles.infoText, { color: band.esta_ativo ? DS.success : DS.danger }]}>
                  {band.esta_ativo ? "Ativa" : "Inativa"}
                </Text>
              </View>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditBand", { bandId: band.id })}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="edit" size={16} color={DS.white} />
            <Text style={styles.editButtonText}>Editar Banda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: width,
    height: height * 0.35,
    resizeMode: "cover",
  },
  heroPlaceholder: {
    width: width,
    height: height * 0.35,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: height * 0.05,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  homeButton: {
    position: "absolute",
    top: height * 0.05,
    right: 70,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(108,92,231,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    position: "absolute",
    top: height * 0.05,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(229,62,62,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  bandName: {
    color: DS.white,
    fontSize: 26,
    fontFamily: "AkiraExpanded-Superbold",
    marginBottom: 14,
    lineHeight: 34,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  genrePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  genrePillText: {
    color: DS.white,
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: DS.white,
    fontSize: 14,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionTitleAccent: {
    color: DS.cyan,
  },
  description: {
    color: DS.textSec,
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    lineHeight: 23,
  },
  infoCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "rgba(108,92,231,0.1)",
    marginVertical: 8,
  },
  infoText: {
    color: DS.textSec,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS.accent,
    borderRadius: 14,
    height: 52,
    gap: 10,
    marginTop: 8,
  },
  editButtonText: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});
