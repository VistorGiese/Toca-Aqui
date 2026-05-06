import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
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
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  success: "#10B981",
  amber: "#F59E0B",
  bgSurface: "#1A1040",
  dangerDark: "#2D0A0A",
};

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ContractDetail">;

export default function ContractDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { contractId } = route.params;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o contrato.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [contractId, navigation]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleAssinar = () => {
    Alert.alert(
      "Assinar Contrato",
      "Confirma que deseja aceitar e assinar este contrato?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Assinar",
          onPress: async () => {
            setActionLoading(true);
            try {
              await contractService.acceptContract(contractId);
              Alert.alert(
                "Contrato assinado!",
                "Parabéns! O show foi confirmado. Abrindo sua agenda...",
                [{
                  text: "OK",
                  onPress: () => (navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" }),
                }]
              );
            } catch (err: any) {
              const msg = err?.response?.data?.message || "Erro ao assinar o contrato.";
              Alert.alert("Erro", msg);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRecusar = () => {
    Alert.alert(
      "Recusar Contrato",
      "Tem certeza que deseja recusar este contrato? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await contractService.cancelContract(contractId);
              Alert.alert(
                "Contrato recusado",
                "O contrato foi recusado com sucesso.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (err: any) {
              const msg = err?.response?.data?.message || "Erro ao recusar o contrato.";
              Alert.alert("Erro", msg);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (!contract) return null;

  const isAlreadySigned = contract.status === "aceito" || contract.status === "concluido";
  const isCancelled = contract.status === "cancelado" || contract.status === "recusado";

  const refNumber = `SE-2026-${String(contract.id).padStart(4, "0")}-GIG`;

  const formattedDate = contract.data_evento
    ? new Date(contract.data_evento).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Data não informada";

  const calcDuration = () => {
    if (!contract.horario_inicio || !contract.horario_fim) return null;
    const [h1, m1] = contract.horario_inicio.split(":").map(Number);
    const [h2, m2] = contract.horario_fim.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) return null;
    return `${diff} minutos`;
  };

  const duration = calcDuration();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <FontAwesome5 name="bars" size={18} color={DS.white} />
        </View>
        <Text style={styles.brandName}>TOCA AQUI</Text>
        <FontAwesome5 name="music" size={18} color={DS.accent} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ícone Documento */}
        <View style={styles.docIconContainer}>
          <View style={styles.docIconCircle}>
            <FontAwesome5 name="file-contract" size={32} color={DS.accent} />
          </View>
        </View>

        {/* Título e Referência */}
        <Text style={styles.contractTitle}>Contrato de Show</Text>
        <Text style={styles.contractRef}>Ref. #{refNumber}</Text>

        {/* Status Badge */}
        {isAlreadySigned && (
          <View style={styles.statusBadgeGreen}>
            <FontAwesome5 name="check" size={11} color={DS.success} />
            <Text style={styles.statusBadgeTextGreen}>CONTRATO ASSINADO</Text>
          </View>
        )}
        {isCancelled && (
          <View style={styles.statusBadgeRed}>
            <FontAwesome5 name="times" size={11} color={DS.danger} />
            <Text style={styles.statusBadgeTextRed}>CONTRATO CANCELADO</Text>
          </View>
        )}

        {/* Card Evento */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>EVENTO</Text>
          <Text style={styles.infoCardValue}>
            {contract.nome_evento || `Show #${contract.id}`}
          </Text>
        </View>

        {/* Cards Data e Localização */}
        <View style={styles.gridRow}>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <FontAwesome5 name="calendar-alt" size={14} color={DS.accent} />
            <Text style={styles.infoCardLabel}>DATA</Text>
            <Text style={styles.infoCardValueSmall}>{formattedDate}</Text>
          </View>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <FontAwesome5 name="map-marker-alt" size={14} color={DS.accent} />
            <Text style={styles.infoCardLabel}>LOCALIZAÇÃO</Text>
            <Text style={styles.infoCardValueSmall}>
              {contract.cidade || "Não informada"}
            </Text>
          </View>
        </View>

        {/* Termos Acordados */}
        <Text style={styles.sectionTitle}>Termos Acordados</Text>
        <View style={styles.termsCard}>
          <View style={styles.termRow}>
            <View>
              <Text style={styles.termLabel}>Cachê do Artista</Text>
              <Text style={styles.termNote}>Pagamento em até 48h após show</Text>
            </View>
            <Text style={styles.termValue}>
              R${" "}
              {Number(contract.cache_total || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.termDivider} />

          <View style={styles.termRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.termLabel}>Horário e Duração</Text>
              {contract.horario_inicio ? (
                <Text style={styles.termNote}>
                  Check-in: {contract.horario_inicio} | Início: {contract.horario_inicio}
                  {duration ? ` | ${duration}` : ""}
                </Text>
              ) : (
                <Text style={styles.termNote}>Horário não informado</Text>
              )}
            </View>
          </View>
        </View>

        {/* Cláusula de Cancelamento */}
        <View style={styles.cancelClause}>
          <FontAwesome5 name="exclamation-triangle" size={16} color={DS.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cancelClauseTitle}>CLÁUSULA DE CANCELAMENTO</Text>
            <Text style={styles.cancelClauseText}>
              O cancelamento com menos de 48 horas antes do show implica em multa de 50% do
              cachê acordado. Cancelamentos com mais de 7 dias de antecedência são gratuitos.
            </Text>
          </View>
        </View>

        {/* Botões de Ação */}
        {!isAlreadySigned && !isCancelled && (
          <>
            <TouchableOpacity
              style={styles.btnAssinar}
              onPress={handleAssinar}
              activeOpacity={0.85}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={DS.white} />
              ) : (
                <Text style={styles.btnAssinarText}>ASSINAR E CONFIRMAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRecusar}
              onPress={handleRecusar}
              activeOpacity={0.8}
              disabled={actionLoading}
            >
              <Text style={styles.btnRecusarText}>RECUSAR CONTRATO</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Texto Legal */}
        <Text style={styles.legalText}>
          Ao assinar este contrato, você concorda com os Termos de Uso da plataforma Toca
          Aqui e com as condições acordadas com o estabelecimento. Este documento tem
          validade jurídica.
        </Text>
      </ScrollView>
    </View>
  );
}

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
    paddingTop: 50,
    paddingBottom: 16,
  },
  brandName: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 14,
    color: DS.accent,
    letterSpacing: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  docIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  docIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DS.accent + "22",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: DS.accent + "44",
  },
  contractTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: DS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  contractRef: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: DS.textDis,
    textAlign: "center",
    marginBottom: 16,
  },
  statusBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: DS.success + "22",
    borderWidth: 1,
    borderColor: DS.success,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 16,
  },
  statusBadgeTextGreen: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: DS.success,
    letterSpacing: 1.5,
  },
  statusBadgeRed: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: DS.danger + "22",
    borderWidth: 1,
    borderColor: DS.danger,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 16,
  },
  statusBadgeTextRed: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: DS.danger,
    letterSpacing: 1.5,
  },
  infoCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },
  infoCardLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 10,
    color: DS.textDis,
    letterSpacing: 2,
  },
  infoCardValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.white,
  },
  infoCardValueSmall: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: DS.white,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.textSec,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 10,
  },
  termsCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  termRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  termLabel: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.white,
    marginBottom: 3,
  },
  termNote: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textSec,
    maxWidth: "80%",
  },
  termValue: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.success,
  },
  termDivider: {
    height: 1,
    backgroundColor: DS.bgSurface,
    marginVertical: 8,
  },
  cancelClause: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: DS.dangerDark,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: DS.danger + "55",
  },
  cancelClauseTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    color: DS.danger,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cancelClauseText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textSec,
    lineHeight: 18,
  },
  btnAssinar: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  btnAssinarText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
  btnRecusar: {
    borderWidth: 1.5,
    borderColor: DS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  btnRecusarText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: DS.danger,
    letterSpacing: 1,
  },
  legalText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textDis,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 10,
  },
});
