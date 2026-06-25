import React from "react";
import { Text, View } from "react-native";
import { getGenreColor } from "@/utils/colors";
import { styles } from "../styles";

interface Props {
  generos: string[];
}

export default function EstProfileGenresSection({ generos }: Props) {
  if (generos.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gêneros preferidos</Text>
      <View style={styles.chipsWrap}>
        {generos.map((g) => {
          const color = getGenreColor(g);
          return (
            <View
              key={g}
              style={[styles.chip, { backgroundColor: color + "22", borderColor: color + "55" }]}
            >
              <Text style={[styles.chipText, { color }]}>{g}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
