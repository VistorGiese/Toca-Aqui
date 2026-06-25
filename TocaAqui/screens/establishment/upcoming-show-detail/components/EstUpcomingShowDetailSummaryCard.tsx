import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { EstUpcomingShowDisplay } from "../types";
import EstUpcomingShowDetailArtistSection from "./EstUpcomingShowDetailArtistSection";
import EstUpcomingShowDetailInfoRow from "./EstUpcomingShowDetailInfoRow";
import { styles } from "../styles";

interface Props {
  display: EstUpcomingShowDisplay;
}

export default function EstUpcomingShowDetailSummaryCard({ display }: Props) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.confirmedPill}>
          <FontAwesome5 name="check-circle" size={10} color={DS.success} />
          <Text style={styles.confirmedText}>Confirmado</Text>
        </View>
      </View>

      <EstUpcomingShowDetailArtistSection
        nomeArtista={display.nomeArtista}
        fotoUrl={display.fotoUrl}
      />

      <View style={styles.divider} />

      <EstUpcomingShowDetailInfoRow label="Nome do evento" value={display.nomeEvento} />
      <View style={styles.divider} />
      <EstUpcomingShowDetailInfoRow
        label="Nome do artista"
        value={display.nomeArtista || "—"}
      />
      <View style={styles.divider} />
      <EstUpcomingShowDetailInfoRow label="Horário do show" value={display.horario} />
      <View style={styles.divider} />
      <EstUpcomingShowDetailInfoRow label="Data do show" value={display.data} />
    </View>
  );
}
