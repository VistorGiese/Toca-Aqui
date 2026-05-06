import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { colors } from "@/utils/colors";
import { contractService, Contract } from "@/http/contractService";
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
  success: "#10B981",
};

type NavigationProp = NativeStackNavigationProp<ArtistStackParamList>;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  rascunho: { color: "#6B7280", label: "Rascunho" },
  aguardando_aceite: { color: "#F59E0B", label: "Aguardando" },
  aceito: { color: "#10B981", label: "Aceito" },
  cancelado: { color: "#EF4444", label: "Cancelado" },
  recusado: { color: "#EF4444", label: "Recusado" },
  concluido: { color: "#3B82F6", label: "Concluído" },
};

export default function MyContracts() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);

  function handleLogout() {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      const result = await contractService.getMyContracts();
      const data = Array.isArray(result) ? result : [];
      setContracts(data);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchContracts);
    return unsubscribe;
  }, [navigation, fetchContracts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  };

  const renderContract = ({ item }: { item: Contract }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.rascunho;

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: config.color }]}
        onPress={() => navigation.navigate("ContractDetail", { contractId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.contractTitle} numberOfLines={1}>
            {item.nome_evento || `Contrato #${item.id}`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <FontAwesome5 name="calendar" size={12} color={DS.textSec} />
            <Text style={styles.detailText}>{formatDate(item.data_show)}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="clock" size={12} color={DS.textSec} />
            <Text style={styles.detailText}>
              {item.horario_inicio || "—"} - {item.horario_fim || "—"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="money-bill-wave" size={12} color={DS.success} />
            <Text style={[styles.detailText, styles.valueText]}>
              R$ {Number(item.cache_acordado ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="file-contract" size={52} color={DS.textDis} />
      <Text style={styles.emptyTitle}>Sem contratos</Text>
      <Text style={styles.emptyText}>
        Seus contratos aparecerão aqui quando suas candidaturas forem aceitas
      </Text>
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
        <Text style={styles.headerTitle}>
          MEUS <Text style={styles.headerTitleAccent}>CONTRATOS</Text>
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={16} color="#E53E3E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contracts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderContract}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          contracts.length === 0 && styles.emptyList,
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
    paddingTop: height * 0.06,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: DS.bg,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(229,62,62,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: DS.white,
    fontSize: 16,
    fontFamily: "AkiraExpanded-Superbold",
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: DS.cyan,
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
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.15)",
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contractTitle: {
    color: DS.white,
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
  },
  cardDetails: {
    gap: 7,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    color: DS.textSec,
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
  },
  valueText: {
    color: DS.success,
    fontFamily: "Montserrat-Bold",
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
});
