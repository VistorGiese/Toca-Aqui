import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { GENEROS_OPCOES } from "../constants";
import { styles } from "../styles";

interface Props {
  selected: string[];
  onToggle: (label: string) => void;
  error?: string;
}

export default function ArtistEditProfileGenresSection({ selected, onToggle, error }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Gêneros musicais</Text>
      <View style={error ? styles.generosErrorWrap : undefined}>
        <View style={styles.chipRow}>
          {GENEROS_OPCOES.map((genre) => {
            const active = selected.includes(genre);
            return (
              <TouchableOpacity
                key={genre}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onToggle(genre)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{genre}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FieldError message={error} />
    </>
  );
}
