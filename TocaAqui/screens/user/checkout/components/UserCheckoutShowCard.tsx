import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";

interface Props {
  showTitle: string;
  showDate: string;
  venue: string;
}

export default function UserCheckoutShowCard({ showTitle, showDate, venue }: Props) {
  return (
    <View style={styles.showCard}>
      <View style={styles.showCardImage}>
        <FontAwesome5 name="music" size={20} color="rgba(167,139,250,0.5)" />
      </View>
      <View style={styles.showCardInfo}>
        <View style={styles.genreBadge}>
          <Text style={styles.genreBadgeText}>SHOW</Text>
        </View>
        <Text style={styles.showTitle}>{showTitle}</Text>
        <View style={styles.showMeta}>
          <FontAwesome5 name="calendar-alt" size={11} color={DS.textDis} />
          <Text style={styles.showMetaText}>{showDate}</Text>
        </View>
        <View style={styles.showMeta}>
          <FontAwesome5 name="map-marker-alt" size={11} color={DS.textDis} />
          <Text style={styles.showMetaText}>{venue}</Text>
        </View>
      </View>
    </View>
  );
}
