import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Show } from "@/http/showService";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";
import { DS } from "../constants";
import { formatShowDate } from "../utils";
import { styles } from "../styles";

interface Props {
  show: Show;
  onPress: (show: Show) => void;
}

export default function EstHomeShowCard({ show, onPress }: Props) {
  const { dia, mes } = formatShowDate(show.data_show);
  const generos = parseGenres(show.genero_musical);
  const genero = generos[0] ?? "SHOW";
  const genreColor = getGenreColor(genero);
  const horario = show.horario_inicio?.substring(0, 5) ?? "--:--";

  return (
    <TouchableOpacity
      style={[styles.showCard, { borderLeftColor: genreColor }]}
      onPress={() => onPress(show)}
      activeOpacity={0.8}
    >
      <View style={[styles.dateBadge, { borderColor: genreColor + "55" }]}>
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
          <Text style={styles.confirmedBadgeText}>Artista contratado</Text>
        </View>
        {generos.length > 0 && (
          <View style={styles.genreRow}>
            {generos.map((genre) => {
              const color = getGenreColor(genre);
              return (
                <View key={`${show.id}-${genre}`} style={[styles.genreBadge, { borderColor: color }]}>
                  <Text style={[styles.genreBadgeText, { color }]}>{genre}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <FontAwesome5 name="chevron-right" size={12} color={DS.textSecondary} />
    </TouchableOpacity>
  );
}
