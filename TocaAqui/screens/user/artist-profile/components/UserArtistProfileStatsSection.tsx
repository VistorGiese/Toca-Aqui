import React from "react";
import { Text, View } from "react-native";
import { UserArtistProfileDisplay } from "../types";
import { styles } from "../styles";

interface Props {
  display: UserArtistProfileDisplay;
  favoriteCount: number;
}

export default function UserArtistProfileStatsSection({ display, favoriteCount }: Props) {
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
        <Text style={[styles.statValue, styles.statValueSmall]} numberOfLines={2}>
          {display.cacheLabel}
        </Text>
        <Text style={styles.statLabel}>CACHÊ</Text>
      </View>
    </View>
  );
}
