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
import { formatBRL } from "@/utils/ticketPricing";

type Props = NativeStackScreenProps<UserStackParamList, "UserPurchaseConfirmation">;

type EventCardProps = {
  showTitle: string;
  showDate: string;
  venue: string;
  price: number;
  buyerName: string;
};

function EventCard({ showTitle, showDate, venue, price, buyerName }: EventCardProps) {
  const isFree = price === 0;

  return (
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
            {isFree ? "Gratuito" : formatBRL(price)}
          </Text>
        </View>
        <View style={styles.infoCell}>
          <FontAwesome5 name="calendar-alt" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
          <Text style={styles.infoCellLabel}>DATA</Text>
          <Text style={styles.infoCellValue}>{showDate}</Text>
        </View>
        <View style={styles.infoCell}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
          <Text style={styles.infoCellLabel}>LOCAL</Text>
          <Text style={styles.infoCellValue} numberOfLines={2}>{venue}</Text>
        </View>
        <View style={styles.infoCell}>
          <FontAwesome5 name="user" size={12} color="#A78BFA" style={{ marginBottom: 4 }} />
          <Text style={styles.infoCellLabel}>TITULAR</Text>
          <Text style={styles.infoCellValue} numberOfLines={2}>{buyerName}</Text>
        </View>
      </View>
    </View>
  );
}

export default function UserPurchaseConfirmation({ route, navigation }: Props) {
  const { showTitle, showDate, venue, price, buyerName, payMethod } = route.params;

  function goToFeed() {
    navigation.reset({
      index: 0,
      routes: [{ name: "UserTabs" }],
    });
  }

  const isPix = payMethod === "pix";
  const isCard = payMethod === "card";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090F" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.successCircle}>
          <FontAwesome5 name="check" size={36} color="#00C896" />
        </View>

        <Text style={styles.successTitle}>Ingresso confirmado</Text>

        {isCard && (
          <Text style={styles.successSubtitle}>
            Pagamento efetuado, confira seu cartão
          </Text>
        )}

        {payMethod === "free" && (
          <Text style={styles.successSubtitle}>Sua presença foi confirmada</Text>
        )}

        {isPix && (
          <Text style={styles.successSubtitle}>
            Show de {showTitle} no {venue}
          </Text>
        )}

        <EventCard
          showTitle={showTitle}
          showDate={showDate}
          venue={venue}
          price={price}
          buyerName={buyerName}
        />

        {isPix && (
          <View style={styles.pixNotice}>
            <FontAwesome5 name="info-circle" size={18} color="#F39C12" style={{ marginTop: 2 }} />
            <Text style={styles.pixNoticeText}>
              Boleto com QR code enviado em seu WhatsApp para efetuar o pagamento.
              O pagamento deve ser efetuado dentro de 5 dias úteis; caso contrário,
              seu ingresso será cancelado.
            </Text>
          </View>
        )}

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
  pixNotice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(243,156,18,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(243,156,18,0.35)",
    padding: 16,
    marginBottom: 20,
  },
  pixNoticeText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 13,
    color: "#E8D5A3",
    lineHeight: 20,
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
