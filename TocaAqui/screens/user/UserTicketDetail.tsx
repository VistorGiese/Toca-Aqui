import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { ingressoService, Ingresso } from "@/http/ingressoService";
import { getGenreColor } from "@/utils/colors";

type Props = NativeStackScreenProps<UserStackParamList, "UserTicketDetail">;

function formatDate(dataShow: string): string {
  const date = new Date(dataShow);
  const months = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
  ];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function getStatusLabel(status: Ingresso["status"]): string {
  switch (status) {
    case "confirmado": return "CONFIRMADO";
    case "utilizado": return "UTILIZADO";
    case "cancelado": return "CANCELADO";
    case "pendente": return "PENDENTE";
    default: return status.toUpperCase();
  }
}

function getStatusColor(status: Ingresso["status"]): string {
  switch (status) {
    case "confirmado": return "#00C896";
    case "utilizado": return "#A78BFA";
    case "cancelado": return "#FF6B6B";
    case "pendente": return "#F59E0B";
    default: return "#A0A0B8";
  }
}

function FakeQRCode() {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  return (
    <View style={qrStyles.container}>
      <View style={qrStyles.finderTL}>
        {pattern.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row" }}>
            {row.map((cell, ci) => (
              <View
                key={ci}
                style={[qrStyles.module, cell ? qrStyles.moduleDark : qrStyles.moduleLight]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={qrStyles.finderTR}>
        {pattern.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row" }}>
            {row.map((cell, ci) => (
              <View
                key={ci}
                style={[qrStyles.module, cell ? qrStyles.moduleDark : qrStyles.moduleLight]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={qrStyles.finderBL}>
        {pattern.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row" }}>
            {row.map((cell, ci) => (
              <View
                key={ci}
                style={[qrStyles.module, cell ? qrStyles.moduleDark : qrStyles.moduleLight]}
              />
            ))}
          </View>
        ))}
      </View>

      {[...Array(10)].map((_, i) => (
        <View
          key={i}
          style={[
            qrStyles.dataModule,
            {
              top: 10 + ((i * 17) % 120),
              left: 20 + ((i * 23) % 120),
              width: 6 + (i % 3) * 4,
              height: 6 + ((i + 1) % 3) * 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const qrStyles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    position: "relative",
    padding: 12,
    overflow: "hidden",
  },
  finderTL: { position: "absolute", top: 12, left: 12 },
  finderTR: { position: "absolute", top: 12, right: 12 },
  finderBL: { position: "absolute", bottom: 12, left: 12 },
  module: { width: 7, height: 7 },
  moduleDark: { backgroundColor: "#111111" },
  moduleLight: { backgroundColor: "#FFFFFF" },
  dataModule: {
    position: "absolute",
    backgroundColor: "#222222",
    borderRadius: 1,
  },
});

export default function UserTicketDetail({ route, navigation }: Props) {
  const { ticketId } = route.params;
  const [ingresso, setIngresso] = useState<Ingresso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIngresso() {
      try {
        const data = await ingressoService.getIngressoById(ticketId);
        setIngresso(data);
      } catch {
        Alert.alert("Erro", "Não foi possível carregar o ingresso");
      } finally {
        setLoading(false);
      }
    }
    fetchIngresso();
  }, [ticketId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#09090F" />
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const show = ingresso?.Show;
  const genre = show?.genero_musical ?? "";
  const genreColor = getGenreColor(genre);
  const cardBg = genreColor || "#2D1B4E";

  const showTitle = show?.titulo_evento ?? "Show";
  const artist = (show as any)?.Contract?.Band?.nome_banda ?? "Artista";
  const venue = show?.EstablishmentProfile?.nome_estabelecimento ?? "";
  const address = show?.EstablishmentProfile?.Address
    ? `${show.EstablishmentProfile.Address.cidade}, ${show.EstablishmentProfile.Address.estado}`
    : "";
  const date = show?.data_show ? formatDate(show.data_show) : "";
  const time = show?.horario_inicio ? show.horario_inicio.slice(0, 5) : "";
  const codigoQr = ingresso?.codigo_qr ?? "";
  const status = ingresso?.status ?? "pendente";
  const statusLabel = getStatusLabel(status);
  const statusColor = getStatusColor(status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INGRESSO INDIVIDUAL</Text>
        <View style={styles.avatarSmall}>
          <FontAwesome5 name="user" size={12} color="#A78BFA" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.confirmedRow}>
          <View
            style={[
              styles.confirmedBadge,
              { backgroundColor: statusColor + "1F" },
            ]}
          >
            <FontAwesome5 name="check-circle" size={13} color={statusColor} />
            <Text style={[styles.confirmedText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          {codigoQr ? (
            <Text style={styles.codeText}>{codigoQr.slice(0, 12)}</Text>
          ) : null}
        </View>

        <Text style={styles.showTitle}>{showTitle}</Text>
        <Text style={styles.artistName}>{artist}</Text>

        {(venue || address) ? (
          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={13} color="#A78BFA" />
            <Text style={styles.infoText}>
              {[venue, address].filter(Boolean).join(" — ")}
            </Text>
          </View>
        ) : null}
        {date ? (
          <View style={styles.infoRow}>
            <FontAwesome5 name="calendar-alt" size={13} color="#A78BFA" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
        ) : null}
        {time ? (
          <View style={styles.infoRow}>
            <FontAwesome5 name="clock" size={13} color="#A78BFA" />
            <Text style={styles.infoText}>{time}</Text>
          </View>
        ) : null}

        <View style={[styles.qrCard, { backgroundColor: cardBg }]}>
          <View style={styles.qrCardOverlay}>
            <FakeQRCode />
            <Text style={styles.qrInstruction}>
              Apresente este QR Code na entrada
            </Text>
            {codigoQr ? (
              <Text style={styles.qrCodeText}>{codigoQr}</Text>
            ) : null}
            <View
              style={[
                styles.validBadge,
                {
                  borderColor: statusColor + "4D",
                  backgroundColor: statusColor + "1F",
                },
              ]}
            >
              <View style={[styles.validDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.validText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.walletBtn} activeOpacity={0.85}>
          <FontAwesome5 name="clipboard" size={14} color="#A78BFA" style={{ marginRight: 8 }} />
          <Text style={styles.walletBtnText}>ADICIONAR À CARTEIRA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
          <FontAwesome5 name="share-alt" size={14} color="#A78BFA" style={{ marginRight: 8 }} />
          <Text style={styles.shareBtnText}>COMPARTILHAR INGRESSO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportLink}>
          <Text style={styles.supportLinkText}>
            Problemas com seu ingresso? Suporte Editorial
          </Text>
          <FontAwesome5 name="external-link-alt" size={11} color="#A78BFA" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  centered: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#A78BFA",
    letterSpacing: 1.5,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  confirmedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  confirmedText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  codeText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#555577",
  },
  showTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 20,
    color: "#A78BFA",
    marginBottom: 4,
    lineHeight: 28,
  },
  artistName: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 14,
    color: "#A0A0B8",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#FFFFFF",
  },
  qrCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 320,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qrCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  qrInstruction: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#A0A0B8",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 6,
  },
  qrCodeText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 11,
    color: "#555577",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  validBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  validDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  validText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#A78BFA",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  walletBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 13,
    color: "#A78BFA",
    letterSpacing: 1,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 20,
  },
  shareBtnText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#A78BFA",
  },
  supportLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  supportLinkText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 12,
    color: "#555577",
    textDecorationLine: "underline",
  },
});
