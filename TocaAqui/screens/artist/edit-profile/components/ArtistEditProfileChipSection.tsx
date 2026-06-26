import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FieldError from "@/components/ui/FieldError";
import { styles } from "../styles";

interface Props {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
  error?: string;
}

export default function ArtistEditProfileChipSection({
  title,
  options,
  selected,
  onToggle,
  error,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={error ? styles.generosErrorWrap : undefined}>
        <View style={styles.chipRow}>
          {options.map((option) => {
            const active = selected.includes(option);
            return (
              <TouchableOpacity
                key={option}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onToggle(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FieldError message={error} />
    </>
  );
}
