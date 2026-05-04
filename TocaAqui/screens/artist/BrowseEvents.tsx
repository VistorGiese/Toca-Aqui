import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bookingService, Booking } from "@/http/bookingService";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";

const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  success: "#10B981",
  amber: "#F59E0B",
  bgSurface: "#1A1040",
};

const FILTER_TABS = ["TODOS", "ESTA SEMANA", "FIM DE SEMANA"] as const;
type FilterTab = typeof FILTER_TABS[number];

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

function isThisWeek(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

function isWeekend(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export default function BrowseEvents() {
  const navigation = useNavigation<NavProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("TODOS");

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await bookingService.getBookings({ status: 'pendente' });
      setBookings(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as vagas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchText.trim() ||
      b.titulo_evento?.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab =
      activeTab === "TODOS"
        ? true
        : activeTab === "ESTA SEMANA"
        ? isThisWeek(b.data_show)
        : isWeekend(b.data_show);

    const isFuture = new Date(b.data_show) > new Date(Date.now() + 24 * 60 * 60 * 1000);

    return matchesSearch && matchesTab && isFuture;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="user" size={14} color={DS.accent} />
        </View>
        <Text style={styles.brandName}>TOCA AQUI</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <FontAwesome5 name="bell" size={18} color={DS.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={14} color={DS.textDis} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por local ou cidade..."
            placeholderTextColor={DS.textDis}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <FontAwesome5 name="sliders-h" size={16} color={DS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Vagas em Destaque</Text>
        <Text style={styles.listCount}>{filteredBookings.length} encontradas</Text>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() =>
              navigation.navigate("EventDetailArtist", { eventId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBookings(true)}
            tintColor={DS.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="guitar" size={36} color={DS.textDis} />
            <Text style={styles.emptyText}>Nenhuma vaga encontrada</Text>
            <Text style={styles.emptySubText}>
              Tente mudar os filtros ou busca
            </Text>
          </View>
        }
      />
    </View>
  );
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const isNew = booking.status === "pendente";

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={cardStyles.card}>
      {/* Image Area */}
      <View style={cardStyles.imageArea}>
        <FontAwesome5 name="music" size={30} color={DS.textDis} />
        <View
          style={[
            cardStyles.statusBadge,
            { backgroundColor: isNew ? DS.accent : DS.danger },
          ]}
        >
          <Text style={cardStyles.statusBadgeText}>{isNew ? "NOVA" : "ENCERRANDO"}</Text>
        </View>
      </View>

      <View style={cardStyles.body}>
        {/* Nome do evento/estabelecimento */}
        <Text style={cardStyles.eventName} numberOfLines={1}>
          {booking.titulo_evento || `Vaga #${booking.id}`}
        </Text>

        {/* Localização */}
        <View style={cardStyles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={11} color={DS.textDis} />
          <Text style={cardStyles.locationText}>
            {booking.nome_estabelecimento ?? "Local não informado"}
          </Text>
        </View>

        {/* Data e Horário */}
        <View style={cardStyles.infoRow}>
          <View style={cardStyles.infoItem}>
            <FontAwesome5 name="calendar" size={11} color={DS.textSec} />
            <Text style={cardStyles.infoText}>{formatDate(booking.data_show)}</Text>
          </View>
          <View style={cardStyles.infoItem}>
            <FontAwesome5 name="clock" size={11} color={DS.textSec} />
            <Text style={cardStyles.infoText}>
              {booking.horario_inicio} — {booking.horario_fim}
            </Text>
          </View>
        </View>

        {/* Botão */}
        <TouchableOpacity style={cardStyles.btnCandidatar} onPress={onPress} activeOpacity={0.85}>
          <Text style={cardStyles.btnCandidatarText}>CANDIDATAR-SE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
  },
  imageArea: {
    height: 140,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: DS.white,
    letterSpacing: 1,
  },
  body: {
    padding: 14,
  },
  eventName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.white,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  btnCandidatar: {
    backgroundColor: DS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnCandidatarText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 11,
    color: DS.white,
    letterSpacing: 1.5,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: DS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: DS.accent,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 13,
    color: DS.accent,
    letterSpacing: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
  },
  filterBtn: {
    backgroundColor: DS.bgCard,
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS.textDis,
  },
  tabActive: {
    borderColor: DS.accent,
    backgroundColor: DS.accent + "22",
  },
  tabText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textDis,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: DS.accentLight,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: DS.white,
  },
  listCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
    color: DS.textSec,
  },
  emptySubText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textDis,
  },
});
