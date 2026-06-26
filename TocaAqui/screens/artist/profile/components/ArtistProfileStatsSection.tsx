import React from "react";
import { Text, View } from "react-native";
import { ArtistProfileStats } from "../types";
import { styles } from "../styles";

interface Props {
  stats: ArtistProfileStats;
}

export default function ArtistProfileStatsSection({ stats }: Props) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalShows}</Text>
        <Text style={styles.statLabel}>SHOWS{"\n"}REALIZADOS</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, styles.statValueHighlight]}>
          {stats.mediaAvaliacao > 0 ? stats.mediaAvaliacao.toFixed(1) : "—"}
        </Text>
        <Text style={styles.statLabel}>AVALIAÇÃO{"\n"}MÉDIA</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.bookingsAtivos}</Text>
        <Text style={styles.statLabel}>BOOKINGS{"\n"}ATIVOS</Text>
      </View>
    </View>
  );
}
