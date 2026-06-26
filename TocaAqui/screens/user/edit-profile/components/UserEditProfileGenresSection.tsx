import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import FieldError from "@/components/ui/FieldError";
import { USER_EDIT_PROFILE_GENRES, USER_EDIT_PROFILE_MIN_GENRES } from "../constants";
import { styles } from "../styles";

interface Props {
  selected: string[];
  onToggle: (key: string) => void;
  error?: string;
}

export default function UserEditProfileGenresSection({ selected, onToggle, error }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Gêneros favoritos</Text>
      <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>
          Selecione pelo menos {USER_EDIT_PROFILE_MIN_GENRES}
        </Text>
        <Text style={styles.counterValue}>
          {selected.length} selecionado{selected.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={error ? styles.generosErrorWrap : undefined}>
        <View style={styles.genreGrid}>
          {USER_EDIT_PROFILE_GENRES.map((genre) => {
            const isSelected = selected.includes(genre.key);
            return (
              <TouchableOpacity
                key={genre.key}
                style={[styles.genreChip, isSelected && styles.genreChipSelected]}
                onPress={() => onToggle(genre.key)}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={genre.icon as "music"}
                  size={18}
                  color={isSelected ? "#A78BFA" : "#888"}
                  style={styles.genreChipIcon}
                />
                <Text style={[styles.genreChipText, isSelected && styles.genreChipTextSelected]}>
                  {genre.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FieldError message={error} />
    </>
  );
}
