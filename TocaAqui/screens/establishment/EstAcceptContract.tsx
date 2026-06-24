import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EstStackParamList } from "@/navigation/EstablishmentNavigator";
import { establishmentService } from "@/http/establishmentService";

const DS = {
  bg: "#09090F", card: "#13101F", surface: "#0F0B1E",
  border: "#1E1A30", accent: "#7B61FF", cyan: "#00CEC9",
  success: "#00C853", danger: "#EF4444", amber: "#F59E0B",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

const STATUS_LABEL = {
  pendente: { label: "PENDENTE", color: DS.amber },
  aceito: { label: "ACEITA", color: DS.success },
  rejeitado: { label: "RECUSADA", color: DS.danger },
} as const;

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstAcceptContract">;

export default function EstAcceptContract() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const {
    applicationId,
    gigId,
    status,
    artistaId,
    bandaId,
    artistName,
    gigTitle,
    valorProposto,
    mensagem,
    eventClosed,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const isBanda = Boolean(bandaId && !artistaId);
  const contratadoLabel = isBanda ? "BANDA" : "ARTISTA";
  const canAccept = !eventClosed && (status === "pendente" || status === "rejeitado") && applicationId > 0;
  const canReject = !eventClosed && status === "pendente" && applicationId > 0;
  const isReaccept = status === "rejeitado";
  const statusInfo = STATUS_LABEL[status];

  const openProfile = () => {
    if (artistaId) {
      navigation.navigate("EstArtistProfile", {
        artistId: artistaId,
        profile: { id: artistaId, nome_artistico: artistName },
      });
      return;
    }
    if (bandaId) {
      navigation.navigate("EstArtistProfile", { bandaId });
      return;
    }
    Alert.alert("Erro", "Perfil indisponível para esta candidatura.");
  };

  const handleAccept = () => {
    if (!canAccept) {
      Alert.alert(
        "Indisponível",
        eventClosed
          ? "Este evento já possui candidatura aceita."
          : "Esta candidatura não pode mais ser aceita."
      );
      return;
    }

    Alert.alert(
      isReaccept ? "Aceitar artista recusado" : "Aceitar candidatura",
      isReaccept
        ? `${artistName} foi recusado(a) anteriormente. Deseja aceitar e contratar para "${gigTitle}"?`
        : `Confirmar a contratação de ${artistName} para "${gigTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await establishmentService.acceptApplication(applicationId);
              let contrato =
                response?.contrato ??
                response?.data?.contrato ??
                null;
              let contractId = contrato?.id ?? null;

              if (!contractId) {
                const byEvent = await establishmentService.getContractByEventId(gigId);
                contrato = byEvent;
                contractId = byEvent?.id ?? null;
              }

              // Show fica privado até aprovação final do contrato PDF
              try {
                await establishmentService.updateGig(gigId, { esta_publico: false });
              } catch {
                // não bloqueia fluxo se falhar
              }

              if (!contractId) {
                Alert.alert(
                  "Candidatura aceita, mas contrato não foi gerado",
                  "O artista foi contratado, porém houve uma falha ao registrar o contrato no servidor (provavelmente banco desatualizado). Atualize o backend com as migrations e tente novamente em um novo evento, ou contate o suporte.",
                  [{ text: "OK", onPress: () => navigation.goBack() }]
                );
                return;
              }

              Alert.alert(
                "Candidatura aceita!",
                `${artistName} foi contratado(a). Revise o contrato gerado e baixe o PDF para assinar.`,
                [{
                  text: "OK",
                  onPress: () => {
                    navigation.navigate("EstContractPreview", {
                      contractId,
                      artistName,
                      gigTitle,
                      eventoId: gigId,
                      initialContract: contrato ?? undefined,
                    });
                  },
                }]
              );
            } catch (err: any) {
              const msg = err?.response?.data?.error || err?.response?.data?.message || "Erro ao aceitar candidatura.";
              Alert.alert("Erro", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!canReject) {
      Alert.alert(
        "Indisponível",
        eventClosed
          ? "Este evento já possui candidatura aceita."
          : "Esta candidatura não pode mais ser recusada."
      );
      return;
    }

    Alert.alert(
      "Recusar candidatura",
      `Deseja recusar a candidatura de ${artistName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await establishmentService.rejectApplication(applicationId);
              Alert.alert(
                "Candidatura recusada",
                "O artista será notificado.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (err: any) {
              const msg = err?.response?.data?.error || err?.response?.data?.message || "Erro ao recusar candidatura.";
              Alert.alert("Erro", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={DS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Revisar Candidatura</Text>
        <View style={{ width: 18 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {eventClosed && (
          <View style={s.closedBanner}>
            <FontAwesome5 name="lock" size={14} color={DS.amber} />
            <Text style={s.closedBannerText}>Este evento já possui candidatura aceita.</Text>
          </View>
        )}

        {isReaccept && !eventClosed && (
          <View style={s.rejectedBanner}>
            <FontAwesome5 name="user-times" size={14} color={DS.danger} />
            <Text style={s.rejectedBannerText}>
              Este artista foi recusado anteriormente. Você pode aceitar a candidatura novamente.
            </Text>
          </View>
        )}

        <View style={s.iconWrap}>
          <View style={s.iconCircle}>
            <FontAwesome5 name="file-alt" size={32} color={DS.accent} />
          </View>
        </View>

        <Text style={s.title}>Candidatura para</Text>
        <Text style={s.gigTitle}>{gigTitle}</Text>

        <View style={[s.statusPill, { borderColor: statusInfo.color + "55", backgroundColor: statusInfo.color + "18" }]}>
          <Text style={[s.statusPillText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.avatar}>
              <FontAwesome5 name={isBanda ? "users" : "user"} size={22} color={DS.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.label}>{contratadoLabel}</Text>
              <Text style={s.value}>{artistName}</Text>
            </View>
          </View>
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: DS.border }}>
            <Text style={s.label}>VALOR PROPOSTO</Text>
            <Text style={[s.value, { color: DS.cyan }]}>
              {valorProposto != null
                ? `R$ ${Number(valorProposto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : "A combinar"}
            </Text>
          </View>
        </View>

        {mensagem ? (
          <View style={s.messageCard}>
            <Text style={s.label}>MENSAGEM DO CANDIDATO</Text>
            <Text style={s.messageText}>{mensagem}</Text>
          </View>
        ) : null}

        <View style={s.refCard}>
          <FontAwesome5 name="hashtag" size={12} color={DS.textMuted} />
          <Text style={s.refText}>Candidatura #{applicationId}</Text>
        </View>

        <View style={s.warningCard}>
          <FontAwesome5 name="info-circle" size={16} color={DS.cyan} />
          <View style={{ flex: 1 }}>
            <Text style={s.warningTitle}>SOBRE A CONTRATAÇÃO</Text>
            <Text style={s.warningText}>
              Ao aceitar, o artista será confirmado para este evento, um contrato será gerado automaticamente e as demais candidaturas pendentes serão recusadas.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            isReaccept ? s.btnReaccept : s.btnAccept,
            (!canAccept || loading) && s.disabled,
          ]}
          onPress={handleAccept}
          disabled={!canAccept || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FontAwesome5 name="check" size={14} color="#fff" />
              <Text style={s.btnAcceptText}>
                {isReaccept ? "SIM, DESEJO ACEITAR" : "ACEITAR E GERAR CONTRATO"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {canReject && (
          <TouchableOpacity
            style={[s.btnReject, loading && s.disabled]}
            onPress={handleReject}
            disabled={loading}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="times" size={14} color={DS.danger} />
            <Text style={s.btnRejectText}>RECUSAR CANDIDATURA</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={s.btnProfile}
          onPress={openProfile}
          activeOpacity={0.8}
        >
          <Text style={s.btnProfileText}>
            Ver perfil completo {isBanda ? "da banda" : "do artista"}
          </Text>
          <FontAwesome5 name="chevron-right" size={12} color={DS.accent} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: DS.border,
  },
  headerTitle: { fontFamily: "Montserrat-Bold", fontSize: 17, color: DS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40 },

  closedBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: DS.amber + "18", borderRadius: 10, borderWidth: 1, borderColor: DS.amber + "44",
    padding: 12, marginBottom: 20,
  },
  closedBannerText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18 },

  rejectedBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: DS.danger + "18", borderRadius: 10, borderWidth: 1, borderColor: DS.danger + "44",
    padding: 12, marginBottom: 20,
  },
  rejectedBannerText: { flex: 1, fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18 },

  iconWrap: { alignItems: "center", marginBottom: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: DS.accent + "22", borderWidth: 2, borderColor: DS.accent + "44",
    justifyContent: "center", alignItems: "center",
  },

  title: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, textAlign: "center", marginBottom: 6 },
  gigTitle: { fontFamily: "Montserrat-Bold", fontSize: 20, color: DS.textPrimary, textAlign: "center", marginBottom: 12 },

  statusPill: {
    alignSelf: "center", paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, marginBottom: 24,
  },
  statusPillText: { fontFamily: "Montserrat-Bold", fontSize: 10, letterSpacing: 1.2 },

  infoCard: {
    backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.border, padding: 16, marginBottom: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: DS.surface,
    justifyContent: "center", alignItems: "center",
  },
  label: { fontFamily: "Montserrat-SemiBold", fontSize: 10, color: DS.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  value: { fontFamily: "Montserrat-Bold", fontSize: 16, color: DS.textPrimary },

  messageCard: {
    backgroundColor: DS.card, borderRadius: 14, borderWidth: 1, borderColor: DS.border,
    padding: 16, marginBottom: 12,
  },
  messageText: { fontFamily: "Montserrat-Regular", fontSize: 13, color: DS.textSecondary, lineHeight: 20 },

  refCard: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: DS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20,
  },
  refText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textMuted },

  warningCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: DS.cyan + "11", borderRadius: 12, borderWidth: 1, borderColor: DS.cyan + "33",
    padding: 14, marginBottom: 28,
  },
  warningTitle: { fontFamily: "Montserrat-Bold", fontSize: 11, color: DS.cyan, letterSpacing: 1.5, marginBottom: 4 },
  warningText: { fontFamily: "Montserrat-Regular", fontSize: 12, color: DS.textSecondary, lineHeight: 18 },

  btnAccept: {
    backgroundColor: DS.accent, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnReaccept: {
    backgroundColor: DS.danger, borderRadius: 12, paddingVertical: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12,
  },
  btnAcceptText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: "#fff", letterSpacing: 0.5 },

  btnReject: {
    borderWidth: 1.5, borderColor: DS.danger, borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 20,
  },
  btnRejectText: { fontFamily: "Montserrat-Bold", fontSize: 13, color: DS.danger },

  btnProfile: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10,
  },
  btnProfileText: { fontFamily: "Montserrat-SemiBold", fontSize: 13, color: DS.accent },

  disabled: { opacity: 0.5 },
});
