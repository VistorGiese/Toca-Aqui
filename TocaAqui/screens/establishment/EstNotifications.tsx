import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { establishmentService } from "@/http/establishmentService";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

const ICON_MAP: Record<string, { name: string; color: string }> = {
  candidatura:    { name: "user-check", color: "#7B61FF" },
  contrato:       { name: "file-contract", color: "#00CEC9" },
  pagamento:      { name: "dollar-sign", color: "#00C853" },
  cancelamento:   { name: "times-circle", color: "#EF4444" },
  avaliacao:      { name: "star", color: "#F59E0B" },
  default:        { name: "bell", color: "#8888AA" },
};

function getIcon(tipo?: string) {
  if (!tipo) return ICON_MAP.default;
  for (const key of Object.keys(ICON_MAP)) {
    if (tipo.toLowerCase().includes(key)) return ICON_MAP[key];
  }
  return ICON_MAP.default;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  } catch { return ""; }
}

export default function EstNotifications() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await establishmentService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    await establishmentService.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const renderItem = ({ item }: { item: any }) => {
    const icon = getIcon(item.tipo);
    return (
      <View style={[s.card, item.lida && s.cardRead]}>
        {!item.lida && <View style={s.unreadDot} />}
        <View style={[s.iconCircle, { backgroundColor: icon.color + "22" }]}>
          <FontAwesome5 name={icon.name as any} size={16} color={icon.color} />
        </View>
        <View style={s.content}>
          {item.titulo ? <Text style={s.titulo}>{item.titulo}</Text> : null}
          <Text style={[s.mensagem, item.lida && s.mensagemRead]} numberOfLines={2}>
            {item.mensagem ?? item.conteudo ?? "Nova notificação"}
          </Text>
          <Text style={s.time}>{timeAgo(item.created_at ?? item.criado_em)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.headerTitle}>Notificações</Text>
          {unreadCount > 0 && (
            <Text style={s.headerSub}>{unreadCount} não lida(s)</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={DS.accent} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={DS.accent} />
          }
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <FontAwesome5 name="bell-slash" size={36} color={DS.textMuted} />
              <Text style={s.emptyText}>Nenhuma notificação por enquanto.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: DS.border,
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: DS.textPrimary },
  headerSub: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.accent },
  markAllText: { fontFamily: "Montserrat-SemiBold", fontSize: 12, color: DS.accent },

  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.accent + "33",
    padding: 14, marginBottom: 10, position: "relative",
  },
  cardRead: { borderColor: DS.border, backgroundColor: DS.surface },
  unreadDot: {
    position: "absolute", top: 12, left: 8,
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: DS.accent,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  content: { flex: 1 },
  titulo: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.textPrimary, marginBottom: 3 },
  mensagem: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textPrimary, lineHeight: 19 },
  mensagemRead: { color: DS.textSecondary },
  time: { fontFamily: "Montserrat-Regular", fontSize: 11, color: DS.textMuted, marginTop: 4 },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "Montserrat-SemiBold", fontSize: 14, color: DS.textMuted },
});
