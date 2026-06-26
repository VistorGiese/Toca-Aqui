import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { ArtistHomeMetrics } from "../types";
import { styles } from "../styles";

interface Props {
  metrics: ArtistHomeMetrics;
}

export default function ArtistHomeMetricsSection({ metrics }: Props) {
  return (
    <View style={styles.metricsRow}>
      <View style={[styles.metricCard, { borderLeftColor: DS.cyan }]}>
        <FontAwesome5 name="calendar-check" size={20} color={DS.cyan} />
        <Text style={styles.metricValue}>{metrics.confirmedCount}</Text>
        <Text style={styles.metricLabel}>SHOWS{"\n"}CONFIRMADOS</Text>
      </View>
      <View style={[styles.metricCard, { borderLeftColor: DS.danger }]}>
        <FontAwesome5 name="clock" size={20} color={DS.danger} />
        <Text style={styles.metricValue}>{metrics.pendingCount}</Text>
        <Text style={styles.metricLabel}>PROPOSTAS{"\n"}PENDENTES</Text>
      </View>
    </View>
  );
}
