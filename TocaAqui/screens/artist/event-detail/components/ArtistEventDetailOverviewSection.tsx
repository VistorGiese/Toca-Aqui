import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { EventDetailDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: EventDetailDisplay;
  fallbackVenue?: string;
}

export default function ArtistEventDetailOverviewSection({ display, fallbackVenue }: Props) {
  return (
    <>
      <Text style={styles.eventTitle}>{display.eventTitle}</Text>
      <View style={styles.locationRow}>
        <FontAwesome5 name="map-marker-alt" size={13} color={DS.textSec} />
        <Text style={styles.locationText}>
          {display.venueLocation || fallbackVenue || "Local a confirmar"}
        </Text>
      </View>

      <View style={styles.cacheCard}>
        <View>
          <Text style={styles.cacheLabel}>CACHÊ OFERECIDO</Text>
          <Text style={styles.cacheValue}>{display.offeredCache}</Text>
        </View>
        <FontAwesome5 name="dollar-sign" size={22} color={DS.success} />
      </View>
    </>
  );
}
