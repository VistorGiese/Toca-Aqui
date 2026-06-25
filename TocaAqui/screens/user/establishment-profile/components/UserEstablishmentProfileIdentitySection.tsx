import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { UserEstablishmentProfileDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: UserEstablishmentProfileDisplay;
}

export default function UserEstablishmentProfileIdentitySection({ display }: Props) {
  return (
    <>
      <View style={[styles.typeBadge, { backgroundColor: display.genreColor + "22" }]}>
        <Text style={[styles.typeBadgeText, { color: display.genreColor }]}>
          {display.genreLabel}
        </Text>
      </View>

      <Text style={styles.name}>{display.nome}</Text>

      {display.rating > 0 ? (
        <Text style={styles.rating}>★ {display.rating.toFixed(1)}</Text>
      ) : null}

      <View style={styles.locationRow}>
        <FontAwesome5 name="map-marker-alt" size={12} color={DS.textMuted} />
        <Text style={styles.locationText}>{display.addressLabel}</Text>
      </View>
    </>
  );
}
