import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { contractService, Contract } from "@/http/contractService";
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

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ShowDetail">;

export default function ShowDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContract = useCallback(async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes do show.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [contractId, navigation]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DS.accent} />
      </View>
    );
  }

  if (!contract) return null;

  const formattedDate = contract.data_evento
    ? new Date(contract.data_evento).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }).toUpperCase()
    : "--";

  const weekday = contract.data_evento
    ? new Date(contract.data_evento).toLocaleDateString("pt-BR", { weekday: "long" })
    : "";

  const openMaps = () => {
    const query = encodeURIComponent(contract.endereco || contract.cidade || "");
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={14} color={DS.white} />
          <Text style={styles.brandName}>TOCA AQUI</Text>
        </TouchableOpacity>
        <MaterialCommunityIcons name="guitar-electric" size={22} color={DS.accent} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Confirmed Badge */}
        <View style={styles.confirmedBadge}>
          <FontAwesome5 name="check" size={12} color={DS.success} />
          <Text style={styles.confirmedBadgeText}>SHOW CONFIRMADO</Text>
        </View>

        {/* Hero */}
        <View style={styles.heroImage}>
          <FontAwesome5 name="music" size={40} color={DS.textDis} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{contract.nome_evento || `Show #${contract.id}`}</Text>
          </View>
        </View>

        {/* Nome e subtítulo */}
        <Text style={styles.showTitle}>
          {contract.nome_evento || `Show #${contract.id}`}
        </Text>
        <Text style={styles.showSubtitle}>Main Stage • Live Set</Text>

        {/* Data e Hora */}
        <View style={styles.infoRow}>
          <FontAwesome5 name="calendar-alt" size={14} color={DS.accent} />
          <Text style={styles.infoText}>
            {formattedDate} • {weekday}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome5 name="clock" size={14} color={DS.accent} />
          <Text style={styles.infoText}>
            {contract.horario_inicio || "—"} — {contract.horario_fim || "—"}
          </Text>
        </View>

        {/* Cachê */}
        <View style={styles.cacheCard}>
          <Text style={styles.cacheLabel}>CACHÊ ACORDADO</Text>
          <Text style={styles.cacheValue}>
            R${" "}
            {Number(contract.cache_total || 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Localização */}
        <Text style={styles.sectionTitle}>LOCALIZAÇÃO</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>
              {contract.nome_estabelecimento || "Estabelecimento"}
            </Text>
            {contract.endereco ? (
              <Text style={styles.locationAddr}>{contract.endereco}</Text>
            ) : null}
            {contract.cidade ? (
              <Text style={styles.locationAddr}>
                {contract.cidade}
                {contract.estado ? `, ${contract.estado}` : ""}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.mapsBtn} onPress={openMaps}>
            <Text style={styles.mapsBtnText}>OPEN IN MAPS</Text>
          </TouchableOpacity>
        </View>

        {/* Mapa visual */}
        <View style={styles.mapVisual}>
          <MaterialCommunityIcons name="map-marker" size={36} color={DS.accent} />
          <Text style={styles.mapVisualText}>Mapa</Text>
        </View>

        {/* Timeline de Pagamento */}
        <Text style={styles.sectionTitle}>Timeline de Pagamento</Text>
        <View style={styles.timelineCard}>
          <TimelineItem
            icon="check-circle"
            iconColor={DS.accent}
            title="Agendado"
            subtitle={`Confirmado para ${formattedDate}`}
            done
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            icon="check-circle"
            iconColor={DS.accent}
            title="Realizado"
            subtitle="Status atual: Aguardando check-in no local"
            done
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            icon="circle"
            iconColor={DS.textDis}
            title="Pagamento Confirmado"
            subtitle="Previsão: após conclusão do show"
            done={false}
          />
        </View>

        {/* Contato do Responsável */}
        {contract.nome_responsavel ? (
          <>
            <Text style={styles.sectionTitle}>Contato do Responsável</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {contract.nome_responsavel.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contract.nome_responsavel}</Text>
                <Text style={styles.contactRole}>
                  {contract.cargo_responsavel || "Responsável"}
                </Text>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={styles.contactActionBtn}
                  onPress={() => Alert.alert("Ligar", "Entre em contato com o estabelecimento pelo telefone informado no contrato.")}
                >
                  <FontAwesome5 name="phone" size={14} color={DS.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactActionBtn}
                  onPress={() => Alert.alert("Mensagem", "Use o telefone ou e-mail do responsável para enviar mensagens.")}
                >
                  <FontAwesome5 name="comment" size={14} color={DS.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactActionBtn}
                  onPress={() => Alert.alert("Perfil", `Responsável: ${contract.nome_responsavel}`)}
                >
                  <FontAwesome5 name="user" size={14} color={DS.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : null}

        {/* Botão Reportar Problema */}
        <TouchableOpacity
          style={styles.btnReportar}
          onPress={() =>
            Alert.alert(
              "Reportar problema",
              "Descreva o problema pelo suporte ou entre em contato com o estabelecimento."
            )
          }
          activeOpacity={0.8}
        >
          <FontAwesome5 name="exclamation-triangle" size={14} color={DS.danger} />
          <Text style={styles.btnReportarText}>REPORTAR PROBLEMA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function TimelineItem({
  icon,
  iconColor,
  title,
  subtitle,
  done,
}: {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  done: boolean;
}) {
  return (
    <View style={timelineStyles.item}>
      <FontAwesome5 name={icon as any} size={20} color={iconColor} solid={done} />
      <View style={timelineStyles.textBlock}>
        <Text style={[timelineStyles.title, !done && { color: DS.textDis }]}>{title}</Text>
        <Text style={timelineStyles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
    marginBottom: 2,
  },
  subtitle: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 13,
    color: DS.accent,
    letterSpacing: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: DS.success + "22",
    borderWidth: 1,
    borderColor: DS.success,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 16,
  },
  confirmedBadgeText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: DS.success,
    letterSpacing: 1.5,
  },
  heroImage: {
    height: 200,
    backgroundColor: DS.bgSurface,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 14,
  },
  heroTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: DS.white,
  },
  showTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    marginBottom: 4,
    lineHeight: 28,
  },
  showSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textSec,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
  },
  cacheCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DS.success + "44",
  },
  cacheLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 2,
    marginBottom: 4,
  },
  cacheValue: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: DS.success,
  },
  sectionTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 11,
    color: DS.white,
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 4,
  },
  locationCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  locationInfo: {
    flex: 1,
    marginRight: 10,
  },
  locationName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
    marginBottom: 3,
  },
  locationAddr: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  mapsBtn: {
    backgroundColor: DS.accent + "22",
    borderWidth: 1,
    borderColor: DS.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapsBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: DS.accentLight,
    letterSpacing: 1,
  },
  mapVisual: {
    height: 100,
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
  },
  mapVisualText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
  },
  timelineCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: DS.bgSurface,
    marginLeft: 9,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DS.accent + "44",
    justifyContent: "center",
    alignItems: "center",
  },
  contactAvatarText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: DS.accent,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
  },
  contactRole: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  contactActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
  },
  btnReportar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: DS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 20,
  },
  btnReportarText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.danger,
    letterSpacing: 1,
  },
});
