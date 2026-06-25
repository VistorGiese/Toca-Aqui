import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS } from "../constants";
import { EstArtistProfileHeroDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: EstArtistProfileHeroDisplay;
}

export default function EstArtistProfileHeroSection({ display }: Props) {
  return (
    <View style={styles.heroSection}>
      <Text style={styles.artistName}>{display.nome.toUpperCase()}</Text>
      <Text style={styles.tipoLabel}>{display.tipoLabel}</Text>
      {display.localizacao ? (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={DS.textSecondary} />
          <Text style={styles.locationText}>{display.localizacao}</Text>
        </View>
      ) : null}
    </View>
  );
}
