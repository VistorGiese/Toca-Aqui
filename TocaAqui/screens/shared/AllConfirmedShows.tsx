import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { showService, Show, showToDetailParams, ShowDetailParams } from "@/http/showService";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";

const DS = {
  bg: "#09090F",
  accent: "#6C5CE7",
  success: "#10B981",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B8",
  card: "#16163A",
  border: "#2D2545",
} as const;

type Props = {
  detailScreen: string;
};

function formatDateBadge(d: string) {
  try {
    const dt = new Date(d);
    return {
      dia: String(dt.getDate()).padStart(2, "0"),
      mes: dt.toLocaleString("pt-BR", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { dia: "--", mes: "---" };
  }
}

/** Tela compartilhada de shows confirmados — uso exclusivo do fluxo artista. */
export default function AllConfirmedShows({ detailScreen }: Props) {
  const navigation = useNavigation();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await showService.getConfirmedShows({ limit: 50 });
      setShows(response.shows);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os shows confirmados.");
      setShows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openDetail = (detail: ShowDetailParams) => {
    navigation.navigate(detailScreen as never, detail as never);
  };

  return (
    <View style={[styles.root, { backgroundColor: DS.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />
      <View style={[styles.header, { borderBottomColor: DS.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: DS.textPrimary }]}>Próximos Shows</Text>
        <View style={{ width: 18 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={DS.accent} style={{ marginTop: 40 }} />
      ) : shows.length === 0 ? (
        <Text style={[styles.emptyText, { color: DS.textSecondary }]}>Nenhum show confirmado.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {shows.map((show) => {
            const { dia, mes } = formatDateBadge(show.data_show);
            const generos = parseGenres(show.genero_musical);
            const genero = generos[0] ?? "SHOW";
            const genreColor = getGenreColor(genero);
            const horario = show.horario_inicio?.substring(0, 5) ?? "--:--";
            const detail = showToDetailParams(show);
            return (
              <TouchableOpacity
                key={show.id}
                style={[styles.showCard, { backgroundColor: DS.card, borderLeftColor: genreColor }]}
                onPress={() => openDetail(detail)}
                activeOpacity={0.8}
              >
                <View style={[styles.dateBadge, { borderColor: `${genreColor}55` }]}>
                  <Text style={[styles.dateDay, { color: DS.textPrimary }]}>{dia}</Text>
                  <Text style={[styles.dateMes, { color: genreColor }]}>{mes}</Text>
                </View>
                <View style={styles.showCardBody}>
                  <Text style={[styles.showTitle, { color: DS.textPrimary }]} numberOfLines={1}>
                    {show.titulo_evento}
                  </Text>
                  <Text style={[styles.showSub, { color: DS.textSecondary }]} numberOfLines={1}>
                    {show.EstablishmentProfile?.nome_estabelecimento
                      ? `${show.EstablishmentProfile.nome_estabelecimento} · `
                      : show.nome_artista
                        ? `${show.nome_artista} · `
                        : ""}
                    {horario}
                  </Text>
                  <View style={styles.confirmedBadge}>
                    <FontAwesome5 name="check-circle" size={9} color={DS.success} />
                    <Text style={[styles.confirmedBadgeText, { color: DS.success }]}>Show confirmado</Text>
                  </View>
                  {generos.length > 0 && (
                    <View style={styles.genreRow}>
                      {generos.map((genre) => {
                        const color = getGenreColor(genre);
                        return (
                          <View key={`${show.id}-${genre}`} style={[styles.genreBadge, { borderColor: color }]}>
                            <Text style={[styles.genreBadgeText, { color }]}>{genre}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                <FontAwesome5 name="chevron-right" size={12} color={DS.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  showCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    gap: 12,
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: { fontFamily: "Montserrat-Bold", fontSize: 16, lineHeight: 18 },
  dateMes: { fontFamily: "Montserrat-Bold", fontSize: 9, letterSpacing: 0.5 },
  showCardBody: { flex: 1, gap: 3 },
  showTitle: { fontFamily: "Montserrat-Bold", fontSize: 14 },
  showSub: { fontFamily: "Montserrat-Regular", fontSize: 11 },
  confirmedBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  confirmedBadgeText: { fontFamily: "Montserrat-Bold", fontSize: 9, letterSpacing: 0.3 },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  genreBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  genreBadgeText: { fontFamily: "Montserrat-Bold", fontSize: 9, letterSpacing: 0.5 },
});
