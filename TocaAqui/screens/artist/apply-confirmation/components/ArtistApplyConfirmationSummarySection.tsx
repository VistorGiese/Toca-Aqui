import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";
import { ApplySummaryDisplay } from "../types";

interface Props {
  summary: ApplySummaryDisplay;
}

export default function ArtistApplyConfirmationSummarySection({ summary }: Props) {
  return (
    <>
      <Text style={styles.cardSectionTitle}>RESUMO DA VAGA</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryEventName}>{summary.eventName}</Text>
        <View style={styles.summaryRow}>
          <FontAwesome5 name="calendar-alt" size={13} color={DS.accent} />
          <Text style={styles.summaryText}>{summary.date}</Text>
        </View>
        <View style={styles.summaryRow}>
          <FontAwesome5 name="dollar-sign" size={13} color={DS.success} />
          <Text style={[styles.summaryText, { color: DS.success }]}>{summary.cache}</Text>
        </View>
        <View style={styles.summaryRow}>
          <FontAwesome5 name="clock" size={13} color={DS.accent} />
          <Text style={styles.summaryText}>{summary.time}</Text>
        </View>
      </View>
    </>
  );
}
