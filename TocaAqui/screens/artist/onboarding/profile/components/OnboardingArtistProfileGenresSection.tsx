import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { getGenreColor } from "@/utils/colors";
import { GENEROS_OPCOES } from "../constants";
import { styles } from "../styles";

interface Props {
  selected: string[];
  error?: string;
  onToggle: (genre: string) => void;
}

export default function OnboardingArtistProfileGenresSection({
  selected,
  error,
  onToggle,
}: Props) {
  return (
    <>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionLabel}>GÊNEROS MUSICAIS</Text>
        <Text style={styles.multiLabel}>MÚLTIPLA ESCOLHA</Text>
      </View>
      <View style={error ? styles.generosErrorWrap : undefined}>
        <View style={styles.generoGrid}>
          {GENEROS_OPCOES.map((genre) => {
            const active = selected.includes(genre);
            const color = getGenreColor(genre.toUpperCase());
            return (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.generoPill,
                  { borderColor: color },
                  active && { backgroundColor: color + "33" },
                ]}
                onPress={() => onToggle(genre)}
                activeOpacity={0.7}
              >
                <Text style={[styles.generoText, { color }]}>{genre.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FieldError message={error} />
    </>
  );
}
