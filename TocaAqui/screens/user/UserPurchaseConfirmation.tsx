import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserStackParamList } from "@/navigation/UserNavigator";

type Props = NativeStackScreenProps<UserStackParamList, "UserPurchaseConfirmation">;

export default function UserPurchaseConfirmation({ route, navigation }: Props) {
  const { showTitle, showDate, venue, price, buyerName } = route.params;

  function goToTickets() {
    navigation.reset({
      index: 0,
      routes: [{ name: "UserTabs" }],
    });
  }

  function goToFeed() {
    navigation.reset({
      index: 0,
      routes: [{ name: "UserTabs" }],
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <FontAwesome5 name="check" size={36} color="#00C896" />
        </View>

        <Text style={styles.successTitle}>Ingresso confirmado!</Text>
        <Text style={styles.successSubtitle}>
          Show de {showTitle} no {venue}
        </Text>

        {/* Show Card */}
        <View style={styles.showCard}>
          <View style={styles.showCardImagePlaceholder}>
            <FontAwesome5 name="music" size={28} color="rgba(167,139,250,0.5)" />
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <FontAwesome5 name="star" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCellLabel}>EVENTO</Text>
              <Text style={styles.infoCellValue} numberOfLines={2}>{showTitle}</Text>
            </View>
            <View style={styles.infoCell}>
              <FontAwesome5 name="ticket-alt" size={12} color="#00C896" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCellLabel}>PREÇO</Text>
              <Text style={[styles.infoCellValue, { color: "#00C896" }]}>
                R$ {price.toFixed(2)}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <FontAwesome5 name="calendar-alt" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCellLabel}>DATA</Text>
              <Text style={styles.infoCellValue}>{showDate}</Text>
            </View>
            <View style={styles.infoCell}>
              <FontAwesome5 name="clock" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCellLabel}>INÍCIO</Text>
              <Text style={styles.infoCellValue}>21:00</Text>
            </View>
            <View style={styles.infoCell}>
              <FontAwesome5 name="map-marker-alt" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCellLabel}>LOCAL</Text>
              <Text style={styles.infoCellValue} numberOfLines={2}>{venue}</Text>
            </View>
            <View style={styles.infoCell}>
              <FontAwesome5 name="qrcode" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCellLabel}>TITULAR</Text>
              <Text style={styles.infoCellValue} numberOfLines={2}>{buyerName}</Text>
            </View>
          </View>

          {/* QR hint */}
          <View style={styles.qrHint}>
            <FontAwesome5 name="qrcode" size={20} color="#A78BFA" />
            <Text style={styles.qrHintText}>QR Code disponível no ingresso</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={goToTickets} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>VER MEU INGRESSO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
          <FontAwesome5 name="share-alt" size={14} color="#A78BFA" style={{ marginRight: 8 }} />
          <Text style={styles.outlineBtnText}>COMPARTILHAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToFeed} style={styles.backLink}>
          <Text style={styles.backLinkText}>VOLTAR AO FEED</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090F" },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(0,200,150,0.12)",
    borderWidth: 2,
    borderColor: "#00C896",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: "AkiraExpanded-Superbold",
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: "#A0A0B8",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  showCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    overflow: "hidden",
    marginBottom: 24,
  },
  showCardImagePlaceholder: {
    height: 140,
    backgroundColor: "#2D1B4E",
    alignItems: "center",
    justifyContent: "center",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  infoCell: {
    width: "44%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 10,
  },
  infoCellLabel: {
    fontFamily: "Montserrat-Bold",
    fontSize: 9,
    color: "#555577",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoCellValue: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 17,
  },
  qrHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  qrHintText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#A78BFA",
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  outlineBtn: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#A78BFA",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  outlineBtnText: {
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    color: "#A78BFA",
    letterSpacing: 1,
  },
  backLink: { paddingVertical: 8 },
  backLinkText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
    color: "#555577",
    letterSpacing: 1,
    textDecorationLine: "underline",
  },
});
