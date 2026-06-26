import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getGenreColor } from "@/utils/colors";
import { resolveImageUrl } from "@/utils/adapters";
import { DS } from "../constants";
import { styles } from "../styles";
import { Band } from "../types";

interface Props {
  band: Band;
  onPress: (bandId: number) => void;
}

export default function ArtistMyBandsBandCard({ band, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(band.id)}
      activeOpacity={0.8}
    >
      {band.imagem ? (
        <Image source={{ uri: resolveImageUrl(band.imagem)! }} style={styles.bandImage} />
      ) : (
        <View style={styles.bandImagePlaceholder}>
          <FontAwesome5 name="users" size={22} color={DS.accent} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.bandName}>{band.nome_banda}</Text>
        {Array.isArray(band.generos_musicais) && band.generos_musicais.length > 0 && (
          <View style={styles.genreRow}>
            {band.generos_musicais.slice(0, 3).map((genre) => (
              <View
                key={genre}
                style={[styles.genrePill, { backgroundColor: getGenreColor(genre) }]}
              >
                <Text style={styles.genrePillText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}
        {band.descricao && (
          <Text style={styles.bandDesc} numberOfLines={2}>
            {band.descricao}
          </Text>
        )}
      </View>
      <FontAwesome5 name="chevron-right" size={14} color={DS.textDis} />
    </TouchableOpacity>
  );
}
