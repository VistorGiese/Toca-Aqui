import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { getGenreColor } from "@/utils/colors";
import { GIG_GENRES } from "../constants";
import { styles } from "../styles";

interface Props {
  selected: string[];
  onToggle: (genre: string) => void;
  error?: string;
}

export default function EstNewGigGenresSection({ selected, onToggle, error }: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>GÊNEROS MUSICAIS</Text>
      <View style={[styles.chipRow, error ? styles.chipRowError : null]}>
        {GIG_GENRES.map((g) => {
          const active = selected.includes(g);
          const color = getGenreColor(g.toUpperCase());
          return (
            <TouchableOpacity
              key={g}
              style={[styles.chip, { borderColor: color }, active && { backgroundColor: color + "33" }]}
              onPress={() => onToggle(g)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color }]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FieldError message={error} />
    </>
  );
}
