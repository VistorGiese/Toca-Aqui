import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { bandApplicationService } from "@/http/bandApplicationService";
import { useAuth } from "@/contexts/AuthContext";
import { ArtistStackParamList } from "@/navigation/ArtistNavigator";
import { artistaPublicoService } from "@/http/artistaPublicoService";

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
  gold: "#F6C90E",
  bgSurface: "#1A1040",
};

type NavProp = NativeStackNavigationProp<ArtistStackParamList>;
type RouteType = RouteProp<ArtistStackParamList, "ApplyConfirmation">;

export default function ApplyConfirmation() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { eventId, eventName, date, time, cache } = route.params;
  const { user } = useAuth();

  const [mensagem, setMensagem] = useState("");
  const [valorProposto, setValorProposto] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaArtista, setMediaArtista] = useState<number>(0);
  const [cidadeArtista, setCidadeArtista] = useState<string>("");

  useEffect(() => {
    if (user?.perfilArtistaId) {
      artistaPublicoService.getPerfilPublico(user.perfilArtistaId)
        .then(p => {
          setMediaArtista(p.media_nota ?? 0);
          if (p.cidade) {
            setCidadeArtista(p.estado ? `${p.cidade}, ${p.estado}` : p.cidade);
          }
        })
        .catch(() => {});
    }
  }, [user?.perfilArtistaId]);

  const handleEnviar = async () => {
    if (!mensagem.trim()) {
      Alert.alert("Atenção", "Escreva uma mensagem de apresentação.");
      return;
    }

    const valorNum = parseFloat(valorProposto);
    if (!valorProposto.trim() || isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Atencao", "Informe um valor proposto valido.");
      return;
    }

    setLoading(true);
    try {
      await bandApplicationService.applyToEvent({
        evento_id: eventId,
        mensagem: mensagem.trim(),
        valor_proposto: valorNum,
      });

      Alert.alert(
        "Candidatura enviada!",
        "Sua candidatura foi enviada com sucesso. Aguarde o retorno do estabelecimento.",
        [
          {
            text: "OK",
            onPress: () => navigation.popToTop(),
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Não foi possível enviar a candidatura.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  const getFirstName = () => {
    if (!user?.nome_completo) return "artista";
    return user.nome_completo.split(" ")[0];
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={14} color={DS.white} />
          <Text style={styles.headerTitle}>Confirmar Candidatura</Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => Alert.alert("Ajuda", "Preencha sua mensagem de apresentação e envie sua candidatura para o evento.")}
        >
          <FontAwesome5 name="ellipsis-v" size={16} color={DS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Resumo da Vaga */}
        <Text style={styles.cardSectionTitle}>RESUMO DA VAGA</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEventName}>{eventName}</Text>

          <View style={styles.summaryRow}>
            <FontAwesome5 name="calendar-alt" size={13} color={DS.accent} />
            <Text style={styles.summaryText}>{date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <FontAwesome5 name="dollar-sign" size={13} color={DS.success} />
            <Text style={[styles.summaryText, { color: DS.success }]}>{cache}</Text>
          </View>
          <View style={styles.summaryRow}>
            <FontAwesome5 name="clock" size={13} color={DS.accent} />
            <Text style={styles.summaryText}>{time}</Text>
          </View>
        </View>

        {/* Mensagem de Apresentação */}
        <Text style={styles.cardSectionTitle}>SUA MENSAGEM DE APRESENTAÇÃO</Text>
        <TextInput
          style={styles.messageInput}
          placeholder={`Olá! Sou ${getFirstName()} e gostaria de me candidatar para este show...`}
          placeholderTextColor={DS.textDis}
          multiline
          numberOfLines={6}
          value={mensagem}
          onChangeText={setMensagem}
          textAlignVertical="top"
        />

        {/* Valor Proposto */}
        <Text style={styles.cardSectionTitle}>VALOR PROPOSTO</Text>
        <Text style={styles.inputLabel}>Valor proposto (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 350"
          placeholderTextColor={DS.textDis}
          keyboardType="numeric"
          value={valorProposto}
          onChangeText={setValorProposto}
        />

        {/* Preview do Perfil */}
        <Text style={styles.cardSectionTitle}>COMO O CONTRATANTE VERÁ SEU PERFIL</Text>
        <View style={styles.profilePreviewCard}>
          <View style={styles.previewGenreBadge}>
            <Text style={styles.previewGenreText}>ARTISTA</Text>
          </View>

          <View style={styles.previewAvatarRow}>
            <View style={styles.previewAvatar}>
              <FontAwesome5 name="user" size={28} color={DS.accent} />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{user?.nome_completo || "Artista"}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FontAwesome
                    key={i}
                    name={i < Math.round(mediaArtista) ? "star" : "star-o"}
                    size={12}
                    color={i < Math.round(mediaArtista) ? DS.gold : DS.textDis}
                  />
                ))}
                <Text style={styles.reviewsCount}>({mediaArtista > 0 ? mediaArtista.toFixed(1) : "Novo"})</Text>
              </View>
              <View style={styles.locationRow}>
                <FontAwesome5 name="map-marker-alt" size={10} color={DS.textDis} />
                <Text style={styles.previewLocation}> {cidadeArtista || "Brasil"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botão Enviar */}
        <TouchableOpacity
          style={styles.btnEnviar}
          onPress={handleEnviar}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DS.white} />
          ) : (
            <Text style={styles.btnEnviarText}>ENVIAR CANDIDATURA</Text>
          )}
        </TouchableOpacity>

        {/* Cancelar */}
        <TouchableOpacity
          style={styles.btnCancelar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.btnCancelarText}>CANCELAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 16,
    color: DS.white,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardSectionTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 11,
    color: DS.textSec,
    letterSpacing: 2.5,
    marginBottom: 10,
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  summaryEventName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 17,
    color: DS.white,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: DS.textSec,
  },
  messageInput: {
    backgroundColor: DS.bgInput,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    minHeight: 130,
    borderWidth: 1,
    borderColor: DS.bgSurface,
    textAlignVertical: "top",
  },
  inputLabel: {
    color: DS.white,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600' as const,
    fontFamily: "Montserrat-SemiBold",
  },
  input: {
    backgroundColor: DS.bgInput,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: DS.white,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: DS.bgSurface,
  },
  profilePreviewCard: {
    backgroundColor: DS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: DS.accent + "44",
  },
  previewGenreBadge: {
    alignSelf: "flex-start",
    backgroundColor: DS.accent + "33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewGenreText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    color: DS.accentLight,
    letterSpacing: 1,
  },
  previewAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DS.bgSurface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: DS.accent,
  },
  previewInfo: {
    flex: 1,
    gap: 5,
  },
  previewName: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: DS.white,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  reviewsCount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: DS.textSec,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previewLocation: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: DS.textDis,
  },
  btnEnviar: {
    backgroundColor: DS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  btnEnviarText: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 12,
    color: DS.white,
    letterSpacing: 1.5,
  },
  btnCancelar: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  btnCancelarText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: DS.textDis,
  },
});
