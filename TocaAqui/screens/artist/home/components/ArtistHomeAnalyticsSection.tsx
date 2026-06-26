import React from "react";
import { Text, View } from "react-native";
import { ArtistHomeMetrics } from "../types";
import { styles } from "../styles";

interface Props {
  metrics: ArtistHomeMetrics;
}

export default function ArtistHomeAnalyticsSection({ metrics }: Props) {
  return (
    <View style={styles.analyticsSmallRow}>
      <View style={[styles.analyticsSmallCard, { flex: 1 }]}>
        <Text style={styles.analyticsSmallTitle}>CONTRATOS{"\n"}CONFIRMADOS</Text>
        <Text style={styles.analyticsSmallValue}>
          {String(metrics.confirmedCount).padStart(2, "0")}
        </Text>
        <Text style={styles.analyticsSmallSub}>Neste ciclo</Text>
      </View>
      <View style={[styles.analyticsSmallCard, { flex: 1 }]}>
        <Text style={styles.analyticsSmallTitle}>TOTAL DE{"\n"}CONTRATOS</Text>
        <Text style={styles.analyticsSmallValue}>
          {String(metrics.totalContracts).padStart(2, "0")}
        </Text>
        <Text style={styles.analyticsSmallSub}>Todos os status</Text>
      </View>
    </View>
  );
}
