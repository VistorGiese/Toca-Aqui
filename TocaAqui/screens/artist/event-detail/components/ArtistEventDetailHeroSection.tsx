import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { EventDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: EventDetailDisplay;
}

export default function ArtistEventDetailHeroSection({ display }: Props) {
  return (
    <View style={styles.heroImage}>
      <FontAwesome5 name="music" size={40} color={DS.textDis} />
      <View style={styles.heroBadgeRow}>
        <View style={styles.genreBadge}>
          <Text style={styles.genreBadgeText}>{display.mainGenre}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>{display.statusLabel}</Text>
        </View>
      </View>
    </View>
  );
}
