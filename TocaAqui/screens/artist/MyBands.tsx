import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/Navigate";
import { colors, getGenreColor } from "@/utils/colors";
import { bandService } from "@/http/bandService";
import { Band } from "@/types";
import { resolveImageUrl } from "@/utils/adapters";
import NavBar from "@/components/Allcomponents/NavBar";

const { height } = Dimensions.get("window");

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyBands() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth();
  const [bands, setBands] = useState<Band[]>([]);

  function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBands = useCallback(async () => {
    try {
      const data = await bandService.getMyBands();
      setBands(Array.isArray(data) ? data : []);
    } catch (error) {
      // error handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchBands);
    return unsubscribe;
  }, [navigation, fetchBands]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBands();
  };

  const renderBand = ({ item }: { item: Band }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("BandDetail", { bandId: item.id })}
      activeOpacity={0.8}
    >
      {item.imagem ? (
        <Image source={{ uri: resolveImageUrl(item.imagem)! }} style={styles.bandImage} />
      ) : (
        <View style={styles.bandImagePlaceholder}>
          <FontAwesome5 name="users" size={22} color={DS.accent} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.bandName}>{item.nome_banda}</Text>
        {Array.isArray(item.generos_musicais) && item.generos_musicais.length > 0 && (
          <View style={styles.genreRow}>
            {item.generos_musicais.slice(0, 3).map((genre) => (
              <View
                key={genre}
                style={[styles.genrePill, { backgroundColor: getGenreColor(genre) }]}
              >
                <Text style={styles.genrePillText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}
        {item.descricao && (
          <Text style={styles.bandDesc} numberOfLines={2}>
            {item.descricao}
          </Text>
        )}
      </View>
      <FontAwesome5 name="chevron-right" size={14} color={DS.textDis} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="guitar" size={52} color={DS.textDis} />
      <Text style={styles.emptyTitle}>Nenhuma banda ainda</Text>
      <Text style={styles.emptyText}>
        Crie sua primeira banda para começar a se candidatar a eventos
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateBand")}
      >
        <FontAwesome5 name="plus" size={14} color={DS.white} />
        <Text style={styles.createButtonText}>Criar Banda</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DS.accent} />
        </View>
        <NavBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={18} color={DS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          MINHAS <Text style={styles.headerTitleAccent}>BANDAS</Text>
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateBand")}
          >
            <FontAwesome5 name="plus" size={16} color={DS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={15} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={bands}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBand}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          bands.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DS.accent}
            colors={[DS.accent]}
          />
        }
      />
      <NavBar />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: 20,
    backgroundColor: DS.bg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: DS.cyan,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(229,62,62,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 130,
    paddingTop: 4,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
  },
  bandImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  bandImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(108,92,231,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  bandName: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 6,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  genrePillText: {
    color: DS.white,
    fontSize: 11,
    fontFamily: "Montserrat-Bold",
  },
  bandDesc: {
    color: DS.textSec,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    lineHeight: 17,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    color: DS.white,
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginTop: 20,
    textAlign: "center",
  },
  emptyText: {
    color: DS.textSec,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.accent,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 28,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
  },
});
