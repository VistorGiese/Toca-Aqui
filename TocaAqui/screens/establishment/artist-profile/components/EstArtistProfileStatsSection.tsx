import React from "react";
import { Text, View } from "react-native";
import { DS } from "../constants";
import { EstArtistProfileArtistDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: EstArtistProfileArtistDisplay;
  favoriteCount: number;
}

export default function EstArtistProfileStatsSection({ display, favoriteCount }: Props) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, styles.statValueAmber]}>{favoriteCount}</Text>
        <Text style={styles.statLabel}>FAVORITOS</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{display.showsCount}</Text>
        <Text style={styles.statLabel}>SHOWS</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: DS.success, fontSize: 14 }]}>
          {display.cacheLabel}
        </Text>
        <Text style={styles.statLabel}>CACHÊ</Text>
      </View>
    </View>
  );
}
