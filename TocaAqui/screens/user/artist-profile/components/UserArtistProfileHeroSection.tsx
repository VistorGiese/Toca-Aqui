import React from "react";
import { Text, View } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { UserArtistProfileDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: UserArtistProfileDisplay;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesome
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-o"}
          size={12}
          color={i <= Math.round(rating) ? DS.gold : DS.textMuted}
        />
      ))}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function UserArtistProfileHeroSection({ display }: Props) {
  return (
    <View style={styles.heroSection}>
      <Text style={styles.tipoLabel}>{display.tipoLabel}</Text>
      <Text style={styles.artistName}>{display.nome}</Text>
      {display.localizacao ? (
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={12} color={DS.textMuted} />
          <Text style={styles.locationText}>{display.localizacao}</Text>
        </View>
      ) : null}
      {display.rating > 0 ? <StarRating rating={display.rating} /> : null}
    </View>
  );
}
