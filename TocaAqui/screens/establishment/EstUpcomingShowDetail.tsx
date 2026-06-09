import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { resolveImageUrl } from "@/utils/adapters";

const DS = {
  bg: "#09090F",
  card: "#1E1635",
  surface: "#161028",
  border: "#2D2545",
  accent: "#7B61FF",
  success: "#00C853",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatShowDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = MONTH_NAMES[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} de ${month}, ${year}`;
  } catch {
    return dateString || "—";
  }
}

function formatHorario(inicio: string, fim?: string): string {
  const start = inicio?.substring(0, 5) ?? "—";
  if (!fim) return start;
  return `${start} – ${fim.substring(0, 5)}`;
}

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstUpcomingShowDetail">;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

export default function EstUpcomingShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { nomeEvento, nomeArtista, fotoArtista, horarioInicio, horarioFim, dataShow } = route.params;

  const horario = formatHorario(horarioInicio, horarioFim);
  const data = formatShowDate(dataShow);
  const fotoUrl = resolveImageUrl(fotoArtista);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Show confirmado</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.summaryCard}>
          <View style={s.cardHeader}>
            <View style={s.confirmedPill}>
              <FontAwesome5 name="check-circle" size={10} color={DS.success} />
              <Text style={s.confirmedText}>Confirmado</Text>
            </View>
          </View>

          <View style={s.artistSection}>
            <View style={s.avatarWrap}>
              {fotoUrl ? (
                <Image source={{ uri: fotoUrl }} style={s.avatar} resizeMode="cover" />
              ) : (
                <View style={s.avatarFallback}>
                  <FontAwesome5 name="user" size={32} color={DS.accent} />
                </View>
              )}
            </View>
            {nomeArtista ? (
              <Text style={s.artistName}>{nomeArtista}</Text>
            ) : null}
          </View>

          <View style={s.divider} />

          <DetailRow label="Nome do evento" value={nomeEvento} />
          <View style={s.divider} />
          <DetailRow label="Nome do artista" value={nomeArtista || "—"} />
          <View style={s.divider} />
          <DetailRow label="Horário do show" value={horario} />
          <View style={s.divider} />
          <DetailRow label="Data do show" value={data} />
        </View>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS.border,
  },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: DS.textPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: DS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DS.border,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  artistSection: {
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: DS.accent,
    padding: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    backgroundColor: DS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS.border,
  },
  artistName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: DS.textPrimary,
    textAlign: "center",
  },
  confirmedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(0,200,83,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,200,83,0.25)",
  },
  confirmedText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.success,
  },
  row: { gap: 6 },
  rowLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  rowValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.textPrimary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: DS.border,
    marginVertical: 16,
  },
});

