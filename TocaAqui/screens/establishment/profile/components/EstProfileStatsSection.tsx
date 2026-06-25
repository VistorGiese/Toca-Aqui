import React from "react";
import { Text, View } from "react-native";
import { EstablishmentProfileStats } from "@/http/establishmentService";
import { styles } from "../styles";

interface Props {
  stats: EstablishmentProfileStats;
}

export default function EstProfileStatsSection({ stats }: Props) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalContratacoes}</Text>
        <Text style={styles.statLabel}>CONTRATAÇÕES</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, styles.statValueHighlight]}>
          {stats.totalAvaliacoes}
        </Text>
        <Text style={styles.statLabel}>AVALIAÇÕES</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalEventos}</Text>
        <Text style={styles.statLabel}>EVENTOS</Text>
      </View>
    </View>
  );
}
