import NavBar from "@/components/Allcomponents/NavBar";
import api from "@/http/api";
import { colors } from "@/utils/colors";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FavoriteApiItem = {
  id: number;
  tipo: string;
  item: Record<string, any> | null;
};

export default function ArtistFavorites() {
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteApiItem[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/favoritos", {
        params: { tipo: "evento" },
      });
      const data = response.data?.favoritos || [];
      const onlyEventFavorites = data.filter(
        (favorite: FavoriteApiItem) =>
          favorite?.tipo === "evento" || Boolean(favorite?.item?.titulo_evento)
      );
      setFavorites(onlyEventFavorites);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const renderTitle = (favorite: FavoriteApiItem) => {
    const item = favorite.item || {};
    return (
      item.titulo_evento ||
      item.nome_banda ||
      item.nome_estabelecimento ||
      item.nome_artistico ||
      `Favorito ${favorite.id}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos favoritados</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.purple} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ainda não há eventos favoritados</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{renderTitle(item)}</Text>
              <Text style={styles.cardType}>Tipo: {item.tipo}</Text>
            </View>
          )}
        />
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
    fontSize: 26,
    fontFamily: "AkiraExpanded-Superbold",
    marginBottom: 18,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 180,
    gap: 10,
  },
  card: {
    backgroundColor: "#1E112C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3d2a52",
    padding: 14,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 4,
  },
  cardType: {
    color: "#c7bed4",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },
  emptyText: {
    color: "#c7bed4",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    marginTop: 20,
    textAlign: "center",
  },
});
