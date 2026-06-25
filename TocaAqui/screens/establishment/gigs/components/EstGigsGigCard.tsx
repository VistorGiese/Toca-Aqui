import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Gig, isGigAberta } from "@/http/establishmentService";
import { getGenreColor } from "@/utils/colors";
import { parseGenres } from "@/utils/genres";
import { DS } from "../constants";
import { formatCacheRange, formatGigDate } from "../utils";
import { styles } from "../styles";

interface Props {
  gig: Gig;
  onPress: (gig: Gig) => void;
  onOptions: (gig: Gig) => void;
}

export default function EstGigsGigCard({ gig, onPress, onOptions }: Props) {
  const generoRaw = gig.generos_musicais ?? gig.genero_musical ?? "";
  const generos = parseGenres(generoRaw);
  const fallbackGenre = generos[0] ?? "SHOW";
  const fallbackColor = getGenreColor(fallbackGenre);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(gig)} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.genreRow}>
          {generos.length > 0 ? (
            generos.map((genre) => {
              const genreColor = getGenreColor(genre);
              return (
                <View
                  key={`${gig.id}-${genre}`}
                  style={[styles.genreBadge, { borderColor: genreColor }]}
                >
                  <Text style={[styles.genreBadgeText, { color: genreColor }]}>{genre}</Text>
                </View>
              );
            })
          ) : (
            <View style={[styles.genreBadge, { borderColor: fallbackColor }]}>
              <Text style={[styles.genreBadgeText, { color: fallbackColor }]}>{fallbackGenre}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => onOptions(gig)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name="ellipsis-v" size={16} color={DS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle}>{gig.titulo_evento}</Text>

      <View style={styles.cardMeta}>
        <FontAwesome5 name="calendar" size={11} color={DS.textSecondary} />
        <Text style={styles.cardMetaText}>{formatGigDate(gig.data_show)}</Text>
      </View>

      <View style={styles.cardMeta}>
        <FontAwesome5 name="dollar-sign" size={11} color={DS.cyan} />
        <Text style={[styles.cardMetaText, styles.cardMetaTextHighlight]}>
          {formatCacheRange(gig.cache_minimo, gig.cache_maximo)}
        </Text>
      </View>

      {gig.status === "aceito" && (
        <View style={[styles.badge, styles.badgeContratado]}>
          <FontAwesome5
            name="check-circle"
            size={10}
            color={DS.success}
            style={styles.badgeIcon}
          />
          <Text style={[styles.badgeText, styles.badgeTextSuccess]}>Artista contratado</Text>
        </View>
      )}

      {isGigAberta(gig.status) && (gig.candidaturas_count ?? 0) > 0 && (
        <View style={styles.badge}>
          <FontAwesome5 name="users" size={10} color={DS.textSecondary} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>{gig.candidaturas_count} candidaturas</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
