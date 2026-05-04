import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { contractService, Contract } from "@/http/contractService";
import { userService } from "@/http/userService";
import api from "@/http/api";
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

const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function ArtistSchedule() {
  const navigation = useNavigation<NavProp>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [artistProfileId, setArtistProfileId] = useState<number | null>(null);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const fetchContracts = useCallback(async () => {
    try {
      const [contractData, profileData] = await Promise.all([
        contractService.getMyContracts(),
        userService.getProfile(),
      ]);
      setContracts(contractData);
      const artistProfile = profileData.user.artist_profiles[0];
      if (artistProfile) {
        setArtistProfileId(artistProfile.id);
        const datas: string[] = Array.isArray(artistProfile.datas_indisponiveis)
          ? artistProfile.datas_indisponiveis
          : [];
        setBlockedDates(new Set(datas));
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const toggleBlockDate = useCallback(async (dateStr: string) => {
    if (!artistProfileId) return;
    setBlockedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
      const datas = Array.from(next);
      api.patch(`/usuarios/perfil-artista/${artistProfileId}/indisponibilidades`, { datas_indisponiveis: datas })
        .catch(() => Alert.alert("Erro", "Não foi possível salvar a indisponibilidade."));
      return next;
    });
    setShowBlockModal(false);
  }, [artistProfileId]);

  const acceptedContracts = contracts.filter(
    (c) => c.status === "aceito" || c.status === "concluido"
  );

  // Datas dos contratos aceitos como Set de "YYYY-MM-DD"
  const eventDates = new Set(
    acceptedContracts
      .filter((c) => c.data_evento)
      .map((c) => c.data_evento!.split("T")[0])
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = now.toISOString().split("T")[0];

  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const upcomingGigs = acceptedContracts
    .filter((c) => c.data_evento && new Date(c.data_evento) >= new Date())
    .sort((a, b) => new Date(a.data_evento!).getTime() - new Date(b.data_evento!).getTime());

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <FontAwesome5 name="bars" size={18} color={DS.white} />
          </View>
          <Text style={styles.brandName}>TOCA AQUI</Text>
          <View style={styles.avatarSmall}>
            <FontAwesome5 name="user" size={14} color={DS.accent} />
          </View>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5 name="chevron-left" size={14} color={DS.white} />
            </TouchableOpacity>
            <View style={styles.monthInfo}>
              <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
              <Text style={styles.eventsCount}>
                {acceptedContracts.length} eventos confirmados
              </Text>
            </View>
            <TouchableOpacity onPress={handleNextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5 name="chevron-right" size={14} color={DS.white} />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekDaysRow}>
            {WEEK_DAYS.map((d) => (
              <Text key={d} style={styles.weekDayLabel}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === today;
              const hasEvent = eventDates.has(dateStr);
              const isBlocked = blockedDates.has(dateStr);

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={styles.dayCell}
                  onPress={() => { setSelectedDay(day); setShowBlockModal(true); }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayInner,
                      hasEvent && styles.dayWithEvent,
                      isBlocked && styles.dayBlocked,
                      isToday && styles.dayToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        hasEvent && styles.dayTextEvent,
                        isBlocked && styles.dayTextBlocked,
                        isToday && styles.dayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Próximos Shows */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRÓXIMOS SHOWS</Text>
        </View>

        {upcomingGigs.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome5 name="calendar-times" size={28} color={DS.textDis} />
            <Text style={styles.emptyText}>Nenhum show confirmado próximo</Text>
          </View>
        ) : (
          upcomingGigs.map((c) => (
            <GigRow
              key={c.id}
              contract={c}
              onPress={() =>
                navigation.navigate("ShowDetail", { contractId: c.id })
              }
            />
          ))
        )}

        {/* Bloquear Data */}
        <TouchableOpacity style={styles.blockDateBtn} onPress={() => { setSelectedDay(null); setShowBlockModal(true); }}>
          <FontAwesome5 name="ban" size={13} color={DS.white} />
          <Text style={styles.blockDateText}>BLOQUEAR DATA</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal bloquear data */}
      <Modal visible={showBlockModal} transparent animationType="slide" onRequestClose={() => setShowBlockModal(false)}>
        <TouchableOpacity style={modalSt.overlay} activeOpacity={1} onPress={() => setShowBlockModal(false)}>
          <View style={modalSt.sheet}>
            <Text style={modalSt.title}>
              {selectedDay
                ? `${String(selectedDay).padStart(2,"0")}/${String(currentMonth+1).padStart(2,"0")}/${currentYear}`
                : "Selecione um dia no calendário"}
            </Text>
            {selectedDay && (() => {
              const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;
              const isBlocked = blockedDates.has(dateStr);
              return (
                <TouchableOpacity
                  style={[modalSt.btn, { backgroundColor: isBlocked ? DS.success : DS.danger }]}
                  onPress={() => toggleBlockDate(dateStr)}
                >
                  <Text style={modalSt.btnText}>{isBlocked ? "DESBLOQUEAR DATA" : "BLOQUEAR DATA"}</Text>
                </TouchableOpacity>
              );
            })()}
            <TouchableOpacity style={modalSt.cancel} onPress={() => setShowBlockModal(false)}>
              <Text style={modalSt.cancelText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const modalSt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: DS.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  title: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.white, textAlign: "center" },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.white, letterSpacing: 1 },
  cancel: { alignItems: "center", paddingVertical: 10 },
  cancelText: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSec },
});

function GigRow({ contract, onPress }: { contract: Contract; onPress: () => void }) {
  const date = contract.data_evento ? new Date(contract.data_evento) : null;
  const monthLabel = date
    ? date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()
    : "--";
  const dayLabel = date ? String(date.getDate()).padStart(2, "0") : "--";

  const isConfirmed = contract.status === "aceito";
  const statusColor = isConfirmed ? DS.success : DS.amber;
  const statusLabel = isConfirmed ? "CONFIRMADO" : "PENDENTE";

  return (
    <TouchableOpacity style={gigRowStyles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Date Block */}
      <View style={gigRowStyles.dateBlock}>
        <Text style={gigRowStyles.month}>{monthLabel}</Text>
        <Text style={gigRowStyles.day}>{dayLabel}</Text>
      </View>

      {/* Info */}
      <View style={gigRowStyles.info}>
        <Text style={gigRowStyles.eventName} numberOfLines={1}>
          {contract.nome_evento || `Show #${contract.id}`}
        </Text>
        {contract.cidade ? (
          <View style={gigRowStyles.locationRow}>
            <FontAwesome5 name="map-marker-alt" size={10} color={DS.textDis} />
            <Text style={gigRowStyles.locationText}>{contract.cidade}</Text>
          </View>
        ) : null}
        <View style={[gigRowStyles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[gigRowStyles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Horário */}
      {contract.horario_inicio ? (
        <Text style={gigRowStyles.timeText}>{contract.horario_inicio}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const gigRowStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  dateBlock: {
    width: 44,
    alignItems: "center",
    backgroundColor: DS.accent + "22",
    borderRadius: 8,
    paddingVertical: 8,
  },
  month: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: DS.accent,
    letterSpacing: 1,
  },
  day: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 18,
    color: DS.accent,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  eventName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  statusText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
  timeText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: DS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: DS.accent,
    letterSpacing: 2,
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
  calendarCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthInfo: {
    alignItems: "center",
  },
  monthText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.white,
  },
  eventsCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
    marginTop: 2,
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textDis,
    letterSpacing: 0.5,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dayWithEvent: {
    backgroundColor: DS.accent,
  },
  dayBlocked: {
    backgroundColor: DS.danger + "55",
    borderWidth: 1,
    borderColor: DS.danger,
  },
  dayTextBlocked: {
    color: DS.danger,
    fontFamily: "Montserrat-Bold",
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: DS.accentLight,
  },
  dayText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
  },
  dayTextEvent: {
    color: DS.white,
    fontFamily: "Montserrat-Bold",
  },
  dayTextToday: {
    color: DS.accentLight,
    fontFamily: "Montserrat-Bold",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 2,
  },
  emptyCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
  },
  blockDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS.accent,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    gap: 8,
    marginTop: 16,
  },
  blockDateText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
});
