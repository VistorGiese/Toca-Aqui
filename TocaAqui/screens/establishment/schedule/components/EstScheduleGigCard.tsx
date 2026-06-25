import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Gig } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";
import { DS } from "../constants";
import { getStatusColor, getStatusLabel } from "../utils";
import { styles } from "../styles";

interface Props {
  gig: Gig;
  onPress: (gig: Gig) => void;
}

export default function EstScheduleGigCard({ gig, onPress }: Props) {
  const generos = parseGenres(gig.generos_musicais ?? gig.genero_musical);
  const genreColor = getGenreColor(generos[0] ?? "SHOW");
  const horario = gig.horario_inicio?.substring(0, 5) ?? "--:--";
  const statusColor = getStatusColor(gig.status);

  return (
    <TouchableOpacity
      style={[styles.gigCard, { borderLeftColor: genreColor }]}
      onPress={() => onPress(gig)}
      activeOpacity={0.85}
    >
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{horario}</Text>
      </View>
      <View style={styles.gigBody}>
        <Text style={styles.gigTitle} numberOfLines={2}>
          {gig.titulo_evento}
        </Text>
        <View style={styles.statusPill}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(gig.status).toUpperCase()}
          </Text>
        </View>
      </View>
      <FontAwesome5 name="chevron-right" size={12} color={DS.textSecondary} />
    </TouchableOpacity>
  );
}
