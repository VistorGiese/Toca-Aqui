import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/utils/colors";

type Props = {
  items: string[];
  emptyLabel?: string;
  accent?: string;
};

export default function ChipRow({ items, emptyLabel = "Nenhum item", accent = colors.purplePrimary }: Props) {
  if (items.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item} style={[styles.chip, { borderColor: `${accent}66` }]}>
          <Text style={[styles.chipText, { color: accent }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  chipText: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 12,
  },
  empty: {
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: "italic",
  },
});
