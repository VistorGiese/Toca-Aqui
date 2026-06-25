import React from "react";
import { Text, View } from "react-native";
import { EstHomeMetricItem } from "../types";
import { styles } from "../styles";

interface Props {
  metrics: EstHomeMetricItem[];
}

export default function EstHomeMetricsSection({ metrics }: Props) {
  return (
    <View style={styles.metricsGrid}>
      {metrics.map((m) => (
        <View key={m.label} style={styles.metricCard}>
          <Text style={styles.metricLabel}>{m.label}</Text>
          <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
        </View>
      ))}
    </View>
  );
}
