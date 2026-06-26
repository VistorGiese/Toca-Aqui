import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { formatBRL } from "@/utils/ticketPricing";
import { EventCardProps } from "../types";
import { styles } from "../styles";

export default function UserPurchaseConfirmationEventCard({
  showTitle,
  showDate,
  venue,
  price,
  buyerName,
}: EventCardProps) {
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
