import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { GENRE_OPTIONS } from "../constants";

interface Props {
  selected: string[];
  onToggle: (label: string) => void;
}

export default function EstGenreChips({ selected, onToggle }: Props) {
  return (
    <View style={styles.grid}>
      {GENRE_OPTIONS.map((g) => {
        const active = selected.includes(g.label);
        return (
          <TouchableOpacity
            key={g.label}
            style={[styles.pill, { borderColor: g.color }, active && { backgroundColor: g.color + "33" }]}
            onPress={() => onToggle(g.label)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, { color: g.color }]}>{g.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  text: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
