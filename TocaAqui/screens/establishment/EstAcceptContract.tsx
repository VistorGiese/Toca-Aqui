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
  success: "#00C853", danger: "#EF4444",
  textPrimary: "#FFFFFF", textSecondary: "#8888AA", textMuted: "#555577",
};

type NavProp = NativeStackNavigationProp<EstStackParamList>;
type RouteType = RouteProp<EstStackParamList, "EstAcceptContract">;

export default function EstAcceptContract() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { applicationId, artistId, artistName, gigTitle, valorProposto } = route.params;

  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    Alert.alert(
      "Aceitar candidatura",
      `Confirmar a contratação de ${artistName} para "${gigTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await establishmentService.acceptApplication(applicationId);
              const contractId = response?.contrato?.id;
              Alert.alert(
                "Candidatura aceita!",
                `${artistName} foi contratado(a) para o show.`,
                [{
                  text: "OK",
                  onPress: () => {
                    if (contractId) {
                      navigation.navigate("EstShowDetail", { contractId });
                    } else {
                      navigation.goBack();
                    }
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

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 name="arrow-left" size={18} color={DS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Revisar Candidatura</Text>
        <View style={{ width: 18 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Ícone */}
        <View style={s.iconWrap}>
          <View style={s.iconCircle}>
            <FontAwesome5 name="file-alt" size={32} color={DS.accent} />
          </View>
        </View>

        <Text style={s.title}>Candidatura para</Text>
        <Text style={s.gigTitle}>{gigTitle}</Text>

        {/* Info do artista */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.avatar}>
              <FontAwesome5 name="user" size={22} color={DS.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.label}>ARTISTA</Text>
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

        {/* Referência */}
        <View style={s.refCard}>
          <FontAwesome5 name="hashtag" size={12} color={DS.textMuted} />
          <Text style={s.refText}>Candidatura #{applicationId}</Text>
        </View>

        {/* Aviso */}
        <View style={s.warningCard}>
          <FontAwesome5 name="info-circle" size={16} color={DS.cyan} />
          <View style={{ flex: 1 }}>
            <Text style={s.warningTitle}>SOBRE A CONTRATAÇÃO</Text>
            <Text style={s.warningText}>
              Ao aceitar, um contrato será gerado automaticamente. O artista precisará assinar o contrato para confirmar o show.
            </Text>
          </View>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={[s.btnAccept, loading && s.disabled]}
          onPress={handleAccept}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FontAwesome5 name="check" size={14} color="#fff" />
              <Text style={s.btnAcceptText}>ACEITAR E GERAR CONTRATO</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btnReject, loading && s.disabled]}
          onPress={handleReject}
          disabled={loading}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="times" size={14} color={DS.danger} />
          <Text style={s.btnRejectText}>RECUSAR CANDIDATURA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnProfile}
          onPress={() => navigation.navigate("EstArtistProfile", { artistId: artistId ?? 0 })}
          activeOpacity={0.8}
        >
          <Text style={s.btnProfileText}>Ver perfil completo do artista</Text>
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

  iconWrap: { alignItems: "center", marginBottom: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: DS.accent + "22", borderWidth: 2, borderColor: DS.accent + "44",
    justifyContent: "center", alignItems: "center",
  },

  title: { fontFamily: "Montserrat-Regular", fontSize: 14, color: DS.textSecondary, textAlign: "center", marginBottom: 6 },
  gigTitle: { fontFamily: "Montserrat-Bold", fontSize: 20, color: DS.textPrimary, textAlign: "center", marginBottom: 28 },

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
