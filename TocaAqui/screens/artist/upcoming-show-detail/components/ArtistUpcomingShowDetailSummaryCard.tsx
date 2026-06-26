import React from "react";
import { Image, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS } from "../constants";
import { styles } from "../styles";
import { UpcomingShowDisplay } from "../types";

interface Props {
  display: UpcomingShowDisplay;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ArtistUpcomingShowDetailSummaryCard({ display }: Props) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.confirmedPill}>
          <FontAwesome5 name="check-circle" size={10} color={DS.success} />
          <Text style={styles.confirmedText}>Confirmado</Text>
        </View>
      </View>

      <View style={styles.artistSection}>
        <View style={styles.avatarWrap}>
          {display.fotoUrl ? (
            <Image source={{ uri: display.fotoUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <FontAwesome5 name="user" size={32} color={DS.accent} />
            </View>
          )}
        </View>
        {display.nomeArtista ? <Text style={styles.artistName}>{display.nomeArtista}</Text> : null}
      </View>

      <View style={styles.divider} />
      <DetailRow label="Nome do evento" value={display.nomeEvento} />
      <View style={styles.divider} />
      <DetailRow label="Nome do artista" value={display.nomeArtista || "—"} />
      <View style={styles.divider} />
      <DetailRow label="Horário do show" value={display.horario} />
      <View style={styles.divider} />
      <DetailRow label="Data do show" value={display.data} />
    </View>
  );
}
