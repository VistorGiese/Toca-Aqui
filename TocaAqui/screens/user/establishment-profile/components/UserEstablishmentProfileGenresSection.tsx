import React from "react";
import { Text, View } from "react-native";
import { getGenreColor } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  generos: string[];
}

export default function UserEstablishmentProfileGenresSection({ generos }: Props) {
  if (generos.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gêneros musicais</Text>
      <View style={styles.genreRow}>
        {generos.map((genre) => {
          const color = getGenreColor(genre);
          return (
            <View key={genre} style={[styles.genreChip, { borderColor: color }]}>
              <Text style={[styles.genreChipText, { color }]}>{genre}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
