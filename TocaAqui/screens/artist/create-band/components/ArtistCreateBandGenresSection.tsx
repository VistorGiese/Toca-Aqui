import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { getGenreColor } from "@/utils/colors";
import { AVAILABLE_GENRES } from "../constants";
import { styles } from "../styles";

interface Props {
  selectedGenres: string[];
  generosError: string;
  onToggle: (genre: string) => void;
}

export default function ArtistCreateBandGenresSection({
  selectedGenres,
  generosError,
  onToggle,
}: Props) {
  return (
    <>
      <View style={styles.genreLabelRow}>
        <Text style={styles.genreLabel}>Gêneros musicais</Text>
      </View>
      <FieldError message={generosError} />

      <View style={styles.genreContainer}>
        {AVAILABLE_GENRES.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          const genreColor = getGenreColor(genre);
          return (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreChip,
                isSelected
                  ? { backgroundColor: genreColor, borderColor: genreColor }
                  : styles.genreChipUnselected,
              ]}
              onPress={() => onToggle(genre)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.genreChipText,
                  isSelected ? styles.genreChipTextSelected : styles.genreChipTextUnselected,
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
