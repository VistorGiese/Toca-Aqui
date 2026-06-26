import React from "react";
import { Text, View } from "react-native";
import { getGenreColor } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  generos: string[];
}

export default function UserArtistProfileGenresSection({ generos }: Props) {
  if (generos.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gêneros musicais</Text>
      <View style={styles.chipsWrap}>
        {generos.map((genre) => {
          const color = getGenreColor(genre.toUpperCase());
          return (
            <View
              key={genre}
              style={[styles.chip, { borderColor: color + "88", backgroundColor: color + "18" }]}
            >
              <Text style={[styles.chipText, { color }]}>{genre.toUpperCase()}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
