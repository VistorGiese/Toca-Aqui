import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DS, HIGHLIGHT_CHIPS } from "../constants";
import { styles } from "../styles";

interface Props {
  selectedChips: string[];
  onToggle: (label: string) => void;
}

export default function HighlightsSection({ selectedChips, onToggle }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Destaques da noite</Text>
      <View style={styles.chipsGrid}>
        {HIGHLIGHT_CHIPS.map((chip) => {
          const selected = selectedChips.includes(chip.label);
          const activeColor = chip.positive ? DS.success : DS.danger;

          return (
            <TouchableOpacity
              key={chip.label}
              style={[
                styles.chip,
                selected && {
                  borderColor: activeColor,
                  backgroundColor: `${activeColor}22`,
                },
              ]}
              onPress={() => onToggle(chip.label)}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name={chip.positive ? "check" : "times"}
                size={11}
                color={selected ? activeColor : DS.textDis}
              />
              <Text style={[styles.chipText, selected && { color: activeColor }]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
