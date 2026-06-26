import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Show } from "@/http/showService";
import { getGenreColor } from "@/utils/colors";
import { DS } from "../constants";
import { formatDateBadge } from "../utils";
import { styles } from "../styles";

interface Props {
  show: Show;
  onPress: (show: Show) => void;
}

export default function ArtistHomeShowCard({ show, onPress }: Props) {
  const { dia, mes } = formatDateBadge(show.data_show);
  const genero = (show.genero_musical ?? "SHOW").split(",")[0]?.trim().toUpperCase() || "SHOW";
  const genreColor = getGenreColor(genero);
  const horario = show.horario_inicio?.substring(0, 5) ?? "--:--";

  return (
    <TouchableOpacity
      style={[styles.showCard, { borderLeftColor: genreColor }]}
      onPress={() => onPress(show)}
      activeOpacity={0.8}
    >
      <View style={[styles.dateBadge, { borderColor: `${genreColor}55` }]}>
        <Text style={styles.dateDay}>{dia}</Text>
        <Text style={[styles.dateMes, { color: genreColor }]}>{mes}</Text>
      </View>
      <View style={styles.showCardBody}>
        <Text style={styles.showTitle} numberOfLines={1}>
          {show.titulo_evento}
        </Text>
        <Text style={styles.showSub} numberOfLines={1}>
          {show.EstablishmentProfile?.nome_estabelecimento
            ? `${show.EstablishmentProfile.nome_estabelecimento} · `
            : show.nome_artista
              ? `${show.nome_artista} · `
              : ""}
          {horario}
        </Text>
        <View style={styles.confirmedBadge}>
          <FontAwesome5 name="check-circle" size={9} color={DS.success} />
          <Text style={styles.confirmedBadgeText}>Show confirmado</Text>
        </View>
      </View>
      <FontAwesome5 name="chevron-right" size={12} color={DS.textDis} />
    </TouchableOpacity>
  );
}
