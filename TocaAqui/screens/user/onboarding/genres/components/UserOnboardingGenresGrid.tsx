import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, GENRES } from "../constants";
import { styles } from "../styles";

type Props = {
  selected: string[];
  onToggle: (key: string) => void;
};

export default function UserOnboardingGenresGrid({ selected, onToggle }: Props) {
  return (
    <View style={styles.grid}>
      {GENRES.map((genre) => {
        const isSelected = selected.includes(genre.key);
        return (
          <TouchableOpacity
            key={genre.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onToggle(genre.key)}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={genre.icon as any}
              size={18}
              color={isSelected ? DS.accent : DS.textDis}
              style={styles.chipIcon}
            />
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {genre.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
